import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { CONTENT_SECURITY_POLICY, isLocalAuthority, isLocalOrigin, parseServeArguments, startDevelopmentServer } from '../scripts/server.mjs';

const scripts = fileURLToPath(new URL('../scripts/', import.meta.url));
const mainBytes = 'export const value = "original";\n';

async function fixture(t) {
  const container = await fs.mkdtemp(path.join(os.tmpdir(), 'foundation-vanilla-http-'));
  const root = path.join(container, 'public');
  await fs.mkdir(path.join(root, 'src', 'i18n'), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(root, 'index.html'), '<!doctype html><html lang="es-419"><body>Fixture</body></html>'),
    fs.writeFile(path.join(root, 'styles.css'), 'body { color: black; }'),
    fs.writeFile(path.join(root, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>'),
    fs.writeFile(path.join(root, 'src', 'main.js'), mainBytes),
    fs.writeFile(path.join(root, 'src', 'i18n', 'en-US.js'), 'export const messages = {};'),
    fs.writeFile(path.join(root, '.env'), 'SYNTHETIC_FIXTURE_ONLY=not-public'),
    fs.writeFile(path.join(root, 'package.json'), '{"type":"module"}'),
  ]);
  const cleanup = [];
  t.after(async () => {
    for (const close of cleanup.reverse()) await close();
    assert.equal(path.dirname(container), os.tmpdir());
    assert.match(path.basename(container), /^foundation-vanilla-http-/);
    await fs.rm(container, { recursive: true, force: true });
  });
  return { root, container, addCleanup: (close) => cleanup.push(close) };
}

async function running(t) {
  const fixtureData = await fixture(t);
  const app = await startDevelopmentServer({ root: fixtureData.root, port: 0 });
  fixtureData.addCleanup(() => app.close());
  return { ...fixtureData, app };
}

function request(app, target = '/', { method = 'GET', headers = {} } = {}) {
  const address = new URL(app.url);
  return new Promise((resolve, reject) => {
    const outgoing = http.request({ hostname: '127.0.0.1', port: address.port, path: target, method, headers, agent: false }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on('error', reject);
    });
    outgoing.on('error', reject);
    outgoing.setTimeout(3000, () => outgoing.destroy(new Error('Fixture HTTP timeout.')));
    outgoing.end();
  });
}

function rawRequest(app, rawHeaders) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: '127.0.0.1', port: Number(new URL(app.url).port) });
    let response = '';
    socket.setTimeout(3000, () => socket.destroy(new Error('Fixture raw HTTP timeout.')));
    socket.on('connect', () => socket.write(`GET / HTTP/1.1\r\n${rawHeaders}\r\nConnection: close\r\n\r\n`));
    socket.on('data', (chunk) => { response += chunk; });
    socket.on('end', () => resolve(Number(response.match(/^HTTP\/1\.1 (\d{3})/)?.[1])));
    socket.on('error', reject);
  });
}

test('serves only the intended snapshot resources with their MIME types', async (t) => {
  const { app } = await running(t);
  assert.equal(app.address.address, '127.0.0.1');
  assert.equal(app.publicFileCount, 5);
  for (const [target, type] of [['/', 'text/html'], ['/index.html', 'text/html'], ['/styles.css', 'text/css'], ['/favicon.svg', 'image/svg+xml'], ['/src/main.js', 'text/javascript'], ['/src/i18n/en-US.js', 'text/javascript']]) {
    const result = await request(app, target);
    assert.equal(result.status, 200, target);
    assert.ok(result.headers['content-type'].startsWith(type));
    assert.equal(Number(result.headers['content-length']), result.body.length);
  }
});

test('HEAD has the GET metadata and no response body', async (t) => {
  const { app } = await running(t);
  const result = await request(app, '/src/main.js', { method: 'HEAD' });
  assert.equal(result.status, 200);
  assert.equal(Number(result.headers['content-length']), Buffer.byteLength(mainBytes));
  assert.equal(result.body.length, 0);
});

test('security headers disallow inline code, framing, sniffing, and network connections', async (t) => {
  const { app } = await running(t);
  const result = await request(app);
  assert.equal(result.headers['content-security-policy'], CONTENT_SECURITY_POLICY);
  assert.match(CONTENT_SECURITY_POLICY, /connect-src 'none'/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY, /unsafe-inline|unsafe-eval|https:/);
  assert.equal(result.headers['x-content-type-options'], 'nosniff');
  assert.equal(result.headers['cross-origin-resource-policy'], 'same-origin');
  assert.equal(result.headers['cache-control'], 'no-store');
});

