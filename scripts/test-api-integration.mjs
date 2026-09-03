// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
// Owned loopback backend for repeatable adapter integration. No consumer .env/database is used.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createTaskApi as reactApi } from '../starters/web/src/adapters/task-api.js';
import { createTaskApi as vanillaApi } from '../starters/web-vanilla/src/adapters/task-api.js';
import { createHttpTaskRepository } from '../starters/web-vanilla/src/adapters/http-task-repository.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const backend = path.join(root, 'starters/backend-php');
const temporary = await mkdtemp(path.join(tmpdir(), 'foundation-api-'));
const db = path.join(temporary, 'test.sqlite');
await writeFile(db, '', { flag: 'wx' });
const environment = { ...process.env, APP_ENV: 'testing', APP_DEBUG: 'false', LOG_CHANNEL: 'null',
  APP_KEY: 'base64:' + randomBytes(32).toString('base64'), DB_CONNECTION: 'sqlite', DB_DATABASE: db,
  APP_CONFIG_CACHE: path.join(temporary, 'config.php'), APP_ROUTES_CACHE: path.join(temporary, 'routes.php'),
  API_ALLOWED_ORIGINS: 'http://127.0.0.1:5180,http://127.0.0.1:5173',
};
async function command(args, capture = false, expectedExit = 0) {
  return await new Promise((resolve, reject) => {
    let output = '';
    const child = spawn('php', args, { cwd: backend, env: environment, windowsHide: true, stdio: ['ignore', capture ? 'pipe' : 'ignore', 'ignore'] });
    if (capture) child.stdout.on('data', data => { output += data.toString(); });
    child.on('error', reject); child.on('exit', code => code === expectedExit ? resolve(output) : reject(new Error('Fixture command failed: ' + args[0] + ' ' + args[1] + ' (exit ' + code + ')')));
  });
}
let server; let closed = false;
async function close() {
  if (closed) return; closed = true;
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill(); await exited;
  }
  // Only this invocation's uniquely created fixture directory is removed.
  assert.equal(path.dirname(temporary), path.resolve(tmpdir()));
  assert.ok(path.basename(temporary).startsWith('foundation-api-'));
  await rm(temporary, { recursive: true });
}
try {
  const specs = await Promise.all(['web', 'web-vanilla', 'flutter', 'kotlin-android', 'backend-php', 'backend-node']
    .map(name => readFile(path.join(root, 'starters', name, 'contracts/task-api-v1.openapi.json'), 'utf8')));
  for (const spec of specs) assert.equal(spec, specs[0]);
  await command(['artisan', 'migrate', '--force', '--no-interaction']);
  const credential = JSON.parse(await command(['scripts/token.php', 'issue', 'integration-owner', 'editor', '3600'], true));
  const reader = JSON.parse(await command(['scripts/token.php', 'issue', 'integration-owner', 'reader', '3600'], true));
  const other = JSON.parse(await command(['scripts/token.php', 'issue', 'another-owner', 'editor', '3600'], true));
  const localSettings = { APP_ENV: environment.APP_ENV, APP_URL: environment.APP_URL,
    API_ALLOWED_ORIGINS: environment.API_ALLOWED_ORIGINS, APP_CONFIG_CACHE: environment.APP_CONFIG_CACHE, APP_ROUTES_CACHE: environment.APP_ROUTES_CACHE };
  Object.assign(environment, { APP_ENV: 'production', APP_URL: 'https://api.example.test', API_ALLOWED_ORIGINS: 'https://app.example.test',
    APP_CONFIG_CACHE: path.join(temporary, 'production-config.php'), APP_ROUTES_CACHE: path.join(temporary, 'production-routes.php') });
  await command(['artisan', 'config:cache']);
  await command(['artisan', 'route:cache']);
  const production = JSON.parse(await command(['scripts/check-production.php'], true, 1));
  assert.deepEqual(production.failures, ['DEVELOPMENT_DEPENDENCIES_PRESENT']);
  assert.equal(production.productionApproved, false);
  Object.assign(environment, localSettings);
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  server = spawn('php', ['-S', '127.0.0.1:' + port, '-t', 'public', 'public/index.php'], {
    cwd: backend, env: environment, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server start timeout')), 10000);
    server.on('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', () => { clearTimeout(timer); reject(new Error('Owned server exited')); });
    server.stderr.on('data', data => { if (data.toString().includes('Development Server') && data.toString().includes('started')) { clearTimeout(timer); resolve(); } });
  });
  const url = 'http://127.0.0.1:' + port + '/api/v1';
  const tokenProvider = () => credential.token;
  const first = reactApi(url, undefined, undefined, tokenProvider), second = vanillaApi(url, undefined, undefined, tokenProvider);
  assert.equal((await fetch(url + '/tasks')).status, 401);
  assert.deepEqual(await first.list(), []);
  const created = await first.create('Integration Café 🙂');
  const stale = (await second.list())[0];
  assert.equal(stale.id, created.id);
  const changed = await first.replace(created, true);
  await assert.rejects(second.replace(stale, false), { code: 'VERSION_CONFLICT' });
  assert.equal((await vanillaApi(url, undefined, undefined, tokenProvider).list())[0].completed, true);
  await assert.rejects(reactApi(url, undefined, undefined, () => reader.token).create('Denied'), { code: 'FORBIDDEN' });
  assert.deepEqual(await reactApi(url, undefined, undefined, () => other.token).list(), []);
  const repository = createHttpTaskRepository(url, tokenProvider);
  assert.equal((await repository.list())[0].createdAtMs, null);
  const confirmed = await repository.update(created.id, task => ({ ...task, completed: false }));
  assert.equal(confirmed.completed, false);
  const another = await repository.add({ title: 'From vanilla', id: 'ignored-local-id', completed: false, createdAtMs: 123 });
  assert.notEqual(another.id, 'ignored-local-id');
  assert.equal(another.createdAtMs, null);
  const preflight = await fetch(url + '/tasks', { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:5180', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Content-Type' } });
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5180');
  for (const row of await first.list()) {
    const deleted = await fetch(url + '/tasks/' + row.id, { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + credential.token }, body: JSON.stringify({ version: row.version }) });
    assert.equal(deleted.status, 204);
  }
  assert.equal(changed.version, 2);
  await command(['scripts/token.php', 'revoke', other.token_id]);
  await assert.rejects(reactApi(url, undefined, undefined, () => other.token).list(), { code: 'UNAUTHENTICATED' });
  console.log('PASS: authenticated HTTP CRUD, permissions, owner isolation, revocation, production-profile gate, contract copies, conflict, unknown time, server IDs, CORS.');
  if (process.argv.includes('--serve')) {
    console.log('READY ' + url);
    // This private fixture file is removed with the database; never log its contents.
    const credentialPath = path.join(temporary, 'credential.json');
    await writeFile(credentialPath, JSON.stringify(credential), { flag: 'wx', mode: 0o600 });
    console.log('PRIVATE_CREDENTIAL_FILE ' + credentialPath);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async data => { if (data.trim() === 'stop') { await close(); process.exit(0); } });
    process.on('SIGINT', async () => { await close(); process.exit(0); });
    process.on('SIGTERM', async () => { await close(); process.exit(0); });
    // Owned fixture is limited to 30 minutes even if its caller disappears.
    setTimeout(async () => { await close(); process.exit(0); }, 30 * 60 * 1000);
  } else { await close(); }
} catch (error) { await close(); throw error; }
