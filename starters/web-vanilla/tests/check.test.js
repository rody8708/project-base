// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs/promises';
import { checkHtml, checkMessages, checkTheme, collectJavaScript, inspectProject } from '../scripts/check.mjs';
import { messages as spanish } from '../src/i18n/es-419.js';
import { messages as english } from '../src/i18n/en-US.js';

test('consumer UI does not display foundation release metadata', async () => {
  const page = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const copy of [page, ...Object.values(spanish), ...Object.values(english)]) {
    assert.doesNotMatch(copy, /\b\d+\.\d+\.\d+(?:-[\w.]+)?\b|\bcandidat[ae]\b/i);
  }
});

const html = '<!doctype html><html lang="es-419"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="./styles.css"><link rel="icon" href="./favicon.svg"></head><body><script type="module" src="./src/main.js"></script></body></html>';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'foundation-vanilla-check-'));
  for (const directory of ['src/i18n', 'scripts', 'tests']) await fs.mkdir(path.join(root, directory), { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(root, 'package.json'), '{"type":"module"}'),
    fs.writeFile(path.join(root, 'index.html'), html),
    fs.writeFile(path.join(root, 'styles.css'), ':root { color-scheme: light dark; } @media (prefers-color-scheme: dark) { body { color: white; } }'),
    fs.writeFile(path.join(root, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>'),
    fs.writeFile(path.join(root, 'src', 'main.js'), 'export const value = 1;'),
    fs.writeFile(path.join(root, 'src', 'i18n', 'es-419.js'), 'export const messages = Object.freeze({ title: "Tareas", count: "{total} tareas" });'),
    fs.writeFile(path.join(root, 'src', 'i18n', 'en-US.js'), 'export const messages = Object.freeze({ title: "Tasks", count: "{total} tasks" });'),
    fs.writeFile(path.join(root, 'scripts', 'fixture.mjs'), 'export const fixture = true;'),
    fs.writeFile(path.join(root, 'tests', 'fixture.test.js'), 'import test from "node:test"; test("fixture", () => {});'),
  ]);
  t.after(async () => {
    assert.equal(path.dirname(root), os.tmpdir());
    assert.match(path.basename(root), /^foundation-vanilla-check-/);
    await fs.rm(root, { recursive: true, force: true });
  });
  return root;
}

test('HTML checks accept the agreed local relative resources and language', () => {
  assert.doesNotThrow(() => checkHtml(html));
  assert.doesNotThrow(() => checkHtml(html.replaceAll('="./', '="/')));
});

test('HTML checks reject missing language, encoding, viewport, or local resources', () => {
  for (const invalid of [html.replace('es-419', 'en-US'), html.replace('UTF-8', 'UTF-16'), html.replace('width=device-width', 'width=1000'), html.replace('./styles.css', 'https://example.invalid/style.css'), html.replace('./favicon.svg', './missing.svg'), html.replace('./src/main.js', './src/other.js')]) {
    assert.throws(() => checkHtml(invalid));
  }
});

test('HTML checks reject inline code, event handlers, and styles', () => {
  for (const invalid of [html.replace('</script>', 'alert(1)</script>'), html.replace('<body>', '<body onload="run()">'), html.replace('<body>', '<body style="color:red">'), html.replace('<body>', '<body><style>body{color:red}</style>'), html.replace('</body>', '<script src="./other.js"></script></body>')]) {
    assert.throws(() => checkHtml(invalid));
  }
});

test('HTML comments cannot supply a missing checked resource', () => {
  assert.throws(() => checkHtml(html.replace('<link rel="icon" href="./favicon.svg">', '<!-- <link rel="icon" href="./favicon.svg"> -->')));
});

test('locale checks compare keys and interpolation names, not translated text', () => {
  assert.equal(checkMessages({ count: '{total} tareas', title: 'Tareas' }, { title: 'Tasks', count: '{total} tasks' }), 2);
  assert.throws(() => checkMessages({ title: 'Tareas' }, { name: 'Tasks' }));
  assert.throws(() => checkMessages({ title: '{total} tareas' }, { title: '{count} tasks' }));
  assert.throws(() => checkMessages({ title: '' }, { title: 'Tasks' }));
  assert.throws(() => checkMessages({ title: () => 'Tareas' }, { title: 'Tasks' }));
});

test('theme checks require native light and dark appearance support', () => {
  assert.doesNotThrow(() => checkTheme(':root { color-scheme: light dark; } @media (prefers-color-scheme: dark) {}'));
  assert.throws(() => checkTheme(':root { color-scheme: light; }'));
  assert.throws(() => checkTheme(':root { color-scheme: light dark; }'));
});

test('source inspection checks every JS file and both locale modules', async (t) => {
  const root = await fixture(t);
  const result = await inspectProject(root);
  assert.equal(result.syntaxFiles, 5);
  assert.equal(result.localeKeys, 2);
  assert.deepEqual(result.testFiles, [path.join('tests', 'fixture.test.js')]);
});

test('source inspection rejects a JavaScript syntax error', async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'src', 'main.js'), 'export const = ;');
  await assert.rejects(inspectProject(root), /syntax check failed/);
});

test('source inspection rejects unequal locale exports', async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'src', 'i18n', 'en-US.js'), 'export const messages = { other: "Different" };');
  await assert.rejects(inspectProject(root), /same message keys/);
});

test('source discovery excludes non-JavaScript files', async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, 'src', 'ignored.txt'), 'not JavaScript');
  assert.equal((await collectJavaScript(root)).length, 5);
});

test('source discovery rejects linked directories without following them', async (t) => {
  const root = await fixture(t);
  const target = path.join(root, 'owned-target');
  await fs.mkdir(target);
  const link = path.join(root, 'src', 'linked');
  await fs.symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(collectJavaScript(root), /Linked source paths/);
  await fs.unlink(link);
});
