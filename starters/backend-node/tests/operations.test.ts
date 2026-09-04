// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { issueToken, tokenHash } from '../src/application.js';
import { createApiServer } from '../src/server.js';
import { call, lab, listen, stop } from './lab.js';

const engine = process.env.NODE_LAB_ENGINE ?? 'sqlite';
if (!['sqlite', 'postgresql', 'mysql'].includes(engine)) throw new Error('Unknown test engine');
test(`isolated ${engine}: HTTPS, negative API, shared limiting, concurrency and native recovery`, { timeout: 240000 }, async () => {
  const f = await lab(engine as 'sqlite' | 'postgresql' | 'mysql');
  const servers: ReturnType<typeof createApiServer>[] = [];
  try {
    const source = await f.database('source');
    const owner = await issueToken(source.store, 'Owner', ['tasks:read', 'tasks:write']);
    const other = await issueToken(source.store, 'owner', ['tasks:read', 'tasks:write']);
    const reader = await issueToken(source.store, 'Owner', ['tasks:read']);
    const expired = 'a'.repeat(64); await source.store.issue(tokenHash(expired), 'Owner', ['tasks:read'], 1);
    const server = createApiServer(source.store, ['https://client.example'], undefined, f.tls); servers.push(server);
    const port = await listen(server), ca = f.tls.cert;
    const api = (path: string, token = owner, method = 'GET', payload?: unknown) => call(port, ca, path, token, method, payload);
    assert.equal((await api('/api/health')).status, 200);
    await assert.rejects(call(port, undefined, '/api/health'));
    await assert.rejects(call(port, ca, '/api/health', '', 'GET', undefined, {}, 'wrong.example'));
    const expiredServer = createApiServer(source.store, [], undefined, f.expiredTls); servers.push(expiredServer);
    await assert.rejects(call(await listen(expiredServer), f.expiredTls.cert, '/api/health'), { code: 'CERT_HAS_EXPIRED' });
    assert.equal((await api('/api/v1/tasks', '')).status, 401);
    assert.equal((await api('/api/v1/tasks', expired)).status, 401);
    assert.equal((await api('/api/v1/tasks', reader, 'POST', { title: 'Denied' })).status, 403);
    for (const payload of [{ title: '' }, { title: 'x', extra: true }, { title: '\ud800' }, { title: 'x'.repeat(81) }]) assert.equal((await api('/api/v1/tasks', owner, 'POST', payload)).status, 422);
    assert.equal((await api('/api/v1/tasks?limit=1&limit=2')).status, 422);
    assert.equal((await api('/api/v1/tasks?unknown=1')).status, 422);
    assert.equal((await api('/api/v1/tasks/not-a-uuid')).status, 422);
    assert.equal((await api('/api/v1/tasks', owner, 'POST', ['not an object'])).status, 400);
    assert.equal((await call(port, ca, '/api/v1/tasks', owner, 'POST', { title: 'No' }, { 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await api('/api/v1/tasks', owner, 'POST', { title: 'x'.repeat(9000) })).status, 413);
    const created = await api('/api/v1/tasks', owner, 'POST', { title: 'Tarea ñ 🙂' }); assert.equal(created.status, 201);
    const task = JSON.parse(created.body).data as { id: string };
    for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await api(`/api/v1/tasks/${task.id}`, other, method, method === 'GET' ? undefined : method === 'DELETE' ? { version: 1 } : { title: 'No', completed: true, version: 1 })).status, 404);
    const updates = await Promise.all(Array.from({ length: 12 }, () => api(`/api/v1/tasks/${task.id}`, owner, 'PUT', { title: 'Updated ñ', completed: true, version: 1 })));
    assert.equal(updates.filter(r => r.status === 200).length, 1); assert.equal(updates.filter(r => r.status === 409).length, 11);
    const creations = await Promise.all(Array.from({ length: 24 }, (_, i) => api('/api/v1/tasks', owner, 'POST', { title: `Synthetic ${i}` })));
    assert.ok(creations.every(r => r.status === 201)); assert.equal(new Set(creations.map(r => JSON.parse(r.body).data.id)).size, 24);
    const second = await source.another();
    const window = Math.floor(Date.now() / 60000), key = 'b'.repeat(64);
    const allowances = await Promise.all(Array.from({ length: 24 }, (_, i) => (i % 2 ? source.store : second).consume(key, window, 5)));
    assert.equal(allowances.filter(Boolean).length, 5);
    assert.equal(await second.consume(key, window, 5), false);
    // Separate HTTP instances share an actual persisted 120-request budget.
    const limited = (store: typeof source.store) => new Proxy(store, { get(target, property) {
      if (property === 'consume') return (_key: string, _window: number, limit: number) => target.consume('d'.repeat(64), window, limit);
      const value = Reflect.get(target, property) as unknown; return typeof value === 'function' ? value.bind(target) : value;
    } });
    const firstLimited = createApiServer(limited(source.store), [], undefined, f.tls);
    const secondLimited = createApiServer(limited(second), [], undefined, f.tls); servers.push(firstLimited, secondLimited);
    const ports = [await listen(firstLimited), await listen(secondLimited)];
    const burst = await Promise.all(Array.from({ length: 144 }, (_, i) => call(ports[i % 2]!, ca, '/api/v1/auth/session', owner)));
    assert.equal(burst.filter(r => r.status === 200).length, 120); assert.equal(burst.filter(r => r.status === 429).length, 24);
    assert.ok(burst.filter(r => r.status === 429).every(r => r.headers['retry-after'] === '60'));
    const target = await f.database('restored'); await f.restore(source, target);
    await source.store.create('Owner', { id: randomUUID(), title: 'After backup', completed: false, version: 1 });
    assert.equal((await target.store.list('Owner', 100)).data.length, 25);
    const principal = await target.store.authenticate(tokenHash(owner), Math.floor(Date.now() / 1000)); assert.ok(principal);
    assert.equal(await target.store.schemaVersion(), 1);
    await target.store.revokeAll();
    const recoveredToken = await issueToken(target.store, 'Owner', ['tasks:read', 'tasks:write']);
    const recovered = createApiServer(target.store, [], undefined, f.tls); servers.push(recovered); const recoveredPort = await listen(recovered);
    assert.equal((await call(recoveredPort, ca, '/api/v1/tasks', owner)).status, 401);
    assert.equal((await call(recoveredPort, ca, '/api/v1/tasks', reader)).status, 401);
    assert.equal((await call(recoveredPort, ca, '/api/v1/tasks', other)).status, 401);
    const loaded = await call(recoveredPort, ca, `/api/v1/tasks/${task.id}`, recoveredToken); assert.equal(loaded.status, 200); assert.equal(JSON.parse(loaded.body).data.title, 'Updated ñ');
    assert.equal((await call(recoveredPort, ca, `/api/v1/tasks/${task.id}`, recoveredToken, 'PUT', { title: 'Recovered', completed: false, version: 2 })).status, 200);
    assert.equal((await source.store.find('Owner', task.id))?.version, 2);
    assert.equal((await call(recoveredPort, ca, `/api/v1/tasks/${task.id}`, recoveredToken, 'DELETE', { version: 2 })).status, 409);
    assert.equal((await call(recoveredPort, ca, `/api/v1/tasks/${task.id}`, recoveredToken, 'DELETE', { version: 3 })).status, 204);
    assert.equal((await call(recoveredPort, ca, `/api/v1/tasks/${task.id}`, recoveredToken)).status, 404);
  } finally {
    try { const outcomes = await Promise.allSettled(servers.map(stop)); assert.ok(outcomes.every(result => result.status === 'fulfilled')); }
    finally { await f.close(); }
  }
});
