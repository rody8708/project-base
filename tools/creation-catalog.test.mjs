// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { getCreationCatalog } from './lib/creation-catalog.mjs';
import { SOLUTION_PRESETS, TEMPLATE_REVISIONS } from './lib/project-export.mjs';

test('catalog covers exactly the implemented presets in both languages', () => {
  for (const language of ['es-419', 'en-US']) {
    const catalog = getCreationCatalog(language);
    assert.deepEqual(catalog.presets.map(item => item.id).sort(), Object.keys(SOLUTION_PRESETS).sort());
    for (const item of catalog.presets) {
      assert.ok(catalog.types.some(type => type.id === item.type));
      assert.equal(item.client, SOLUTION_PRESETS[item.id].client);
      assert.equal(item.requiresBackend, SOLUTION_PRESETS[item.id].backend);
      if (item.client) {
        assert.ok(Object.hasOwn(TEMPLATE_REVISIONS, item.client));
        assert.ok(item.languages.length > 0);
      }
    }
    for (const backend of catalog.backends) {
      assert.ok(Object.hasOwn(TEMPLATE_REVISIONS, backend.id));
      assert.ok(backend.languages.length > 0);
    }
  }
});

test('catalog rejects unknown locales and callers cannot change future results', () => {
  assert.throws(() => getCreationCatalog('fr'), RangeError);
  const first = getCreationCatalog();
  first.presets[0].languages.push('invented');
  first.backends.pop();
  assert.equal(getCreationCatalog().backends.length, 4);
  assert.deepEqual(getCreationCatalog().presets[0].languages, ['HTML', 'CSS', 'JavaScript']);
});
