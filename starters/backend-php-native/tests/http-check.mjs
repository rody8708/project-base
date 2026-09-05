// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { mkdtemp, rm, realpath, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { existsSync } from 'node:fs';

// Repository-only cross-starter acceptance is additional to the standalone suite.
const sharedModule = new URL('../../../scripts/lib/check-client-contract.mjs', import.meta.url);
const shared = existsSync(sharedModule) ? await import(sharedModule.href) : null;

const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.includes('--browser') && !process.stdin.isTTY) throw new Error('Browser acceptance requires an interactive terminal for safe shutdown.');
const temporary = await realpath(tmpdir());
const folder = await mkdtemp(path.join(temporary, 'native-php-http-'));
const tokens = Object.fromEntries(['OWNER', 'OTHER', 'READER', 'EXPIRED', 'REVOKED'].map(key => [key, randomBytes(32).toString('hex')]));
const environment = { ...process.env, NATIVE_PHP_ENGINE: 'sqlite', NATIVE_PHP_DATABASE: path.join(folder, 'synthetic.sqlite'),
  API_ALLOWED_ORIGINS: 'http://127.0.0.1:5180',
  ...Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`TEST_TOKEN_${key}`, value])) };
let child;
let browserFixture;
try {
  const databaseCommand = action => spawnSync('php', ['scripts/database.php', action, path.join(folder, 'prepared.sqlite')], { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(databaseCommand('init').status, 0, 'Database CLI initializes');
  assert.equal(databaseCommand('init').status, 1, 'Database CLI refuses existing targets');
  assert.equal(databaseCommand('up').status, 0, 'Database CLI migration replay');
  if (shared) assert.deepEqual(await readFile(path.join(root, 'contracts/task-api-v1.openapi.json')),
    await readFile(path.join(root, '../backend-php/contracts/task-api-v1.openapi.json')), 'Shared contract bytes');
  const fixture = spawnSync('php', ['tests/http-fixture.php'], { cwd: root, env: environment, encoding: 'utf8', windowsHide: true });
  assert.equal(fixture.status, 0, 'Synthetic fixture initialization failed');
  const tokenCommand = args => spawnSync('php', ['scripts/token.php', ...args], { cwd: root, encoding: 'utf8', windowsHide: true });
  const issuance = tokenCommand(['issue', environment.NATIVE_PHP_DATABASE, 'operator-owner', 'read-write', '3600', '--show-token']);
  assert.equal(issuance.status, 0, 'Operator CLI issuance');
  const operator = JSON.parse(issuance.stdout);
  const storedBytes = await readFile(environment.NATIVE_PHP_DATABASE);
  assert.equal(storedBytes.includes(Buffer.from(operator.token)), false, 'Operator token plaintext is absent from SQLite');
  assert.equal(storedBytes.includes(Buffer.from(operator.id)), true, 'Operator token hash is persisted');
  assert.ok(/^[0-9a-f]{64}$/.test(operator.token), 'Opaque operator token');
  assert.equal(tokenCommand(['issue', environment.NATIVE_PHP_DATABASE, 'operator-owner', 'read-write', '3600']).status, 1, 'Explicit secret output opt-in required');
  assert.equal(tokenCommand(['issue', environment.NATIVE_PHP_DATABASE, 'operator-owner', 'read-write', '86401', '--show-token']).status, 1, 'Excessive lifetime rejected');
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  if (process.argv.includes('--browser')) {
    if (!shared) throw new Error('Cross-starter browser acceptance runs from Project Base only.');
    const { browserCorsFixture } = await import('../../../scripts/lib/browser-cors-fixture.mjs');
    browserFixture = await browserCorsFixture(`http://127.0.0.1:${port}/api/v1`, tokens.OWNER);
    environment.API_ALLOWED_ORIGINS += ',' + browserFixture.allowed;
  }
  // No real environment files or developer database paths are loaded by PHP.
  child = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'public', 'public/router.php'], {
    cwd: root, env: environment, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true,
  });
  let failed = false;
  child.on('error', () => { failed = true; });
  child.stderr.resume();
  const request = async (route, method = 'GET', token = tokens.OWNER, body, extra = {}) => {
    const result = await fetch(`http://127.0.0.1:${port}${route}`, { method, signal: AbortSignal.timeout(3000),
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...extra },
      ...(body !== undefined ? { body } : {}),
    });
    return { status: result.status, headers: result.headers, body: result.status === 204 ? null : await result.json() };
  };
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (failed || child.exitCode !== null) throw new Error('Isolated PHP process failed');
    try { ready = (await request('/api/health')).status === 200; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(ready, 'Isolated HTTP server did not become ready');
  if (shared) await shared.checkClientContract({ url: `http://127.0.0.1:${port}/api/v1`, ownerToken: tokens.OWNER, readerToken: tokens.READER, otherToken: tokens.OTHER });
  if (browserFixture) {
    console.log(JSON.stringify({ allowedPage: browserFixture.allowed, blockedPage: browserFixture.blocked, instruction: 'Run both pages, then send stop to continue checks and cleanup.' }));
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { cleanup(); reject(new Error('Browser fixture deadline exceeded')); }, 600000);
      const receive = data => { if (data.toString().trim() === 'stop') { cleanup(); resolve(); } };
      const cleanup = () => { clearTimeout(timeout); process.stdin.off('data', receive); process.stdin.pause(); };
      process.stdin.on('data', receive);
    });
  }
  const corsHeaders = { Origin: 'http://127.0.0.1:5180', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Authorization, Content-Type' };
  const preflight = await request('/api/v1/tasks', 'OPTIONS', '', undefined, corsHeaders);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), corsHeaders.Origin);
  assert.equal(preflight.headers.get('access-control-allow-credentials'), null);
  const corsDenied = await request('/api/v1/tasks', 'GET', '', undefined, { Origin: corsHeaders.Origin });
  assert.equal(corsDenied.status, 401, 'CORS never replaces authentication');
  assert.equal(corsDenied.headers.get('access-control-allow-origin'), corsHeaders.Origin);
  for (const token of ['', tokens.EXPIRED, tokens.REVOKED, 'invalid']) {
    const result = await request('/api/v1/tasks', 'GET', token);
    assert.equal(result.status, 401);
    assert.equal(result.body.error.code, 'UNAUTHENTICATED');
    assert.equal(result.headers.get('www-authenticate'), 'Bearer');
  }
  assert.equal((await request('/api/v1/auth/session')).body.data.subject, 'owner-a');
  assert.equal((await request('/api/v1/auth/session', 'GET', operator.token)).body.data.subject, 'operator-owner');
  assert.equal((await request('/api/v1/tasks', 'POST', operator.token, '{"title":"Operator-created synthetic task"}')).status, 201);
  assert.equal(tokenCommand(['revoke', environment.NATIVE_PHP_DATABASE, operator.id]).status, 0, 'Operator revokes by hash');
  assert.equal((await request('/api/v1/tasks', 'GET', operator.token)).status, 401);
  assert.equal((await request('/api/v1/tasks?limit=1&limit=2')).status, 422, 'Duplicate query rejected');
  assert.equal((await request('/api/v1/tasks', 'POST', tokens.OWNER, '{"title":"first","title":"second"}')).status, 400, 'Duplicate JSON keys rejected');
  const suppliedId = '00000000-0000-4000-8000-000000000005';
  const metadata = await request('/api/v1/tasks', 'GET', tokens.OWNER, undefined, { 'Accept-Language': 'es;q=0,en-US;q=1', 'X-Request-Id': suppliedId });
  assert.equal(metadata.headers.get('content-language'), 'en-US');
  assert.equal(metadata.headers.get('x-request-id'), suppliedId);
  const methodDenied = await request('/api/v1/tasks', 'PUT', tokens.OWNER, '{}');
  assert.equal(methodDenied.status, 405);
  assert.equal(methodDenied.headers.get('allow'), 'GET, POST, OPTIONS');
  for (const [body, status] of [['[]', 400], ['{', 400], ['{"title":null}', 422], ['{"title":"valid","owner_id":"attack"}', 422], ['{"title":"'+ 'x'.repeat(9000)+'"}', 413]]) {
    assert.equal((await request('/api/v1/tasks', 'POST', tokens.OWNER, body)).status, status);
  }
  assert.equal((await request('/api/v1/tasks', 'POST', tokens.OWNER, '{}', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await request('/api/v1/tasks', 'GET', tokens.OWNER, undefined, { Origin: 'https://example.invalid' })).status, 403);
  const created = await request('/api/v1/tasks', 'POST', tokens.OWNER, JSON.stringify({ title: 'Prueba ñ' }));
  assert.equal(created.status, 201);
  assert.deepEqual(Object.keys(created.body.data).sort(), ['completed', 'id', 'title', 'version']);
  assert.match(created.headers.get('x-request-id'), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(created.headers.get('cache-control'), 'no-store');
  const route = created.headers.get('location');
  assert.equal((await request(route)).body.data.title, 'Prueba ñ');
  assert.equal((await request(route, 'GET', tokens.OTHER)).status, 404);
  assert.deepEqual((await request('/api/v1/tasks', 'GET', tokens.OTHER)).body.data, []);
  const update = JSON.stringify({ title: 'Updated', completed: true, version: 1 });
  assert.equal((await request(route, 'PUT', tokens.READER, update)).status, 403);
  assert.equal((await request(route, 'PUT', tokens.OWNER, update)).body.data.version, 2);
  assert.equal((await request(route, 'PUT', tokens.OWNER, update)).status, 409);
  assert.equal((await request(route, 'DELETE', tokens.OWNER, '{"version":1}')).status, 409);
  assert.equal((await request(route, 'DELETE', tokens.OWNER, '{"version":2}')).status, 204);
  assert.equal((await request(route)).status, 404);
  assert.equal((await request('/api/v1/auth/token', 'DELETE', tokens.OWNER, '{}')).status, 204);
  const denied = await request('/api/v1/tasks', 'GET', tokens.OWNER, undefined, { 'Accept-Language': 'es-419' });
  assert.equal(denied.status, 401);
  assert.equal(denied.headers.get('content-language'), 'es-419');
  assert.match(denied.body.error.message, /solicitud/);
  let throttled;
  for (let count = 0; count < 250; count++) {
    const result = await request('/api/v1/tasks', 'GET', 'invalid');
    if (result.status === 429) { throttled = result; break; }
    assert.equal(result.status, 401);
  }
  assert.ok(throttled, 'Unauthenticated HTTP requests must be rate limited');
  assert.equal(throttled.body.error.code, 'RATE_LIMITED');
  assert.ok(Number(throttled.headers.get('retry-after')) >= 1);
  assert.ok(Number(throttled.headers.get('retry-after')) <= 60);
  const spoofed = await request('/api/v1/tasks', 'GET', 'invalid', undefined, { 'X-Forwarded-For': '198.51.100.50' });
  assert.equal(spoofed.status, 429, 'Untrusted proxy header cannot bypass peer limit');
  assert.equal((await request('/api/health')).status, 200, 'Liveness remains available');
  console.log('PASS native PHP HTTP: CRUD, ownership, permissions, input limits, expiry, revocation, localization');
} finally {
  if (browserFixture) await browserFixture.close();
  if (child && child.exitCode === null && child.pid) {
    const stopped = once(child, 'exit');
    child.kill();
    await stopped;
  }
  assert.equal(path.dirname(await realpath(folder)), temporary);
  assert.ok(path.basename(folder).startsWith('native-php-http-'));
  await rm(folder, { recursive: true, force: false });
}