test('query strings do not become filesystem paths', async (t) => {
  const { app } = await running(t);
  assert.equal((await request(app, '/src/main.js?cache=%2e%2e')).body.toString(), mainBytes);
});

for (const target of ['/.env', '/.git/config', '/package.json', '/docs/README.en-US.md', '/scripts/serve.mjs', '/tests/server.test.js', '/foundation/release.zip', '/src/', '/missing-route', '/src/unknown.js', '/../package.json', '/src/../package.json']) {
  test(`does not expose private, missing, directory, or traversal target ${target}`, async (t) => {
    const { app, root } = await running(t);
    const result = await request(app, target);
    assert.equal(result.status, 404);
    assert.doesNotMatch(result.body.toString(), /SYNTHETIC_FIXTURE_ONLY/);
    assert.ok(!result.body.toString().includes(root));
  });
}

test('rejects encoded, double-encoded, backslash, absolute-form, and malformed paths', async (t) => {
  const { app } = await running(t);
  for (const target of ['/%2e%2e/package.json', '/src/%252e%252e/package.json', '/src%2fmain.js', '/src/%zz.js', '/src\\main.js', '//src/main.js', 'http://example.invalid/src/main.js', '/src/main.js#fragment']) {
    assert.equal((await request(app, target)).status, 400, target);
  }
});

test('only GET and HEAD are allowed', async (t) => {
  const { app } = await running(t);
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    const result = await request(app, '/', { method });
    assert.equal(result.status, 405);
    assert.equal(result.headers.allow, 'GET, HEAD');
  }
});

test('rejects unexpected and duplicate Host headers including rebinding names', async (t) => {
  const { app } = await running(t);
  for (const host of ['example.invalid', 'localhost', '127.0.0.1']) {
    assert.equal((await request(app, '/', { headers: { Host: host } })).status, 421);
  }
  const duplicate = await rawRequest(app, `Host: ${new URL(app.url).host}\r\nHost: example.invalid`);
  assert.ok([400, 421].includes(duplicate)); // Node's parser may reject before our handler.
  assert.ok([400, 421].includes(await rawRequest(app, '')));
});

test('rejects foreign Origin and cross-site requests while allowing its own origin', async (t) => {
  const { app } = await running(t);
  for (const headers of [{ Origin: 'https://example.invalid' }, { Origin: 'null' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'Sec-Fetch-Site': 'same-site' }]) {
    assert.equal((await request(app, '/', { headers })).status, 403);
  }
  assert.equal((await request(app, '/', { headers: { Origin: app.url, 'Sec-Fetch-Site': 'same-origin' } })).status, 200);
});

test('snapshot does not incorporate later edits or newly created modules', async (t) => {
  const { app, root } = await running(t);
  await fs.writeFile(path.join(root, 'src', 'main.js'), 'export const value = "changed";');
  await fs.writeFile(path.join(root, 'src', 'later.js'), 'export const added = true;');
  assert.equal((await request(app, '/src/main.js')).body.toString(), mainBytes);
  assert.equal((await request(app, '/src/later.js')).status, 404);
});

test('rejects a linked source directory without following it', async (t) => {
  const { root, container } = await fixture(t);
  const target = path.join(container, 'owned-target');
  await fs.mkdir(target);
  await fs.writeFile(path.join(target, 'secret.js'), 'export const synthetic = true;');
  const link = path.join(root, 'src', 'linked');
  await fs.symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(startDevelopmentServer({ root, port: 0 }), { code: 'UNSAFE_PUBLIC_PATH' });
  await fs.unlink(link);
  assert.equal(await fs.readFile(path.join(target, 'secret.js'), 'utf8'), 'export const synthetic = true;');
});

