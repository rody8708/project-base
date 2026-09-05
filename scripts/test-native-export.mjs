// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm, readFile, readdir, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { interactiveCreate } from '../tools/create-app.mjs';
import { createSolution } from '../tools/lib/project-export.mjs';

const temporary = await realpath(tmpdir());
const folder = await mkdtemp(path.join(temporary, 'native-php-export-'));
let server;
function run(cwd, tool, args) {
  const result = spawnSync(tool, args, { cwd, windowsHide: true, encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, `${tool} ${args[0]} failed: ${result.stderr?.slice(-600)}`);
  return result.stdout;
}
try {
  const answers = ['2', '4', '1', '4', 'synthetic-native', folder, 'y'];
  let transcript = '';
  const receipt = await interactiveCreate({ question: async () => { assert.ok(answers.length); return answers.shift(); }, close() {} }, { write: value => { transcript += value; } });
  assert.ok(transcript.includes('Native PHP — no framework, SQLite'));
  const solution = receipt.destination;
  assert.equal(JSON.parse(await readFile(path.join(solution, 'project-base.json'))).components[0].template, 'backend-php-native');
  await assert.rejects(lstat(path.join(solution, 'api/.runtime')), { code: 'ENOENT' });
  for (const action of ['doctor', 'setup', 'setup', 'check']) run(solution, process.execPath, ['project-base.mjs', action]);
  const database = path.join(solution, 'api/.runtime/local.sqlite');
  const before = await readFile(database);
  run(solution, process.execPath, ['project-base.mjs', 'check']);
  assert.deepEqual(await readFile(database), before, 'Tests never access the consumer database');
  const token = JSON.parse(run(path.join(solution, 'api'), 'php', ['scripts/token.php', 'issue', database, 'synthetic-user', 'read-write', '3600', '--show-token'])).token;
  const reserve = net.createServer(); reserve.listen(0, '127.0.0.1'); await once(reserve, 'listening');
  const port = reserve.address().port; await new Promise(resolve => reserve.close(resolve));
  server = spawn(process.execPath, ['project-base.mjs', 'start'], { cwd: solution, env: { ...process.env, NATIVE_PHP_PORT: String(port) }, stdio: 'ignore', windowsHide: true });
  let failure; server.on('error', error => { failure = error; });
  let ready = false;
  for (let attempt = 0; attempt < 70; attempt++) {
    if (failure || server.exitCode !== null) throw new Error('Generated start failed');
    try { ready = (await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(500) })).status === 200; } catch {}
    if (ready) break; await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(ready);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const created = await fetch(`http://127.0.0.1:${port}/api/v1/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Independent ñ' }), signal: AbortSignal.timeout(3000) });
  assert.equal(created.status, 201);
  const task = (await created.json()).data;
  const fetched = await fetch(`http://127.0.0.1:${port}/api/v1/tasks/${task.id}`, { headers, signal: AbortSignal.timeout(3000) });
  assert.equal((await fetched.json()).data.title, 'Independent ñ');
  for (const preset of ['web-app', 'mobile-app', 'desktop-app', 'android-app']) {
    const exported = await createSolution({ preset, backend: 'backend-php-native', language: 'es-419', name: `synthetic-${preset}`, destination: path.join(folder, preset) });
    const manifest = JSON.parse(await readFile(path.join(exported.destination, 'project-base.json')));
    assert.equal(manifest.components[1].template, 'backend-php-native');
    assert.equal((await readdir(path.join(exported.destination, 'api'))).includes('.runtime'), false);
  }
  console.log('PASS native wizard export: independent doctor/setup/replay/check/start, token and API CRUD; all client compositions generated without dependencies or runtime data');
} finally {
  if (server?.pid && server.exitCode === null) {
    const exited = once(server, 'exit');
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
    await exited;
  }
  assert.equal(path.dirname(await realpath(folder)), temporary);
  assert.ok(path.basename(folder).startsWith('native-php-export-'));
  await rm(folder, { recursive: true, force: false });
}
