#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import path from 'node:path';
import process from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ACTIONS = new Set(['doctor', 'setup', 'check', 'start']);
const TEMPLATES = new Set(['web', 'web-vanilla', 'flutter', 'kotlin-android', 'backend-php', 'backend-node', 'backend-python', 'backend-php-native']);
const COPY = {
  'es-419': {
    doctor: 'Diagnóstico de herramientas', ready: 'La solución está preparada para este paso.',
    runSetup: 'Corrige el diagnóstico y vuelve a ejecutar npm run setup.',
    setup: 'Preparando dependencias', check: 'Verificando componentes', start: 'Iniciando componentes',
    noSetup: 'No requiere preparación adicional', failed: 'Falló el comando', complete: 'Proceso completado.',
    android: 'Android quedó compilado. Para abrirlo, selecciona tu emulador o dispositivo en Android Studio; el asistente no instala APK en un dispositivo ambiguo.',
  },
  'en-US': {
    doctor: 'Tool diagnosis', ready: 'The solution is ready for this step.',
    runSetup: 'Correct the diagnosis and run npm run setup again.',
    setup: 'Preparing dependencies', check: 'Verifying components', start: 'Starting components',
    noSetup: 'No additional preparation required', failed: 'Command failed', complete: 'Process completed.',
    android: 'Android was built. To open it, select your emulator or device in Android Studio; the assistant does not install an APK on an ambiguous device.',
  },
};

function executable(name, platform = process.platform) {
  if (platform !== 'win32') return name;
  return { npm: 'npm.cmd', composer: 'composer.bat', flutter: 'flutter.bat', dart: 'dart.exe', gradle: 'gradlew.bat' }[name] ?? name;
}

function needsCommandShell(tool, platform = process.platform) { return platform === 'win32' && /\.(?:bat|cmd)$/iu.test(tool); }

