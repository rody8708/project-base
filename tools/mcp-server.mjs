#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import path from 'node:path';
import process from 'node:process';
import { lstat, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { createSolution, ExportError, SOLUTION_PRESETS, TEMPLATE_REVISIONS } from './lib/project-export.mjs';
import { diagnose } from './solution-runner.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const LANGUAGES = ['es-419', 'en-US'];
const BACKENDS = ['backend-node', 'backend-php', 'backend-python'];
const PRESET_COPY = {
  'es-419': {
    'simple-website': 'Sitio web HTML, CSS y JavaScript sin backend.',
    'web-app': 'Aplicación web React con una API separada.',
    'mobile-app': 'Aplicación móvil Flutter con una API separada.',
    'desktop-app': 'Aplicación de escritorio Flutter con una API separada.',
    'android-app': 'Aplicación Android nativa Kotlin con una API separada.',
    'api-only': 'API independiente sin interfaz incluida.',
  },
  'en-US': {
    'simple-website': 'HTML, CSS, and JavaScript website without a backend.',
    'web-app': 'React web application with a separate API.',
    'mobile-app': 'Flutter mobile application with a separate API.',
    'desktop-app': 'Flutter desktop application with a separate API.',
    'android-app': 'Native Kotlin Android application with a separate API.',
    'api-only': 'Standalone API without an included client.',
  },
};
const BACKEND_COPY = {
  'es-419': { 'backend-node': 'TypeScript y Node.js sin framework de aplicación.', 'backend-php': 'PHP y Laravel.', 'backend-python': 'Python, FastAPI y adaptadores SQLAlchemy.' },
  'en-US': { 'backend-node': 'TypeScript and Node.js without an application framework.', 'backend-php': 'PHP and Laravel.', 'backend-python': 'Python, FastAPI, and SQLAlchemy adapters.' },
};
const RESOURCES = [
  ['getting-started-es-419', 'project-base://getting-started/es-419', 'Cómo comenzar', 'docs/getting-started.es-419.md'],
  ['getting-started-en-US', 'project-base://getting-started/en-US', 'Getting started', 'docs/getting-started.en-US.md'],
  ['immutable-rules-es-419', 'project-base://immutable-rules/es-419', 'Reglas inmutables', 'docs/immutable-rules.es-419.md'],
  ['immutable-rules-en-US', 'project-base://immutable-rules/en-US', 'Immutable rules', 'docs/immutable-rules.en-US.md'],
  ['engineering-standards-es-419', 'project-base://engineering-standards/es-419', 'Estándares de ingeniería', 'docs/engineering-standards.es-419.md'],
  ['engineering-standards-en-US', 'project-base://engineering-standards/en-US', 'Engineering standards', 'docs/engineering-standards.en-US.md'],
  ['api-boundary-es-419', 'project-base://api-boundary/es-419', 'Límite API', 'docs/technical/api-boundary.es-419.md'],
  ['api-boundary-en-US', 'project-base://api-boundary/en-US', 'API boundary', 'docs/technical/api-boundary.en-US.md'],
];

const languageSchema = z.enum(LANGUAGES);
const presetSchema = z.enum(Object.keys(SOLUTION_PRESETS));
const backendSchema = z.enum(BACKENDS);
const componentSchema = z.object({ directory: z.enum(['app', 'api']), template: z.enum(Object.keys(TEMPLATE_REVISIONS)) });

function componentsFor(preset, backend) {
  const selection = SOLUTION_PRESETS[preset];
  return [
    ...(selection.client ? [{ directory: 'app', template: selection.client }] : []),
    ...(selection.backend ? [{ directory: 'api', template: backend }] : []),
  ];
}

function toolResult(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value };
}

async function readResourceFile(relativePath) {
  const target = path.join(ROOT, relativePath);
  const status = await lstat(target);
  if (!status.isFile() || status.isSymbolicLink() || status.nlink !== 1) throw new Error('RESOURCE_NOT_A_PLAIN_FILE');
  return readFile(target, 'utf8');
}

export function createProjectBaseServer() {
  const server = new McpServer({ name: 'project-base', version: '1.1.0-draft.2' });

  for (const [name, uri, title, relativePath] of RESOURCES) {
    server.registerResource(name, uri, { title, description: 'Version-controlled Project Base guidance.', mimeType: 'text/markdown' }, async resourceUri => ({
      contents: [{ uri: resourceUri.href, mimeType: 'text/markdown', text: await readResourceFile(relativePath) }],
    }));
  }

  const catalogEntrySchema = z.object({ id: z.string(), description: z.string(), client: z.string().nullable(), requiresBackend: z.boolean() });
  const backendEntrySchema = z.object({ id: backendSchema, description: z.string() });
  server.registerTool('project_base_list_templates', {
    title: 'List Project Base templates',
    description: 'List the supported guided application presets and backend choices without changing files.',
    inputSchema: z.object({ language: languageSchema.default('es-419') }),
    outputSchema: z.object({ language: languageSchema, presets: z.array(catalogEntrySchema), backends: z.array(backendEntrySchema) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ language }) => toolResult({
    language,
    presets: Object.entries(SOLUTION_PRESETS).map(([id, value]) => ({ id, description: PRESET_COPY[language][id], client: value.client || null, requiresBackend: value.backend })),
    backends: BACKENDS.map(id => ({ id, description: BACKEND_COPY[language][id] })),
  }));

  const diagnosisSchema = z.object({ name: z.string(), ok: z.boolean(), detail: z.string() });
  server.registerTool('project_base_doctor', {
    title: 'Inspect Project Base requirements',
    description: 'Inspect this computer for the tools required by one supported preset. It does not install or modify anything.',
    inputSchema: z.object({ preset: presetSchema, backend: backendSchema.default('backend-node'), language: languageSchema.default('es-419') }),
    outputSchema: z.object({ ready: z.boolean(), checks: z.array(diagnosisSchema), components: z.array(componentSchema) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ preset, backend, language }) => {
    const components = componentsFor(preset, backend);
    const checks = diagnose({ kind: 'project-base-solution', language, components });
    return toolResult({ ready: checks.every(item => item.ok), checks, components });
  });

  server.registerTool('project_base_create_solution', {
    title: 'Create a Project Base solution',
    description: 'Create one new solution at an absolute local destination. It refuses existing destinations and never installs dependencies, uses credentials, or publishes.',
    inputSchema: z.object({ preset: presetSchema, backend: backendSchema.default('backend-node'), language: languageSchema.default('es-419'), name: z.string().min(1).max(59), destination: z.string().min(1) }),
    outputSchema: z.object({ result: z.string(), destination: z.string(), name: z.string(), preset: presetSchema, components: z.array(componentSchema), startHere: z.string() }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ preset, backend, language, name, destination }) => {
    try {
      const created = await createSolution({ preset, backend, language, name, destination });
      return toolResult({ ...created, components: created.components.map(({ directory, template }) => ({ directory, template })) });
    } catch (error) {
      const failure = error instanceof ExportError
        ? { error: error.code, message: error.message }
        : { error: 'SOLUTION_CREATION_FAILED', message: 'The solution could not be created.' };
      return { ...toolResult(failure), isError: true };
    }
  });

  return server;
}

export function serveProjectBaseMcp() {
  return serveStdio(createProjectBaseServer, { onerror: () => process.stderr.write('Project Base MCP transport error.\n') });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const handle = serveProjectBaseMcp();
  process.once('SIGINT', () => { void handle.close(); });
  process.once('SIGTERM', () => { void handle.close(); });
}
