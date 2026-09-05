// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { existsSync } from 'node:fs';
import { mkdir, lstat, realpath, readdir } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const action = process.argv[2];
function run(tool, args) {
  const result = spawnSync(tool, args, { cwd: root, windowsHide: true, stdio: 'inherit' });
  if (result.status !== 0 || result.error) throw new Error('Native PHP command failed.');
}
if (action === 'doctor') {
  run('php', ['-r', 'exit(PHP_MAJOR_VERSION === 8 && PHP_MINOR_VERSION === 5 && extension_loaded("pdo_sqlite") && extension_loaded("mbstring") && extension_loaded("openssl") ? 0 : 1);']);
  run('php', ['-r', '$engine = getenv("NATIVE_PHP_ENGINE") ?: "sqlite"; exit(in_array($engine, ["sqlite", "pgsql", "mysql"], true) && extension_loaded("pdo_".$engine) ? 0 : 1);']);
  console.log('PASS PHP 8.5, pdo_sqlite, mbstring, openssl');
} else if (action === 'check') {
  async function lint(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) await lint(relative);
      else if (entry.isFile() && entry.name.endsWith('.php')) run('php', ['-l', relative]);
    }
  }
  for (const directory of ['app', 'public', 'scripts', 'tests', 'lang']) await lint(directory);
  run('php', ['-l', 'bootstrap.php']);
  run('php', ['tests/operations-check.php']);
  run(process.execPath, ['tests/http-check.mjs']);
  run(process.execPath, ['tests/recovery-check.mjs']);
} else if (action === 'setup' || action === 'start') {
  if (existsSync(new URL('../../../tools/lib/project-export.mjs', import.meta.url))) throw new Error('Create an independent solution first; local setup never writes into Project Base.');
  const engine = process.env.NATIVE_PHP_ENGINE || 'sqlite';
  if (!['sqlite', 'pgsql', 'mysql'].includes(engine)) throw new Error('Unsupported database engine.');
  if (engine !== 'sqlite' && action === 'setup') {
    run('php', ['scripts/database.php', 'server-up']);
    process.exit(0);
  }
  const directory = path.join(root, '.runtime');
  if (action === 'setup') await mkdir(directory, { mode: 0o700 }).catch(error => { if (error.code !== 'EEXIST') throw error; });
  // Repeat setup is handled below without following a replaced directory or file.
  if (engine === 'sqlite' && ((await lstat(directory)).isSymbolicLink() || path.resolve(await realpath(directory)) !== path.resolve(directory))) throw new Error('Plain local runtime directory required.');
  const database = path.join(directory, 'local.sqlite');
  if (action === 'setup') run('php', ['scripts/database.php', existsSync(database) ? 'up' : 'init', database]);
  else {
    if (engine === 'sqlite' && !existsSync(database)) throw new Error('Run setup first.');
    const child = spawn('php', ['-S', '127.0.0.1:8080', '-t', 'public', 'public/router.php'], { cwd: root, env: { ...process.env, NATIVE_PHP_DATABASE: database }, stdio: 'inherit', windowsHide: true });
    const stop = () => child.kill(); process.once('SIGINT', stop); process.once('SIGTERM', stop);
    try { const [code] = await once(child, 'exit'); process.exitCode = code ?? 0; }
    finally { process.off('SIGINT', stop); process.off('SIGTERM', stop); }
  }
} else throw new Error('Usage: node scripts/local.mjs doctor|setup|check|start');