function childInvocation(tool, args, platform = process.platform) {
  return needsCommandShell(tool, platform)
    ? { tool: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', [tool, ...args].join(' ')] }
    : { tool, args };
}

function validateManifest(value) {
  if (!value || value.kind !== 'project-base-solution' || !['es-419', 'en-US'].includes(value.language)
    || !Array.isArray(value.components) || value.components.length < 1 || value.components.length > 2) throw new Error('INVALID_SOLUTION_MANIFEST');
  const directories = new Set();
  for (const item of value.components) {
    if (!item || !['app', 'api'].includes(item.directory) || directories.has(item.directory) || !TEMPLATES.has(item.template)) throw new Error('INVALID_SOLUTION_MANIFEST');
    if ((item.directory === 'api') !== ['backend-php', 'backend-node', 'backend-python', 'backend-php-native'].includes(item.template)) throw new Error('INVALID_SOLUTION_MANIFEST');
    directories.add(item.directory);
  }
  return value;
}

export function loadManifest(root = ROOT) {
  return validateManifest(JSON.parse(readFileSync(path.join(root, 'project-base.json'), 'utf8')));
}

function command(directory, tool, args, options = {}) { return { directory, tool, args, ...options }; }

export function planFor(action, manifest, platform = process.platform) {
  if (!ACTIONS.has(action) || action === 'doctor') throw new Error('INVALID_ACTION');
  const plan = [];
  for (const item of validateManifest(manifest).components) {
    const { directory, template } = item;
    if (template === 'backend-php-native') {
      if (action === 'start') plan.push(command(directory, 'php', ['-S', '127.0.0.1:8080', '-t', 'public', 'public/router.php'], { role: 'api', nativeDatabase: true }));
      else plan.push(command(directory, process.execPath, ['scripts/local.mjs', action]));
      continue;
    }
    if (action === 'setup') {
      if (['web', 'backend-node'].includes(template)) plan.push(command(directory, executable('npm', platform), ['ci', '--ignore-scripts', '--no-audit', '--no-fund']));
      if (template === 'backend-php') plan.push(
        command(directory, executable('composer', platform), ['install', '--no-interaction', '--no-progress', '--prefer-dist', '--no-plugins', '--no-scripts']),
        command(directory, executable('php', platform), ['scripts/setup-local.php'], { unlessExists: '.env' }),
        command(directory, executable('php', platform), ['artisan', 'migrate', '--force', '--no-interaction']),
      );
      if (template === 'backend-python') plan.push(
        command(directory, executable('uv', platform), ['sync', '--locked', '--all-extras']),
        command(directory, executable('uv', platform), ['run', 'python', '-m', 'project_base_api.migrate_cli', 'up']),
      );
      if (template === 'flutter') plan.push(command(directory, executable('flutter', platform), ['pub', 'get', '--enforce-lockfile']));
      if (template === 'kotlin-android') plan.push(command(directory, platform === 'win32' ? '.\\gradlew.bat' : './gradlew', ['--version']));
    }
    if (action === 'check') {
      if (['web', 'web-vanilla', 'backend-node'].includes(template)) plan.push(command(directory, executable('npm', platform), ['run', 'check']));
      if (template === 'backend-php') plan.push(command(directory, executable('composer', platform), ['check']));
      if (template === 'backend-python') plan.push(
        command(directory, executable('uv', platform), ['run', 'ruff', 'check', '.']),
        command(directory, executable('uv', platform), ['run', 'mypy']),
        command(directory, executable('uv', platform), ['run', 'pytest', '-W', 'error']),
      );
      if (template === 'flutter') plan.push(
        command(directory, executable('dart', platform), ['run', 'tool/check_toolchain.dart']),
        command(directory, executable('dart', platform), ['format', '--output=none', '--set-exit-if-changed', 'lib', 'test', 'integration_test', 'tool']),
        command(directory, executable('flutter', platform), ['analyze']), command(directory, executable('flutter', platform), ['test']),
      );
      if (template === 'kotlin-android') plan.push(command(directory, platform === 'win32' ? '.\\gradlew.bat' : './gradlew',
        ['--no-daemon', ':core:test', ':app:testDebugUnitTest', ':app:lintDebug', ':app:assembleDebug']));
    }
    if (action === 'start') {
      if (template === 'web') plan.push(command(directory, executable('npm', platform), ['run', 'dev'], { role: 'app' }));
      if (template === 'web-vanilla') plan.push(command(directory, executable('npm', platform), ['start'], { role: 'app' }));
      if (template === 'backend-node') plan.push(command(directory, executable('npm', platform), ['start'], { role: 'api' }));
      if (template === 'backend-php') plan.push(command(directory, executable('php', platform), ['artisan', 'serve', '--host=127.0.0.1', '--port=8080', '--no-reload'], { role: 'api' }));
      if (template === 'backend-python') plan.push(command(directory, executable('uv', platform), ['run', 'uvicorn', 'project_base_api.main:app', '--host', '127.0.0.1', '--port', '8080'], { role: 'api' }));
      if (template === 'flutter') plan.push(command(directory, executable('flutter', platform), ['run'], { role: 'app' }));
      if (template === 'kotlin-android') plan.push(command(directory, platform === 'win32' ? '.\\gradlew.bat' : './gradlew', [':app:assembleDebug'], { role: 'android-build' }));
    }
  }
  return plan;
}

function version(commandName, args = ['--version']) {
  const invocation = childInvocation(commandName, args);
  const result = spawnSync(invocation.tool, invocation.args, { encoding: 'utf8', windowsHide: true });
  return { ok: result.status === 0 && !result.error, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split(/\r?\n/u)[0] ?? '', error: result.error?.code ?? '' };
}

export function diagnose(manifest, platform = process.platform, inspect = version) {
  const templates = new Set(validateManifest(manifest).components.map((item) => item.template));
  const checks = [{ name: 'Node.js 24', result: { ok: /^v24\./u.test(process.version), output: process.version } }];
  if ([...templates].some((item) => ['web', 'web-vanilla', 'backend-node'].includes(item))) checks.push({ name: 'npm', result: inspect(executable('npm', platform)) });
  if (templates.has('backend-php')) checks.push({ name: 'PHP 8.5', result: inspect(executable('php', platform), ['--version']), accepts: /^PHP 8\.5\./u }, { name: 'Composer 2', result: inspect(executable('composer', platform)), accepts: /^Composer version 2\./u });
  if (templates.has('backend-php-native')) checks.push(
    { name: 'PHP 8.5', result: inspect(executable('php', platform), ['--version']), accepts: /^PHP 8\.5\./u },
    { name: 'PHP pdo_sqlite, mbstring, openssl', result: inspect(executable('php', platform), ['-r', 'exit(extension_loaded("pdo_sqlite") && extension_loaded("mbstring") && extension_loaded("openssl") ? 0 : 1);']) },
    { name: 'Native SQL engine driver', result: inspect(executable('php', platform), ['-r', '$engine = getenv("NATIVE_PHP_ENGINE") ?: "sqlite"; exit(in_array($engine, ["sqlite", "pgsql", "mysql"], true) && extension_loaded("pdo_".$engine) ? 0 : 1);']) },
  );
  if (templates.has('backend-python')) checks.push(
    { name: 'Managed Python 3.13.15 (uv python install 3.13.15)', result: inspect(executable('uv', platform), ['python', 'find', '--managed-python', '--no-python-downloads', '3.13.15']) },
    { name: 'uv', result: inspect(executable('uv', platform), ['--version']), accepts: /^uv \d+\./u },
  );
  if (templates.has('flutter')) checks.push({ name: 'Flutter 3.35.1', result: inspect(executable('flutter', platform)), accepts: /Flutter 3\.35\.1/u }, { name: 'Dart 3.9.0', result: inspect(executable('dart', platform)), accepts: /Dart SDK version: 3\.9\.0/u });
  if (templates.has('kotlin-android')) {
    checks.push({ name: 'JDK 21', result: inspect(executable('java', platform)), accepts: /(?:version "21\.|openjdk 21\.)/iu });
    const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
    checks.push({ name: 'Android SDK', result: { ok: sdk !== '' && existsSync(sdk), output: sdk || 'ANDROID_HOME / ANDROID_SDK_ROOT' } });
  }
  return checks.map((item) => ({ name: item.name, ok: item.result.ok && (!item.accepts || item.accepts.test(item.result.output)), detail: item.result.output || item.result.error || 'not found' }));
}

function printDiagnosis(manifest, showFailureAdvice = true) {
  const copy = COPY[manifest.language];
  process.stdout.write(`\n${copy.doctor}\n`);
  const results = diagnose(manifest);
  for (const item of results) process.stdout.write(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}: ${item.detail}\n`);
  const ok = results.every((item) => item.ok);
  if (ok || showFailureAdvice) process.stdout.write(`${ok ? copy.ready : copy.runSetup}\n`);
  return ok;
}

function runSequential(action, manifest) {
  const copy = COPY[manifest.language];
  const plan = planFor(action, manifest);
  process.stdout.write(`\n${copy[action]}\n`);
  if (plan.length === 0) process.stdout.write(`${copy.noSetup}\n`);
  for (const item of plan) {
    const cwd = path.join(ROOT, item.directory);
    if (item.unlessExists && existsSync(path.join(cwd, item.unlessExists))) continue;
    process.stdout.write(`\n[${item.directory}] ${item.tool} ${item.args.join(' ')}\n`);
    const invocation = childInvocation(item.tool, item.args);
    const result = spawnSync(invocation.tool, invocation.args, { cwd, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0 || result.error) throw new Error(`${copy.failed}: ${item.directory}/${item.tool}`);
    if (item.role === 'android-build') process.stdout.write(`${copy.android}\n`);
  }
  process.stdout.write(`${copy.complete}\n`);
}

async function runStart(manifest) {
  const copy = COPY[manifest.language];
  let plan = planFor('start', manifest).sort((left, right) => left.role === 'api' ? -1 : right.role === 'api' ? 1 : 0);
  process.stdout.write(`\n${copy.start}\n`);
  const android = plan.find((item) => item.role === 'android-build');
  if (android) {
    process.stdout.write(`\n[${android.directory}] ${android.tool} ${android.args.join(' ')}\n`);
    const invocation = childInvocation(android.tool, android.args);
    const result = spawnSync(invocation.tool, invocation.args, { cwd: path.join(ROOT, android.directory), stdio: 'inherit', windowsHide: true });
    if (result.status !== 0 || result.error) throw new Error(`${copy.failed}: ${android.directory}/${android.tool}`);
    process.stdout.write(`${copy.android}\n`);
    plan = plan.filter((item) => item !== android);
    if (plan.length === 0) return;
  }
  const children = [];
  let stopping = false;
  const stop = () => { if (stopping) return; stopping = true; for (const child of children) if (child.exitCode === null) child.kill(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  try {
    const exits = plan.map((item) => new Promise((resolve, reject) => {
      const environment = { ...process.env };
      if (item.nativeDatabase) {
        environment.NATIVE_PHP_DATABASE = path.join(ROOT, item.directory, '.runtime', 'local.sqlite');
        if ((!environment.NATIVE_PHP_ENGINE || environment.NATIVE_PHP_ENGINE === 'sqlite') && !existsSync(environment.NATIVE_PHP_DATABASE)) throw new Error('Run setup first.');
        if (environment.NATIVE_PHP_PORT) {
          if (!/^[1-9][0-9]{0,4}$/u.test(environment.NATIVE_PHP_PORT) || Number(environment.NATIVE_PHP_PORT) > 65535) throw new Error('Invalid native PHP loopback port.');
          item.args[1] = `127.0.0.1:${environment.NATIVE_PHP_PORT}`;
        }
      }
      if (item.role === 'api' && !environment.API_ALLOWED_ORIGINS) environment.API_ALLOWED_ORIGINS = manifest.components.some((part) => part.template === 'web') ? 'http://127.0.0.1:5173' : manifest.components.some((part) => part.template === 'web-vanilla') ? 'http://127.0.0.1:5180' : '';
      const invocation = childInvocation(item.tool, item.args);
      const child = spawn(invocation.tool, invocation.args, { cwd: path.join(ROOT, item.directory), env: environment,
        stdio: item.role === 'api' && plan.length > 1 ? ['ignore', 'inherit', 'inherit'] : 'inherit', windowsHide: true });
      children.push(child); child.once('error', reject); child.once('exit', code => code === 0 || stopping ? resolve(code) : reject(new Error(`${copy.failed}: ${item.directory}/${item.tool}`)));
    }));
    await Promise.race(exits); stop(); await Promise.allSettled(exits);
  } finally { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); stop(); }
}

export async function main(args = process.argv.slice(2)) {
  if (args.length !== 1 || !ACTIONS.has(args[0])) throw new Error('Usage: node project-base.mjs doctor|setup|check|start');
  const manifest = loadManifest();
  if (args[0] === 'doctor') { if (!printDiagnosis(manifest)) process.exitCode = 1; return; }
  if (!printDiagnosis(manifest, false)) throw new Error(COPY[manifest.language].runSetup);
  if (args[0] === 'start') return runStart(manifest);
  runSequential(args[0], manifest);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try { await main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
