// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ignoredDirectories = new Set([
  '.git', '.validation', '.dart_tool', '.gradle', '.kotlin', 'build', 'coverage',
  'dist', 'node_modules', 'vendor', 'bootstrap/cache', '.venv', '__pycache__',
  '.pytest_cache', '.mypy_cache', '.ruff_cache',
]);

async function sourceFiles(root, relative, extensions) {
  const base = path.join(root, relative);
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const local = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (![...ignoredDirectories].some((name) => local === name || local.endsWith(`/${name}`))) await walk(absolute);
      } else if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
        files.push(local);
      }
    }
  }
  await walk(base);
  return files.sort();
}

function reject(violations, file, text, rule, patterns) {
  for (const pattern of patterns) {
    if (pattern.test(text)) violations.push(`${rule}: ${file} matches ${pattern}`);
  }
}

export async function checkArchitecture(root) {
  root = path.resolve(root);
  const violations = [];
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const load = async (file) => decoder.decode(await readFile(path.join(root, file)));

  const phpFiles = [...await sourceFiles(root, 'starters/backend-php', ['.php']),
    ...await sourceFiles(root, 'starters/backend-php-native', ['.php'])];
  for (const file of phpFiles) {
    const text = await load(file);
    if (!/declare\(strict_types=1\);/u.test(text)) violations.push(`PHP_STRICT_TYPES: ${file}`);
    if (file.includes('/app/Domain/')) reject(violations, file, text, 'PHP_DOMAIN_DEPENDENCY', [
      /use App\\(?:Application|Infrastructure|Http|Providers)\\/u,
      /use (?:Illuminate|Laravel|PDO)(?:\\|;)/u,
    ]);
    if (file.includes('/app/Application/')) reject(violations, file, text, 'PHP_APPLICATION_BOUNDARY', [
      /use App\\(?:Infrastructure|Http|Providers)\\/u,
      /use Illuminate\\Database\\/u,
      /\bPDO\b/u,
      /\bDB::/u,
      /->(?:prepare|query|exec)\s*\(/u,
    ]);
    if (file.includes('/app/Http/')) reject(violations, file, text, 'PHP_HTTP_PERSISTENCE', [
      /use App\\Infrastructure\\/u,
      /\bPDO\b/u,
      /\bDB::/u,
      /->(?:prepare|exec)\s*\(/u,
    ]);
  }

  const nodeContracts = await load('starters/backend-node/src/contracts.ts');
  reject(violations, 'starters/backend-node/src/contracts.ts', nodeContracts, 'NODE_DOMAIN_DEPENDENCY', [
    /from ['"]node:/u, /from ['"]\.\/(?:server|sqlite|sql-store|store)\.js['"]/u,
    /from ['"](?:pg|mysql2)(?:\/[^'"]*)?['"]/u,
  ]);
  const nodeApplication = await load('starters/backend-node/src/application.ts');
  reject(violations, 'starters/backend-node/src/application.ts', nodeApplication, 'NODE_APPLICATION_BOUNDARY', [
    /from ['"]node:(?:http|https|net|sqlite)/u,
    /from ['"]\.\/(?:server|sqlite|sql-store|store)\.js['"]/u,
    /from ['"](?:pg|mysql2)(?:\/[^'"]*)?['"]/u,
  ]);

  for (const [directory, rule, patterns] of [
    ['starters/backend-python/src/project_base_api/domain', 'PYTHON_DOMAIN_DEPENDENCY', [
      /(?:from|import) project_base_api\.(?:application|infrastructure|presentation)/u,
      /(?:from|import) (?:fastapi|sqlalchemy)/u,
    ]],
    ['starters/backend-python/src/project_base_api/application', 'PYTHON_APPLICATION_BOUNDARY', [
      /(?:from|import) project_base_api\.(?:infrastructure|presentation)/u,
      /(?:from|import) (?:fastapi|sqlalchemy)/u,
    ]],
    ['starters/backend-python/src/project_base_api/presentation', 'PYTHON_PRESENTATION_PERSISTENCE', [
      /(?:from|import) (?:sqlalchemy|project_base_api\.infrastructure)/u,
    ]],
  ]) {
    for (const file of await sourceFiles(root, directory, ['.py'])) {
      reject(violations, file, await load(file), rule, patterns);
    }
  }

  for (const [directory, rule, patterns] of [
    ['starters/web/src/domain', 'WEB_DOMAIN_DEPENDENCY', [/from ['"].*(?:adapters|application|ui)\//u]],
    ['starters/web/src/application', 'WEB_APPLICATION_DEPENDENCY', [/from ['"].*ui\//u]],
    ['starters/web-vanilla/src/domain', 'VANILLA_DOMAIN_DEPENDENCY', [/from ['"].*(?:adapters|application|ui)\//u]],
    ['starters/web-vanilla/src/application', 'VANILLA_APPLICATION_DEPENDENCY', [/from ['"].*ui\//u]],
    ['starters/flutter/lib/domain', 'FLUTTER_DOMAIN_DEPENDENCY', [/package:flutter/u, /\.\.\/(?:application|infrastructure|presentation)\//u]],
    ['starters/flutter/lib/application', 'FLUTTER_APPLICATION_DEPENDENCY', [/\.\.\/(?:infrastructure|presentation)\//u]],
  ]) {
    for (const file of await sourceFiles(root, directory, ['.ts', '.tsx', '.js', '.dart'])) {
      reject(violations, file, await load(file), rule, patterns);
    }
  }

  for (const directory of [
    'starters/kotlin-android/core/src/main/kotlin/org/example/foundation/core/domain',
    'starters/kotlin-android/core/src/main/kotlin/org/example/foundation/core/application',
  ]) {
    for (const file of await sourceFiles(root, directory, ['.kt'])) {
      reject(violations, file, await load(file), 'KOTLIN_CORE_BOUNDARY', [
        /org\.example\.foundation\.core\.adapters/u,
        /androidx?\./u,
        /java\.net\./u,
        /HttpTaskRepository/u,
      ]);
    }
  }
  for (const file of [
    'starters/kotlin-android/app/src/main/java/org/example/foundation/kotlin/TaskScreen.kt',
    'starters/kotlin-android/app/src/main/java/org/example/foundation/kotlin/TaskViewModel.kt',
  ]) {
    reject(violations, file, await load(file), 'KOTLIN_PRESENTATION_TRANSPORT', [
      /java\.net\./u, /HttpURLConnection/u, /HttpTaskRepository/u,
    ]);
  }

  if (violations.length) throw new Error(`Architecture guard failed:\n${violations.join('\n')}`);
  return { result: 'PASS', rules: 15 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(await checkArchitecture(path.resolve(fileURLToPath(new URL('..', import.meta.url)))), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
