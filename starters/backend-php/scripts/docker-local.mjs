// Isolated Docker lab. Windows talks to the existing WSL engine; no Compose required.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

const root = fileURLToPath(new URL('../', import.meta.url));
const windows = process.platform === 'win32';
const prefix = windows ? ['-d', 'Ubuntu-24.04', '--', 'docker'] : [];
const executable = windows ? 'wsl.exe' : 'docker';
const mode = process.argv[2] ?? 'verify';
const label = 'org.foundation.isolated-php85';
const scope = randomBytes(8).toString('hex');
let name = 'foundation-php85-' + scope;
const image = 'foundation-php85-lab:' + scope;

function command(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, [...prefix, ...args], { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = ''; let error = '';
    child.stdout.on('data', data => { output += data;
      if (args[0] === 'build') for (const line of data.toString().split('\n')) if (/^Step \d+\//.test(line)) console.log(line);
    });
    child.stderr.on('data', data => { error += data; });
    child.on('error', reject);
    child.stdin.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output.trim()) : reject(new Error('Docker ' + args[0] + ' failed: ' + (args[0] === 'build' ? output.slice(-2000) : '') + error.slice(-1500))));
    if (input) input.pipe(child.stdin); else child.stdin.end();
  });
}
async function owned() {
  const rows = JSON.parse(await command(['inspect', name]));
  assert.equal(rows[0].Config.Labels?.[label], 'true', 'Refusing to modify a foreign container.');
  assert.equal(rows[0].Name, '/' + name);
  return rows[0];
}
async function remove() { const item = await owned(); await command(['rm', '-f', item.Id]); }

