// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { getCreationCatalog } from './lib/creation-catalog.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

async function temporaryParent(t) {
  const systemTemporary = await fs.realpath(os.tmpdir());
  const parent = await fs.mkdtemp(path.join(systemTemporary, 'project-base-mcp-test-'));
  t.after(async () => {
    const resolved = await fs.realpath(parent);
    assert.equal(path.dirname(resolved), systemTemporary);
    assert.ok(path.basename(resolved).startsWith('project-base-mcp-test-'));
    assert.equal((await fs.lstat(resolved)).isSymbolicLink(), false);
    await fs.rm(resolved, { recursive: true, force: false });
  });
  return parent;
}

test('the stdio MCP server exposes bounded resources, diagnosis, and creation', async (t) => {
  const parent = await temporaryParent(t);
  const client = new Client({ name: 'project-base-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(repositoryRoot, 'tools', 'mcp-server.mjs')],
    cwd: repositoryRoot,
    stderr: 'pipe',
  });
  t.after(async () => { await client.close(); });
  await client.connect(transport);

  const listedTools = await client.listTools();
  assert.deepEqual(listedTools.tools.map(item => item.name).sort(), [
    'project_base_create_solution', 'project_base_doctor', 'project_base_list_templates',
  ]);
  assert.equal(listedTools.tools.find(item => item.name === 'project_base_list_templates').annotations.readOnlyHint, true);
  assert.equal(listedTools.tools.find(item => item.name === 'project_base_create_solution').annotations.readOnlyHint, false);

  const listedResources = await client.listResources();
  assert.equal(listedResources.resources.length, 8);
  const guide = await client.readResource({ uri: 'project-base://getting-started/es-419' });
  assert.match(guide.contents[0].text, /# Cómo crear una aplicación con esta base/u);

  const catalog = await client.callTool({ name: 'project_base_list_templates', arguments: { language: 'en-US' } });
  assert.equal(catalog.isError, undefined);
  assert.deepEqual(catalog.structuredContent, getCreationCatalog('en-US'));
  assert.equal(catalog.structuredContent.presets.length, 6);
  assert.equal(catalog.structuredContent.backends.length, 4);
  assert.equal(catalog.structuredContent.backends[3].id, 'backend-php-native');
  assert.equal(catalog.structuredContent.backends[2].id, 'backend-python');

  const diagnosis = await client.callTool({ name: 'project_base_doctor', arguments: { preset: 'simple-website', language: 'es-419' } });
  assert.equal(diagnosis.isError, undefined);
  assert.equal(diagnosis.structuredContent.ready, true);
  assert.deepEqual(diagnosis.structuredContent.components, [{ directory: 'app', template: 'web-vanilla' }]);

  const destination = path.join(parent, 'created-through-mcp');
  const creation = await client.callTool({ name: 'project_base_create_solution', arguments: {
    preset: 'simple-website', language: 'en-US', name: 'created-through-mcp', destination,
  } });
  assert.equal(creation.isError, undefined);
  assert.equal(creation.structuredContent.destination, destination);
  assert.equal(JSON.parse(await fs.readFile(path.join(destination, 'project-base.json'), 'utf8')).language, 'en-US');
  assert.equal((await fs.lstat(path.join(destination, 'project-base.mjs'))).isFile(), true);

  const nativeDestination = path.join(parent, 'native-through-mcp');
  const nativeCreation = await client.callTool({ name: 'project_base_create_solution', arguments: {
    preset: 'api-only', backend: 'backend-php-native', language: 'es-419', name: 'native-through-mcp', destination: nativeDestination,
  } });
  assert.equal(nativeCreation.isError, undefined);
  const nativeManifest = JSON.parse(await fs.readFile(path.join(nativeDestination, 'project-base.json')));
  assert.deepEqual(nativeManifest.components, [{ directory: 'api', template: 'backend-php-native', revision: '1.3.0-draft.2' }]);
  await assert.rejects(fs.lstat(path.join(nativeDestination, 'api/.runtime')), { code: 'ENOENT' });

  const refused = await client.callTool({ name: 'project_base_create_solution', arguments: {
    preset: 'simple-website', name: 'relative-refused', destination: 'relative/path',
  } });
  assert.equal(refused.isError, true);
  assert.equal(refused.structuredContent.error, 'ABSOLUTE_DESTINATION_REQUIRED');
});

test('the stdio MCP server also serves the pinned 2026 protocol revision', async (t) => {
  const client = new Client({ name: 'project-base-modern-test', version: '1.0.0' }, {
    versionNegotiation: { mode: { pin: '2026-07-28' } },
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(repositoryRoot, 'tools', 'mcp-server.mjs')],
    cwd: repositoryRoot,
    stderr: 'pipe',
  });
  t.after(async () => { await client.close(); });
  await client.connect(transport);
  assert.equal(client.getNegotiatedProtocolVersion(), '2026-07-28');
  assert.equal((await client.listTools()).tools.length, 3);
});
