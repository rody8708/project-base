// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { createTaskApi as reactApi } from '../../starters/web/src/adapters/task-api.js';
import { createTaskApi as vanillaApi } from '../../starters/web-vanilla/src/adapters/task-api.js';
import { createHttpTaskRepository } from '../../starters/web-vanilla/src/adapters/http-task-repository.js';

// Call only against an isolated, initially empty test identity. Never a customer account.
export async function checkClientContract({ url, ownerToken, readerToken, otherToken }) {
  const token = () => ownerToken;
  const first = reactApi(url, undefined, undefined, token);
  const second = vanillaApi(url, undefined, undefined, token);
  const requestId = '123e4567-e89b-42d3-a456-426614174000';
  const correlation = await fetch(url + '/tasks', { headers: { 'X-Request-Id': requestId }, signal: AbortSignal.timeout(5000) });
  assert.equal(correlation.status, 401);
  assert.equal(correlation.headers.get('x-request-id'), requestId);
  await correlation.arrayBuffer();
  assert.deepEqual(await first.list(), []);
  const created = await first.create('Integration Café 🙂');
  const stale = (await second.list())[0];
  assert.equal(stale.id, created.id);
  const changed = await first.replace(created, true);
  await assert.rejects(second.replace(stale, false), { code: 'VERSION_CONFLICT' });
  assert.equal((await second.list())[0].completed, true);
  await assert.rejects(reactApi(url, undefined, undefined, () => readerToken).create('Denied'), { code: 'FORBIDDEN' });
  assert.deepEqual(await reactApi(url, undefined, undefined, () => otherToken).list(), []);
  const repository = createHttpTaskRepository(url, token);
  assert.equal((await repository.list())[0].createdAtMs, null);
  const confirmed = await repository.update(created.id, task => ({ ...task, completed: false }));
  assert.equal(confirmed.completed, false);
  const another = await repository.add({ title: 'From vanilla', id: 'ignored-local-id', completed: false, createdAtMs: 123 });
  assert.notEqual(another.id, 'ignored-local-id');
  assert.equal(another.createdAtMs, null);
  const preflight = await fetch(url + '/tasks', { method: 'OPTIONS', signal: AbortSignal.timeout(5000), headers: {
    Origin: 'http://127.0.0.1:5180', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Content-Type, X-Request-Id',
  } });
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5180');
  assert.match(preflight.headers.get('access-control-allow-headers') ?? '', /X-Request-Id/iu);
  await preflight.arrayBuffer();
  for (const row of await first.list()) {
    const deleted = await fetch(url + '/tasks/' + row.id, { method: 'DELETE', signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ownerToken }, body: JSON.stringify({ version: row.version }),
    });
    assert.equal(deleted.status, 204);
  }
  assert.equal(changed.version, 2);
  assert.deepEqual(await first.list(), []);
}
