// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSolution } from './lib/project-export.mjs';
import { interactiveCreate } from './create-app.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

test('every guided technology reaches a localized summary without side effects on cancel', async (t) => {
  const parent = await temporaryParent(t);
  const routes = [
    ['1', '1', null, 'HTML + CSS + JavaScript'],
    ['1', '2', '2', 'React + TypeScript'],
    ['2', '1', '3', 'Flutter + Dart'],
    ['2', '2', '1', 'Kotlin + Jetpack Compose'],
    ['3', '1', '1', 'Flutter + Dart'],
    ['4', '1', '3', 'FastAPI'],
  ];
  for (const locale of ['1', '2']) for (const [type, technology, backend, expected] of routes) {
    const answers = [locale, 'invalid', type, technology, ...(backend ? [backend] : []), 'catalog-demo', parent, 'n'];
    let closed = false;
    let transcript = '';
    const result = await interactiveCreate({
      question: async () => { assert.ok(answers.length > 0, 'Unexpected prompt'); return answers.shift(); },
      close: () => { closed = true; },
    }, { write: value => { transcript += value; } });
    assert.equal(result.result, 'CANCELLED');
    assert.ok(transcript.includes(expected));
    assert.ok(transcript.includes(locale === '1' ? 'Proyecto independiente' : 'Independent project'));
    assert.equal(answers.length, 0);
    assert.equal(closed, true);
    await assert.rejects(fs.lstat(path.join(parent, 'catalog-demo')), { code: 'ENOENT' });
  }
});

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
  const answers = ['1', '1', '1', 'quick-site', parent, ''];
  const reader = { question: async () => answers.shift() ?? '', close() {} };
  let transcript = '';
  const result = await interactiveCreate(reader, { write(value) { transcript += value; } });
  const destination = path.join(parent, 'quick-site');
  assert.equal(result.result, 'SOLUTION_CREATED_FOR_EVALUATION');
  assert.match(transcript, /START-HERE\.es-419\.md/u);
  const manifest = JSON.parse(await fs.readFile(path.join(destination, 'project-base.json'), 'utf8'));
  assert.equal(manifest.preset, 'simple-website');
  assert.equal(manifest.language, 'es-419');
  assert.deepEqual(manifest.components.map((item) => [item.directory, item.template]), [['app', 'web-vanilla']]);
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.es-419.md'), 'utf8'), /npm run doctor/u);
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.en-US.md'), 'utf8'), /Start here/u);
  const rootPackage = JSON.parse(await fs.readFile(path.join(destination, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(rootPackage.scripts), ['doctor', 'setup', 'check', 'start']);
  assert.equal((await fs.lstat(path.join(destination, 'project-base.mjs'))).isFile(), true);
  const diagnosis = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd run doctor'], { cwd: destination, encoding: 'utf8', windowsHide: true })
    : spawnSync('npm', ['run', 'doctor'], { cwd: destination, encoding: 'utf8', windowsHide: true });
  assert.equal(diagnosis.status, 0, `${diagnosis.error?.message ?? ''}\n${diagnosis.stdout ?? ''}\n${diagnosis.stderr ?? ''}`);
  assert.match(diagnosis.stdout, /PASS  Node\.js 24/u);
  assert.equal((await fs.lstat(path.join(destination, 'app', 'foundation', 'adoption.json'))).isFile(), true);
});

test('a complete web preset creates client and API without installing dependencies', async (t) => {
  const parent = await temporaryParent(t);
  const destination = path.join(parent, 'complete-app');
  const result = await createSolution({ preset: 'web-app', backend: 'backend-node', language: 'en-US', name: 'complete-app', destination,
    now: () => new Date('2026-09-04T12:00:00.000Z') });
  assert.equal(result.result, 'SOLUTION_CREATED_FOR_EVALUATION');
  assert.deepEqual(result.components.map((item) => [item.directory, item.template]), [['app', 'web'], ['api', 'backend-node']]);
  const manifest = JSON.parse(await fs.readFile(path.join(destination, 'project-base.json'), 'utf8'));
  assert.equal(manifest.createdAt, '2026-09-04T12:00:00.000Z');
  assert.equal(manifest.language, 'en-US');
  assert.match(await fs.readFile(path.join(destination, 'START-HERE.es-419.md'), 'utf8'), /comienza deliberadamente en modo memoria/u);
  await assert.rejects(fs.lstat(path.join(destination, 'app', 'node_modules')), { code: 'ENOENT' });
  await assert.rejects(fs.lstat(path.join(destination, 'api', 'node_modules')), { code: 'ENOENT' });
});

test('the English flow can be cancelled without creating anything', async (t) => {
  const parent = await temporaryParent(t);
  const defaultParent = path.join(parent, 'Default Apps');
  const answers = ['2', '4', '', '', 'english-app', '', 'n'];
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

test('invalid solution languages fail before creating a destination', async (t) => {
  const parent = await temporaryParent(t);
  const destination = path.join(parent, 'invalid-language');
  await assert.rejects(createSolution({ preset: 'simple-website', language: 'es', name: 'invalid-language', destination }), { code: 'INVALID_LANGUAGE' });
  await assert.rejects(fs.lstat(destination), { code: 'ENOENT' });
});

test('the approved JSON receipt has a cross-platform byte-preservation rule', async () => {
  const attributes = await fs.readFile(path.join(repositoryRoot, '.gitattributes'), 'utf8');
  assert.match(attributes, /^releases\/foundation-0\.1\.0-draft\.4\.verification\.json text eol=crlf$/mu);
});