const endpoint = await command(['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}']);
assert.equal(endpoint, 'unix:///var/run/docker.sock', 'Only the local Docker engine is accepted.');
if (mode === 'down') {
  name = process.argv[3] ?? '';
  assert.match(name, /^foundation-php85-[0-9a-f]{16}$/);
  await remove();
  console.log('Removed owned lab container and its disposable database, tokens, and certificate. Image/build cache retained.');
  process.exit(0);
}
assert.ok(['verify', 'up'].includes(mode), 'Usage: node scripts/docker-local.mjs verify|up|down CONTAINER');
console.log('Building the isolated PHP 8.5 image (first run downloads dependencies).');
// Explicit allowlist excludes .env, databases, host dependencies, caches, and test credentials.
const tar = spawn('tar', ['-C', root, '-cf', '-', 'composer.json', 'composer.lock', 'artisan', 'app',
  'bootstrap/app.php', 'bootstrap/providers.php', 'config', 'database/migrations', 'lang', 'public/index.php',
  'routes', 'scripts/token.php', 'scripts/check-production.php', 'scripts/sqlite-recovery.php', 'docker', '.dockerignore'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
const tarDone = new Promise((resolve, reject) => {
  tar.stderr.resume(); tar.on('error', reject); tar.on('close', code => code === 0 ? resolve() : reject(new Error('Context archive failed.')));
});
await Promise.all([command(['build', '--platform', 'linux/amd64', '-f', 'docker/Dockerfile', '-t', image, '-'], tar.stdout), tarDone]);
let created = false;
let retained = false;
try {
  await command(['run', '-d', '--name', name, '--label', label + '=true', '--memory', '512m', '--cpus', '2',
    '--pids-limit', '128', '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL',
    '-p', '127.0.0.1::8443', image]);
  created = true;
  for (let attempt = 0; attempt < 60; attempt++) {
    const state = (await owned()).State;
    if (state.Health?.Status === 'healthy') break;
    if (!state.Running || attempt === 59) throw new Error('Lab startup failed: ' + await command(['logs', '--tail', '8', name]));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const info = await owned();
  const binding = info.NetworkSettings.Ports['8443/tcp'][0];
  assert.equal(binding.HostIp, '127.0.0.1');
  let port = Number(binding.HostPort);
  const ca = await command(['exec', name, 'cat', '/state/cert.pem']);
  async function request(path, token, method = 'GET', body, trust = true) {
    const payload = body ? JSON.stringify(body) : undefined;
    return await new Promise((resolve, reject) => {
      const req = https.request({ hostname: '127.0.0.1', port, path, method, ...(trust ? { ca } : {}),
        rejectUnauthorized: true, timeout: 10000,
        headers: { Accept: 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}) } }, res => {
          let data = ''; res.on('data', chunk => { data += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
        });
      req.on('error', reject); req.on('timeout', () => req.destroy(new Error('HTTPS timeout')));
      req.end(payload);
    });
  }
  await assert.rejects(request('/api/health', null, 'GET', null, false));
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/api/v1/tasks')).status, 401);
  const credential = JSON.parse(await command(['exec', name, 'php', 'scripts/token.php', 'issue', 'lab-owner', 'editor', '3600']));
  const createdTask = await request('/api/v1/tasks', credential.token, 'POST', { title: 'Isolated TLS test' });
  assert.equal(createdTask.status, 201);
  const id = createdTask.body.data.id;
  assert.equal((await request('/api/v1/tasks/' + id, credential.token)).status, 200);
  assert.equal((await request('/api/v1/tasks/' + id, credential.token, 'PUT',
    { title: 'Isolated TLS test', completed: true, version: 1 })).status, 200);
  const gate = JSON.parse(await command(['exec', name, 'php', 'scripts/check-production.php']));
  assert.equal(gate.result, 'LOCAL_CHECKS_PASS'); assert.equal(gate.productionApproved, false);
  await command(['restart', name]);
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await owned()).State.Health?.Status === 'healthy') break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  // Docker can reassign an automatically published host port on restart.
  const restartedBinding = (await owned()).NetworkSettings.Ports['8443/tcp'][0];
  assert.equal(restartedBinding.HostIp, '127.0.0.1');
  port = Number(restartedBinding.HostPort);
  const persisted = await request('/api/v1/tasks/' + id, credential.token);
  assert.equal(persisted.status, 200); assert.equal(persisted.body.data.completed, true);
  const snapshot = JSON.parse(await command(['exec', name, 'php', 'scripts/sqlite-recovery.php', 'snapshot', '/state/database.sqlite', '/state/recovery-snapshot']));
  assert.equal(snapshot.engine, 'sqlite');
  const later = await request('/api/v1/tasks', credential.token, 'POST', { title: 'After the recovery point' });
  assert.equal(later.status, 201);
  assert.equal((await request('/api/v1/tasks/' + id, credential.token, 'DELETE', { version: 2 })).status, 204);
  assert.equal((await request('/api/v1/tasks/' + id, credential.token)).status, 404);
  await command(['exec', name, 'php', 'scripts/token.php', 'revoke', credential.token_id]);
  assert.equal((await request('/api/v1/tasks', credential.token)).status, 401);
  const restored = JSON.parse(await command(['exec', name, 'php', 'scripts/sqlite-recovery.php', 'restore', '/state/recovery-snapshot', '/state/recovered.sqlite']));
  assert.equal(restored.result, 'RESTORED_NOT_ACTIVATED');
  assert.equal(restored.credentialsInvalidated, 1);
  const recoveryApi = JSON.parse(await command(['exec', '-i', name, 'php', 'docker/recovery-probe.php'],
    Readable.from([JSON.stringify({ oldToken: credential.token, taskId: id })])));
  assert.equal(recoveryApi.result, 'PASS');
  // Candidate-only probe above did not switch the live server or resurrect its deleted row.
  const checkToken = JSON.parse(await command(['exec', name, 'php', 'scripts/token.php', 'issue', 'lab-owner', 'editor', '300']));
  assert.equal((await request('/api/v1/tasks/' + id, checkToken.token)).status, 404);
  assert.equal((await request('/api/v1/tasks/' + later.body.data.id, checkToken.token)).status, 200);
  assert.equal((await request('/api/v1/tasks/' + later.body.data.id, checkToken.token, 'DELETE', { version: 1 })).status, 204);
  await command(['exec', name, 'php', 'scripts/token.php', 'revoke', checkToken.token_id]);
  const version = await command(['exec', name, 'php', '-r', 'echo PHP_VERSION;']);
  console.log(JSON.stringify({ result: 'PASS', php: version, https: 'https://127.0.0.1:' + port,
    checks: ['trusted-TLS', 'untrusted-certificate-rejected', 'authentication', 'CRUD', 'restart-persistence', 'revocation', 'production-local-gate'],
    recovery: { ...recoveryApi, snapshotMs: snapshot.snapshotMs, snapshotBytes: snapshot.bytes, restoreMs: restored.restoreMs },
    container: name, productionApproved: false }, null, 2));
  if (mode === 'up') {
    retained = true;
    console.log('Lab retained. Stop and delete disposable state: node scripts/docker-local.mjs down ' + name);
  }
} finally {
  if (created && !retained) await remove();
}
