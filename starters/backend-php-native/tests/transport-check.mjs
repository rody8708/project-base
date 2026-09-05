// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import net from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await realpath(tmpdir());
const folder = await mkdtemp(path.join(temporary, 'native-php-transport-'));
const openssl = process.env.TEST_OPENSSL || (process.platform === 'win32' && existsSync('C:/Program Files/Git/usr/bin/openssl.exe') ? 'C:/Program Files/Git/usr/bin/openssl.exe' : 'openssl');
const children = [];
let gateway;
const run = (command, args, env = process.env) => {
  const result = spawnSync(command, args, { cwd: folder, env, encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert.equal(result.status, 0, 'Isolated operator command must succeed');
  return result.stdout;
};
const php = (args, env) => run('php', args.map((arg, index) => index === 0 ? path.join(root, arg) : arg), env);
async function freePort() {
  const server = net.createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port;
}
try {
  run(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'server.key', '-out', 'server.crt', '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=IP:127.0.0.1,DNS:localhost']);
  const certificate = await readFile(path.join(folder, 'server.crt'));
  const database = path.join(folder, 'synthetic.sqlite');
  const tokens = Object.fromEntries(['OWNER', 'OTHER', 'READER', 'EXPIRED', 'REVOKED'].map(key => [`TEST_TOKEN_${key}`, randomBytes(32).toString('hex')]));
  const environment = { ...process.env, ...tokens, NATIVE_PHP_ENGINE: 'sqlite', NATIVE_PHP_DATABASE: database, API_ALLOWED_ORIGINS: '' };
  php(['tests/http-fixture.php'], environment);
  const ports = [];
  for (let i = 0; i < 8; i++) {
    const port = await freePort(); ports.push(port);
    const child = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'public', 'public/router.php'], { cwd: root, env: environment, windowsHide: true, stdio: 'ignore' });
    children.push(child);
    let failure; child.on('error', error => { failure = error; });
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      if (failure || child.exitCode !== null) throw new Error('Test worker failed');
      try { ready = (await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1000) })).status === 200; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    assert.ok(ready);
  }
  let next = 0;
  // Test-only TLS terminator. No forwarded identity, public bind or system trust changes.
  gateway = https.createServer({ key: await readFile(path.join(folder, 'server.key')), cert: certificate, minVersion: 'TLSv1.2' }, (incoming, outgoing) => {
    const port = ports[next++ % ports.length];
    const upstream = http.request({ hostname: '127.0.0.1', port, method: incoming.method, path: incoming.url,
      headers: { ...incoming.headers, host: `127.0.0.1:${port}` }, timeout: 5000 }, response => { outgoing.writeHead(response.statusCode, response.headers); response.pipe(outgoing); });
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', () => { outgoing.writeHead(502); outgoing.end(); });
    incoming.pipe(upstream);
  });
  gateway.listen(0, '127.0.0.1'); await once(gateway, 'listening');
  const request = (route, method = 'GET', body, token = tokens.TEST_TOKEN_OWNER, options = {}) => new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const req = https.request({ hostname: '127.0.0.1', port: gateway.address().port, path: route, method, ca: certificate, minVersion: 'TLSv1.2', agent: false,
      headers: { Authorization: `Bearer ${token}`, ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}) }, ...options }, res => {
      let text = ''; const protocol = res.socket.getProtocol();
      res.on('data', chunk => { text += chunk; });
      res.on('end', () => { try { resolve({ status: res.statusCode, body: text ? JSON.parse(text) : null, headers: res.headers, protocol }); } catch { reject(new Error('Invalid response')); } });
    });
    req.setTimeout(5000, () => req.destroy(new Error('Request deadline exceeded')));
    req.on('error', reject); req.end(data);
  });
  assert.ok(['TLSv1.2', 'TLSv1.3'].includes((await request('/api/health')).protocol));
  await assert.rejects(request('/api/health', 'GET', undefined, '', { ca: undefined }), error => ['DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN'].includes(error.code));
  await assert.rejects(request('/api/health', 'GET', undefined, '', { servername: 'wrong.invalid' }), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
  // Keep the bounded burst within one real fixed window; never alter runtime auth/time policy.
  const remaining = 60000 - Date.now() % 60000;
  if (remaining < 15000) await new Promise(resolve => setTimeout(resolve, remaining + 30));
  const window = Math.floor(Date.now() / 60000);
  const created = await Promise.all(Array.from({ length: 24 }, (_, i) => request('/api/v1/tasks', 'POST', { title: `Concurrent ñ ${i}` })));
  assert.ok(created.every(result => result.status === 201), 'All concurrent creates persist');
  assert.equal(new Set(created.map(result => result.body.data.id)).size, 24);
  const route = `/api/v1/tasks/${created[0].body.data.id}`;
  const updated = await Promise.all(Array.from({ length: 12 }, () => request(route, 'PUT', { title: 'Winner ñ', completed: true, version: 1 })));
  assert.equal(updated.filter(result => result.status === 200).length, 1);
  assert.equal(updated.filter(result => result.status === 409).length, 11);
  assert.equal((await request(route)).body.data.version, 2);
  assert.equal((await request('/api/v1/tasks?limit=100')).body.data.length, 24);
  const burst = await Promise.all(Array.from({ length: 144 }, () => request('/api/v1/tasks', 'GET', undefined, 'invalid')));
  assert.equal(Math.floor(Date.now() / 60000), window, 'Burst must fit one window');
  assert.equal(burst.filter(result => result.status === 401).length, 82);
  assert.equal(burst.filter(result => result.status === 429).length, 62);
  assert.ok(burst.filter(result => result.status === 429).every(result => Number(result.headers['retry-after']) >= 1));
  // Recovery via the real CLI, then serve the restored DB in a fresh worker.
  php(['scripts/recovery.php', 'snapshot', database, path.join(folder, 'snapshot')]);
  const restored = path.join(folder, 'restored.sqlite');
  php(['scripts/recovery.php', 'restore', path.join(folder, 'snapshot'), restored]);
  const issued = JSON.parse(php(['scripts/token.php', 'issue', restored, 'owner-a', 'read-write', '3600', '--show-token']));
  const port = await freePort();
  const restoredChild = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'public', 'public/router.php'], { cwd: root, env: { ...environment, NATIVE_PHP_DATABASE: restored }, windowsHide: true, stdio: 'ignore' });
  children.push(restoredChild); restoredChild.on('error', () => {});
  ports.splice(0, ports.length, port);
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { ready = (await request('/api/health')).status === 200; } catch {}
    if (ready) break; await new Promise(resolve => setTimeout(resolve, 40));
  }
  assert.ok(ready);
  assert.equal((await request(route)).status, 401, 'Restored old token rejected over TLS');
  assert.equal((await request(route, 'GET', undefined, issued.token)).body.data.title, 'Winner ñ');
  assert.equal((await request(route, 'PUT', { title: 'Restored ñ', completed: false, version: 2 }, issued.token)).body.data.version, 3);
  console.log('PASS native TLS: trusted certificate, untrusted/hostname rejection; 8 processes, 24 creates, 12 conflicting updates, shared 120-request limit; restored API read/update and revoked tokens');
} finally {
  if (gateway) { gateway.closeAllConnections(); await new Promise(resolve => gateway.close(resolve)); }
  for (const child of children) if (child.pid && child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  assert.equal(path.dirname(await realpath(folder)), temporary);
  assert.ok(path.basename(folder).startsWith('native-php-transport-'));
  await rm(folder, { recursive: true, force: false });
}
