// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { mkdtemp, realpath, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await realpath(tmpdir());
const folder = await mkdtemp(path.join(temporary, 'native-php-recovery-'));
const database = path.join(folder, 'source.sqlite'), snapshot = path.join(folder, 'snapshot'), restored = path.join(folder, 'restored.sqlite');
const environment = { ...process.env, RECOVERY_TEST_TOKEN: randomBytes(32).toString('hex') };
let writer;
const run = (args, expected = 0) => {
  const result = spawnSync('php', args, { cwd: root, env: environment, encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert.equal(result.status, expected, 'Isolated recovery CLI result');
  return result.stdout;
};
try {
  run(['scripts/database.php', 'init', database]);
  run(['tests/recovery-fixture.php', 'seed', database]);
  const before = await readFile(database);
  run(['scripts/recovery.php', 'snapshot', database, snapshot]);
  run(['scripts/recovery.php', 'verify', snapshot]);
  run(['scripts/recovery.php', 'snapshot', database, snapshot], 1);
  run(['scripts/recovery.php', 'restore', snapshot, database], 1);
  const receipt = JSON.parse(run(['scripts/recovery.php', 'restore', snapshot, restored]));
  assert.equal(receipt.result, 'RESTORED_NOT_ACTIVATED');
  assert.equal(receipt.credentialsInvalidated, 1);
  run(['tests/recovery-fixture.php', 'assert-restored', restored]);
  assert.deepEqual(await readFile(database), before, 'Source remains unchanged');
  const restoredBytes = await readFile(restored);
  run(['scripts/recovery.php', 'restore', snapshot, restored], 1);
  assert.deepEqual(await readFile(restored), restoredBytes, 'Existing destination remains unchanged');
  const manifestPath = path.join(snapshot, 'manifest.json');
  const original = await readFile(manifestPath);
  await writeFile(manifestPath, '{"format":99}');
  run(['scripts/recovery.php', 'verify', snapshot], 1);
  const refused = path.join(folder, 'refused.sqlite');
  run(['scripts/recovery.php', 'restore', snapshot, refused], 1);
  await assert.rejects(lstat(refused), { code: 'ENOENT' });
  await writeFile(manifestPath, original);
  const saved = path.join(snapshot, 'database.sqlite');
  const corrupted = await readFile(saved);
  corrupted[0] ^= 1;
  await writeFile(saved, corrupted);
  run(['scripts/recovery.php', 'verify', snapshot], 1);
  run(['scripts/recovery.php', 'restore', snapshot, refused], 1);
  await assert.rejects(lstat(refused), { code: 'ENOENT' });
  const walDatabase = path.join(folder, 'wal.sqlite'), walSnapshot = path.join(folder, 'wal-snapshot'), walRestored = path.join(folder, 'wal-restored.sqlite');
  run(['scripts/database.php', 'init', walDatabase]);
  writer = spawn('php', ['tests/recovery-fixture.php', 'seed-wal', walDatabase], { cwd: root, env: environment, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
  await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('WAL fixture startup timeout')), 5000);
    writer.once('error', error => { clearTimeout(timer); reject(error); });
    writer.once('exit', () => { clearTimeout(timer); reject(new Error('WAL fixture exited before ready')); });
    writer.stdout.on('data', data => { output += data; if (output.includes('READY WAL fixture')) { clearTimeout(timer); resolve(); } });
  });
  assert.ok((await lstat(walDatabase + '-wal')).size > 0, 'WAL contains committed pages');
  run(['scripts/recovery.php', 'snapshot', walDatabase, walSnapshot]);
  run(['scripts/recovery.php', 'restore', walSnapshot, walRestored]);
  run(['tests/recovery-fixture.php', 'assert-restored', walRestored]);
  const exited = once(writer, 'exit');
  writer.stdin.end('stop\n');
  assert.equal((await exited)[0], 0);
  console.log('PASS native SQLite recovery: integrity, restored data, token invalidation, tamper rejection, no overwrite, committed WAL and uncommitted isolation');
} finally {
  if (writer && writer.exitCode === null && writer.pid) {
    const stopped = once(writer, 'exit'); writer.kill(); await stopped;
  }
  assert.equal(path.dirname(await realpath(folder)), temporary);
  assert.ok(path.basename(folder).startsWith('native-php-recovery-'));
  await rm(folder, { recursive: true, force: false });
}
