// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { once } from 'node:events';

const root = fileURLToPath(new URL('../', import.meta.url));
const distro = process.env.TEST_DOCKER_WSL;
const dockerTool = distro ? 'wsl' : 'docker';
const dockerPrefix = distro ? ['-d', distro, '--', 'docker'] : [];
const marker = randomBytes(6).toString('hex');
const owned = new Set();
const image = `project-base-native-sql-lab:${marker}`;
function docker(args, input, expected = 0) {
  const result = spawnSync(dockerTool, [...dockerPrefix, ...args], { input, windowsHide: true, encoding: 'utf8', timeout: 240000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, expected, `Docker ${args[0]} failed (details intentionally not logged)`);
  return result.stdout.trim();
}
function executeAsync(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(dockerTool, [...dockerPrefix, ...args], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    let output = ''; const timeout = setTimeout(() => { child.kill(); reject(new Error('SQL fixture deadline')); }, 30000);
    child.stdout.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', code => { clearTimeout(timeout); code === 0 ? resolve(output.trim()) : reject(new Error('SQL fixture failed')); });
  });
}
async function freePort() {
  const server = net.createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port;
}
try {
  // Explicit source-only archive: never includes .env, runtime state, credentials or dependencies.
  const archive = spawnSync('tar', ['-cf', '-', '-C', root, 'docker', 'app', 'scripts', 'tests', 'public', 'lang', 'database', 'bootstrap.php'], { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  assert.equal(archive.status, 0);
  docker(['build', '-t', image, '-f', 'docker/Dockerfile', '-'], archive.stdout);
  console.log('PASS isolated native PHP runtime build');
  for (const engine of ['pgsql', 'mysql']) {
    const databaseName = `native_test_${marker}`;
    const dbContainer = `native-sql-${engine}-${marker}`;
    owned.add(dbContainer);
    const password = randomBytes(24).toString('hex');
    const dbPort = engine === 'pgsql' ? 5432 : 3306;
    const config = engine === 'pgsql'
      ? ['--tmpfs', '/var/lib/postgresql', '-e', `POSTGRES_PASSWORD=${password}`, '-e', 'POSTGRES_USER=native_user', '-e', `POSTGRES_DB=${databaseName}`, 'postgres:18.6-bookworm']
      : ['--tmpfs', '/var/lib/mysql', '-e', `MYSQL_ROOT_PASSWORD=${randomBytes(24).toString('hex')}`, '-e', `MYSQL_PASSWORD=${password}`, '-e', 'MYSQL_USER=native_user', '-e', `MYSQL_DATABASE=${databaseName}`, 'mysql:8.4.11'];
    docker(['run', '-d', '--name', dbContainer, '--label', `project-base-test=${marker}`, '-p', `127.0.0.1::${dbPort}`, ...config]);
    const port = docker(['port', dbContainer, String(dbPort)]).split(':').at(-1);
    const tokens = Object.fromEntries(['OWNER', 'OTHER', 'READER', 'EXPIRED', 'REVOKED'].map(key => [key, randomBytes(32).toString('hex')]));
    const env = { NATIVE_PHP_ENGINE: engine, NATIVE_PHP_DB_HOST: '127.0.0.1', NATIVE_PHP_DB_PORT: port,
      NATIVE_PHP_DB_NAME: databaseName, NATIVE_PHP_DB_USER: 'native_user', NATIVE_PHP_DB_PASSWORD: password,
      ...Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`TEST_TOKEN_${key}`, value])) };
    const envArgs = Object.entries(env).flatMap(([key, value]) => ['-e', `${key}=${value}`]);
    const workerNames = [];
    const ports = [];
    for (let i = 0; i < 4; i++) {
      const worker = `native-api-${engine}-${marker}-${i}`; owned.add(worker); workerNames.push(worker);
      const apiPort = await freePort(); ports.push(apiPort);
      docker(['run', '-d', '--name', worker, '--label', `project-base-test=${marker}`, '--network', 'host', ...envArgs, image, '-S', `127.0.0.1:${apiPort}`, '-t', 'public', 'public/router.php']);
    }
    let ready = false, classification = '';
    for (let i = 0; i < 80; i++) {
      const result = spawnSync(dockerTool, [...dockerPrefix, 'exec', workerNames[0], 'php', 'tests/server-ready.php'], { windowsHide: true, encoding: 'utf8', timeout: 8000 });
      classification = result.stdout?.trim();
      if (result.status === 0) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert.ok(ready, `Owned SQL service must become ready: ${classification}`);
    docker(['exec', workerNames[0], 'php', 'tests/server-fixture.php']);
    docker(['exec', workerNames[0], 'php', 'scripts/database.php', 'server-up']);
    const issued = JSON.parse(docker(['exec', workerNames[0], 'php', 'scripts/token.php', 'issue', 'configured', 'operator-user', 'read-write', '3600', '--show-token']));
    let next = 0;
    const request = async (route, method = 'GET', body, token = tokens.OWNER) => {
      const response = await fetch(`http://127.0.0.1:${ports[next++ % ports.length]}${route}`, { method, signal: AbortSignal.timeout(5000),
        headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      return { status: response.status, body: response.status === 204 ? null : await response.json() };
    };
    assert.equal((await request('/api/health')).status, 200);
    assert.equal((await request('/api/v1/auth/session', 'GET', undefined, issued.token)).body.data.subject, 'operator-user');
    docker(['exec', workerNames[0], 'php', 'scripts/token.php', 'revoke', 'configured', issued.id]);
    assert.equal((await request('/api/v1/auth/session', 'GET', undefined, issued.token)).status, 401);
    for (const kind of ['EXPIRED', 'REVOKED']) assert.equal((await request('/api/v1/tasks', 'GET', undefined, tokens[kind])).status, 401);
    const created = await Promise.all(Array.from({ length: 24 }, (_, i) => request('/api/v1/tasks', 'POST', { title: `SQL ñ ${i}` })));
    assert.ok(created.every(result => result.status === 201), 'Concurrent SQL creates');
    assert.equal(new Set(created.map(result => result.body.data.id)).size, 24);
    const route = `/api/v1/tasks/${created[0].body.data.id}`;
    assert.equal((await request(route, 'GET', undefined, tokens.OTHER)).status, 404);
    assert.equal((await request('/api/v1/tasks', 'GET', undefined, tokens.OTHER)).body.data.length, 0);
    assert.equal((await request(route, 'PUT', { title: 'Denied', completed: true, version: 1 }, tokens.READER)).status, 403);
    const updates = await Promise.all(Array.from({ length: 12 }, () => request(route, 'PUT', { title: 'Updated ñ', completed: true, version: 1 })));
    assert.equal(updates.filter(result => result.status === 200).length, 1);
    assert.equal(updates.filter(result => result.status === 409).length, 11);
    assert.deepEqual((await request(route)).body.data, { id: created[0].body.data.id, title: 'Updated ñ', completed: true, version: 2 });
    assert.equal((await request(route, 'DELETE', { version: 1 })).status, 409);
    const page = (await request('/api/v1/tasks?limit=2')).body.data;
    assert.equal(page.length, 2);
    assert.equal((await request(`/api/v1/tasks?limit=2&after=${page[1].id}`)).body.data.some(task => page.some(previous => previous.id === task.id)), false);
    const temporary = (await request('/api/v1/tasks', 'POST', { title: 'Delete me' })).body.data;
    assert.equal((await request(`/api/v1/tasks/${temporary.id}`, 'DELETE', { version: 1 })).status, 204);
    assert.equal((await request('/api/v1/auth/token', 'DELETE', {})).status, 204);
    assert.equal((await request(route)).status, 401);
    const concurrent = await Promise.all(Array.from({ length: 12 }, (_, i) => executeAsync(['exec', workerNames[i % 4], 'php', 'tests/server-fixture.php', 'limiter'])));
    assert.equal(concurrent.filter(value => value === 'accepted').length, 5);
    assert.equal(concurrent.filter(value => value === 'limited').length, 7);
    docker(['exec', workerNames[0], 'php', 'tests/server-fixture.php', 'assert']);
    console.log(`PASS ${engine}: real HTTP CRUD, Unicode, pagination, ownership, permissions, expiry/revocation, 24 creates, 12 update contenders, 12 limiter connections, migration replay/checksum`);
    for (const name of [...workerNames, dbContainer]) { docker(['rm', '-f', '-v', name]); owned.delete(name); }
  }
} finally {
  for (const name of owned) {
    assert.ok(name.includes(marker));
    docker(['rm', '-f', '-v', name]);
  }
}
