// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createSolution } from './lib/project-export.mjs';
import { interactiveCreate } from './create-app.mjs';

async function temporaryParent(t) {
  const systemTemporary = await fs.realpath(os.tmpdir());
  const parent = await fs.mkdtemp(path.join(systemTemporary, 'foundation-app-test-'));
  t.after(async () => {
    const resolved = await fs.realpath(parent);
    assert.equal(path.dirname(resolved), systemTemporary);
    assert.ok(path.basename(resolved).startsWith('foundation-app-test-'));
    assert.equal((await fs.lstat(resolved)).isSymbolicLink(), false);
    await fs.rm(resolved, { recursive: true, force: false });
  });
  return parent;
}

test('the interactive default creates a simple website with one start document', async (t) => {
  const parent = await temporaryParent(t);
  const answers = ['1', '1', 'quick-site', parent, ''];
  const reader = { question: async () => answers.shift() ?? '', close() {} };
  let transcript = '';
  const result = await interactiveCreate(reader, { write(value) { transcript += value; } });
  const destination = path.join(parent, 'quick-site');
  assert.equal(result.result, 'SOLUTION_CREATED_FOR_EVALUATION');
  assert.match(transcript, /START-HERE\.es-419\.md/u);
  const manifest = JSON.parse(await fs.readFile(path.join(destination, 'project-base.json'), 'utf8'));
  assert.equal(manifest.preset, 'simple-website');
  assert.deepEqual(manifest.components.map((item) => [item.directory, item.template]), [['app', 'web-vanilla']]);
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.es-419.md'), 'utf8'), /npm start/u);
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.en-US.md'), 'utf8'), /Start here/u);
  assert.equal((await fs.lstat(path.join(destination, 'app', 'foundation', 'adoption.json'))).isFile(), true);
});

test('a complete web preset creates client and API without installing dependencies', async (t) => {
  const parent = await temporaryParent(t);
  const destination = path.join(parent, 'complete-app');
  const result = await createSolution({ preset: 'web-app', backend: 'backend-node', name: 'complete-app', destination,
    now: () => new Date('2026-09-04T12:00:00.000Z') });
  assert.equal(result.result, 'SOLUTION_CREATED_FOR_EVALUATION');
  assert.deepEqual(result.components.map((item) => [item.directory, item.template]), [['app', 'web'], ['api', 'backend-node']]);
  const manifest = JSON.parse(await fs.readFile(path.join(destination, 'project-base.json'), 'utf8'));
  assert.equal(manifest.createdAt, '2026-09-04T12:00:00.000Z');
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.es-419.md'), 'utf8'), /comienza deliberadamente en modo memoria/u);
  await assert.rejects(fs.lstat(path.join(destination, 'app', 'node_modules')), { code: 'ENOENT' });
  await assert.rejects(fs.lstat(path.join(destination, 'api', 'node_modules')), { code: 'ENOENT' });
});

test('the English flow can be cancelled without creating anything', async (t) => {
  const parent = await temporaryParent(t);
  const defaultParent = path.join(parent, 'Default Apps');
  const answers = ['2', '6', '', 'english-app', '', 'n'];
  const reader = { question: async () => answers.shift() ?? '', close() {} };
  let transcript = '';
  const result = await interactiveCreate(reader, { write(value) { transcript += value; } }, { defaultParent });
  assert.deepEqual(result, { result: 'CANCELLED' });
  assert.match(transcript, /What do you want to create/u);
  await assert.rejects(fs.lstat(defaultParent), { code: 'ENOENT' });
});

test('invalid presets fail before creating a destination', async (t) => {
  const parent = await temporaryParent(t);
  const destination = path.join(parent, 'invalid-app');
  await assert.rejects(createSolution({ preset: 'unknown', name: 'invalid-app', destination }), { code: 'INVALID_PRESET' });
  await assert.rejects(fs.lstat(destination), { code: 'ENOENT' });
});