test('rejects a linked project root', async (t) => {
  const { root, container } = await fixture(t);
  const alias = path.join(container, 'root-alias');
  await fs.symlink(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(startDevelopmentServer({ root: alias, port: 0 }), { code: 'UNSAFE_PUBLIC_PATH' });
  await fs.unlink(alias);
});

test('rejects hard-linked public files', async (t) => {
  const { root, container } = await fixture(t);
  const target = path.join(container, 'owned-secret.js');
  await fs.writeFile(target, 'export const synthetic = true;');
  await fs.link(target, path.join(root, 'src', 'linked.js'));
  await assert.rejects(startDevelopmentServer({ root, port: 0 }), { code: 'UNSAFE_PUBLIC_PATH' });
});

test('rejects missing entrypoint and oversized public files with safe errors', async (t) => {
  const first = await fixture(t);
  await fs.unlink(path.join(first.root, 'src', 'main.js'));
  await assert.rejects(startDevelopmentServer({ root: first.root, port: 0 }), { code: 'MISSING_RESOURCE' });
  const second = await fixture(t);
  await fs.writeFile(path.join(second.root, 'styles.css'), Buffer.alloc(1024 * 1024 + 1));
  await assert.rejects(startDevelopmentServer({ root: second.root, port: 0 }), { code: 'RESOURCE_LIMIT' });
  await assert.rejects(startDevelopmentServer({ root: path.join(second.root, 'absent'), port: 0 }), (error) => {
    assert.equal(error.code, 'PUBLIC_SNAPSHOT_FAILED');
    assert.ok(!error.message.includes(second.root));
    return true;
  });
});

test('does not silently choose another port when the requested one is occupied', async (t) => {
  const { app, root } = await running(t);
  await assert.rejects(startDevelopmentServer({ root, port: app.address.port }), { code: 'PORT_IN_USE' });
  assert.equal((await request(app)).status, 200);
});

test('close releases its own socket and is idempotent', async (t) => {
  const { app } = await running(t);
  await app.close();
  await app.close();
  await assert.rejects(request(app), { code: 'ECONNREFUSED' });
});

test('argument parsing keeps default loopback port and rejects ambiguous or unsupported options', () => {
  assert.deepEqual(parseServeArguments([]), { port: 5180, help: false });
  assert.deepEqual(parseServeArguments(['--port', '65535']), { port: 65535, help: false });
  assert.equal(parseServeArguments(['--help']).help, true);
  for (const args of [['--host', '0.0.0.0'], ['--port', '0'], ['--port', '65536'], ['--port', '1.5'], ['--port', '05180'], ['--port'], ['--port', '5180', '--port', '5181'], ['--help', '--port', '5180']]) {
    assert.throws(() => parseServeArguments(args), { code: 'INVALID_ARGUMENTS' });
  }
});

test('port 80 policy accepts canonical and explicit default-port authorities without binding port 80', () => {
  for (const authority of ['127.0.0.1', '127.0.0.1:80']) {
    assert.equal(isLocalAuthority(authority, 80), true);
    assert.equal(isLocalOrigin(`http://${authority}`, 80), true);
  }
  for (const authority of ['localhost', 'example.invalid', '127.0.0.1:5180', '127.0.0.1:080', 'user@127.0.0.1', '127.0.0.1/']) {
    assert.equal(isLocalAuthority(authority, 80), false);
    assert.equal(isLocalOrigin(`http://${authority}`, 80), false);
  }
  assert.equal(isLocalAuthority('127.0.0.1', 5180), false);
  assert.equal(isLocalAuthority('127.0.0.1:5180', 5180), true);
  assert.equal(isLocalOrigin('https://127.0.0.1', 80), false);
  assert.equal(isLocalOrigin('null', 80), false);
});

test('CLI reports invalid options without starting a server', () => {
  const result = spawnSync(process.execPath, [path.join(scripts, 'serve.mjs'), '--host', '0.0.0.0'], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stderr).code, 'INVALID_ARGUMENTS');
  assert.equal(result.stdout, '');
});

test('CLI reports an occupied port without interrupting its owner', async (t) => {
  const { root, app } = await running(t);
  await fs.cp(scripts, path.join(root, 'scripts'), { recursive: true });
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'serve.mjs'), '--port', String(app.address.port)], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stderr).code, 'PORT_IN_USE');
  assert.equal((await request(app)).status, 200);
});

test('CLI starts the requested port from an independent fixture', async (t) => {
  const { root, addCleanup } = await fixture(t);
  await fs.cp(scripts, path.join(root, 'scripts'), { recursive: true });
  const reservation = net.createServer();
  reservation.listen({ host: '127.0.0.1', port: 0 });
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'serve.mjs'), '--port', String(port)], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  addCleanup(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill(); // Only this test's process. Windows may force termination.
      await exited;
    }
  });
  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Fixture CLI startup timeout.')), 5000);
    let stdout = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.includes('\n')) {
        clearTimeout(timer);
        try { resolve(JSON.parse(stdout.split('\n')[0])); } catch (error) { reject(error); }
      }
    });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Fixture CLI exited before readiness.')); });
  });
  assert.equal(ready.url, `http://127.0.0.1:${port}`);
  assert.equal(ready.snapshot, true);
  assert.equal((await request(ready)).status, 200);
});
