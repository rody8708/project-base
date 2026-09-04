// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
test('all independently exportable starters carry the identical API contract', async () => {
  const texts = await Promise.all(['web', 'web-vanilla', 'flutter', 'kotlin-android', 'backend-php', 'backend-node', 'backend-python'].map(name =>
    readFile(new URL(`starters/${name}/contracts/task-api-v1.openapi.json`, root), 'utf8')));
  for (const text of texts) assert.equal(text, texts[0]);
  const contract = JSON.parse(texts[0]);
  assert.equal(contract.openapi, '3.1.0');
  assert.deepEqual(contract.security, [{ bearerAuth: [] }]);
  assert.equal(contract.components.securitySchemes.bearerAuth.scheme, 'bearer');
  assert.ok(contract.paths['/auth/token'].delete);
  assert.equal(contract.components.schemas.Task.properties.title.maxLength, 80);
  assert.equal(contract.paths['/tasks/{id}'].put.requestBody.content['application/json'].schema.properties.version.maximum, 2147483645);
});
test('framework-free transport code is identical in both web starters', async () => {
  assert.equal(await readFile(new URL('starters/web/src/adapters/task-api.js', root), 'utf8'),
    await readFile(new URL('starters/web-vanilla/src/adapters/task-api.js', root), 'utf8'));
});
