// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnose, planFor } from './solution-runner.mjs';

function manifest(...components) {
  return { kind: 'project-base-solution', language: 'en-US', components };
}

test('a web and Node solution has one safe root plan per action', () => {
  const value = manifest({ directory: 'app', template: 'web' }, { directory: 'api', template: 'backend-node' });
  assert.deepEqual(planFor('setup', value, 'linux'), [
    { directory: 'app', tool: 'npm', args: ['ci', '--ignore-scripts', '--no-audit', '--no-fund'] },
    { directory: 'api', tool: 'npm', args: ['ci', '--ignore-scripts', '--no-audit', '--no-fund'] },
  ]);
  assert.deepEqual(planFor('check', value, 'linux').map((item) => [item.directory, item.tool, item.args]), [
    ['app', 'npm', ['run', 'check']], ['api', 'npm', ['run', 'check']],
  ]);
  assert.deepEqual(planFor('start', value, 'linux').map((item) => [item.directory, item.role]), [['app', 'app'], ['api', 'api']]);
});

test('PHP setup is explicit, locked, and avoids package plugins and scripts', () => {
  const plan = planFor('setup', manifest({ directory: 'api', template: 'backend-php' }), 'win32');
  assert.deepEqual(plan[0], { directory: 'api', tool: 'composer.bat', args: ['install', '--no-interaction', '--no-progress', '--prefer-dist', '--no-plugins', '--no-scripts'] });
  assert.deepEqual(plan[1], { directory: 'api', tool: 'php', args: ['scripts/setup-local.php'], unlessExists: '.env' });
  assert.deepEqual(plan[2], { directory: 'api', tool: 'php', args: ['artisan', 'migrate', '--force', '--no-interaction'] });
});

test('native PHP is independent of Composer and exposes bounded setup/check/start', () => {
  const value = manifest({ directory: 'api', template: 'backend-php-native' });
  for (const platform of ['win32', 'linux']) {
    assert.deepEqual(planFor('setup', value, platform)[0].args, ['scripts/local.mjs', 'setup']);
    assert.deepEqual(planFor('check', value, platform)[0].args, ['scripts/local.mjs', 'check']);
    assert.equal(planFor('start', value, platform)[0].tool, 'php');
    assert.equal(planFor('start', value, platform)[0].nativeDatabase, true);
  }
  const calls = [];
  const results = diagnose(value, 'linux', (tool, args) => {
    calls.push(tool);
    return { ok: true, output: args[0] === '--version' ? 'PHP 8.5.1' : '' };
  });
  assert.ok(results.every(item => item.ok));
  assert.deepEqual(calls, ['php', 'php']);
});

test('Python setup is locked, migrates explicitly, and checks every quality gate', () => {
  const value = manifest({ directory: 'api', template: 'backend-python' });
  assert.deepEqual(planFor('setup', value, 'linux'), [
    { directory: 'api', tool: 'uv', args: ['sync', '--locked', '--all-extras'] },
    { directory: 'api', tool: 'uv', args: ['run', 'python', '-m', 'project_base_api.migrate_cli', 'up'] },
  ]);
  assert.deepEqual(planFor('check', value, 'linux').map(item => item.args), [
    ['run', 'ruff', 'check', '.'], ['run', 'mypy'], ['run', 'pytest', '-W', 'error'],
  ]);
  assert.deepEqual(planFor('start', value, 'linux')[0], {
    directory: 'api', tool: 'uv', args: ['run', 'uvicorn', 'project_base_api.main:app', '--host', '127.0.0.1', '--port', '8080'], role: 'api',
  });
});

test('Python diagnosis checks the isolated pinned runtime without downloading', () => {
  const calls = [];
  const results = diagnose(manifest({ directory: 'api', template: 'backend-python' }), 'linux', (tool, args) => {
    calls.push([tool, args]);
    return { ok: true, output: args[0] === 'python' ? '/isolated/python' : 'uv 0.12.4' };
  });
  assert.deepEqual(calls[0], ['uv', ['python', 'find', '--managed-python', '--no-python-downloads', '3.13.15']]);
  assert.equal(results.every(item => item.ok), true);
  const missing = diagnose(manifest({ directory: 'api', template: 'backend-python' }), 'linux', () => ({ ok: false, output: '' }));
  assert.equal(missing[1].ok, false);
});

test('Android start builds safely instead of choosing a device', () => {
  const plan = planFor('start', manifest({ directory: 'app', template: 'kotlin-android' }), 'win32');
  assert.deepEqual(plan, [{ directory: 'app', tool: '.\\gradlew.bat', args: [':app:assembleDebug'], role: 'android-build' }]);
});

test('the manifest cannot introduce arbitrary templates, directories, or duplicate components', () => {
  assert.throws(() => planFor('check', manifest({ directory: '../outside', template: 'web' })), /INVALID_SOLUTION_MANIFEST/u);
  assert.throws(() => planFor('check', manifest({ directory: 'app', template: 'shell-command' })), /INVALID_SOLUTION_MANIFEST/u);
  assert.throws(() => planFor('check', manifest({ directory: 'app', template: 'web' }, { directory: 'app', template: 'web' })), /INVALID_SOLUTION_MANIFEST/u);
});
