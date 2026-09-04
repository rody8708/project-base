// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { planFor } from './solution-runner.mjs';

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

test('Android start builds safely instead of choosing a device', () => {
  const plan = planFor('start', manifest({ directory: 'app', template: 'kotlin-android' }), 'win32');
  assert.deepEqual(plan, [{ directory: 'app', tool: '.\\gradlew.bat', args: [':app:assembleDebug'], role: 'android-build' }]);
});

test('the manifest cannot introduce arbitrary templates, directories, or duplicate components', () => {
  assert.throws(() => planFor('check', manifest({ directory: '../outside', template: 'web' })), /INVALID_SOLUTION_MANIFEST/u);
  assert.throws(() => planFor('check', manifest({ directory: 'app', template: 'shell-command' })), /INVALID_SOLUTION_MANIFEST/u);
  assert.throws(() => planFor('check', manifest({ directory: 'app', template: 'web' }, { directory: 'app', template: 'web' })), /INVALID_SOLUTION_MANIFEST/u);
});
