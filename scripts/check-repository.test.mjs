// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { assertPairedDocuments, assertPairedLinks, headingIds, visibleMarkdown, checkRepository } from './check-repository.mjs';

test('requires counterparts in both directions, including an extra English file', () => {
  assert.throws(() => assertPairedDocuments(new Map([['a.en-US.md', '# A']])));
  assert.throws(() => assertPairedDocuments(new Map([['a.es-419.md', '# A']])));
  assert.doesNotThrow(() => assertPairedDocuments(new Map([['a.en-US.md', '# A'], ['a.es-419.md', '# A']])));
});
test('link parity is ordinal and normalizes only locale suffixes', () => {
  assert.doesNotThrow(() => assertPairedLinks('[Inicio](README.es-419.md)', '[Home](README.en-US.md)'));
  assert.throws(() => assertPairedLinks('[A](Case.es-419.md)', '[A](case.en-US.md)'));
});
test('fenced examples do not create links or headings', () => {
  const text = '# Title\n\n```text\n# Fake\n[A](missing.md)\n```\n';
  assert.equal(visibleMarkdown(text).includes('missing.md'), false);
  assert.deepEqual([...headingIds(text)], ['title']);
});
test('anchors retain Unicode and distinguish duplicate headings', () => {
  assert.deepEqual([...headingIds('# Árbol\n## Case\n## Case\n')], ['árbol', 'case', 'case-1']);
});
test('a fresh fixture passes without altering it; dependencies are excluded', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'foundation-document-test-'));
  await writeFile(path.join(root, 'README.es-419.md'), '# Inicio\n\n[English](README.en-US.md)\n');
  await writeFile(path.join(root, 'README.en-US.md'), '# Home\n\n[Español](README.es-419.md)\n');
  await mkdir(path.join(root, 'node_modules'));
  await writeFile(path.join(root, 'node_modules', 'README.md'), 'External dependency');
  const result = await checkRepository(root, { verifyRelease: false });
  assert.equal(result.documents, 2);
  assert.equal(result.localLinks, 2);
});
test('broken local links and escaping the project are rejected', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'foundation-link-test-'));
  for (const locale of ['es-419', 'en-US']) await writeFile(path.join(root, `README.${locale}.md`), '# Title\n\n[Missing](missing.txt)\n');
  await assert.rejects(checkRepository(root, { verifyRelease: false }), /Broken link/);
  for (const locale of ['es-419', 'en-US']) await writeFile(path.join(root, `README.${locale}.md`), '# Title\n\n[Outside](../outside.txt)\n');
  await assert.rejects(checkRepository(root, { verifyRelease: false }), /leaves repository/);
});
