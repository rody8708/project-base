// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkArchitecture } from './check-architecture.mjs';

const repository = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'foundation-architecture-'));
  t.after(async () => {
    const { rm } = await import('node:fs/promises');
    await rm(root, { recursive: true });
  });
  const directories = [
    'starters/backend-php/app/Domain', 'starters/backend-php/app/Application', 'starters/backend-php/app/Http',
    'starters/backend-node/src', 'starters/web/src/domain', 'starters/web/src/application',
    'starters/web-vanilla/src/domain', 'starters/web-vanilla/src/application',
    'starters/flutter/lib/domain', 'starters/flutter/lib/application',
    'starters/kotlin-android/core/src/main/kotlin/org/example/foundation/core/domain',
    'starters/kotlin-android/core/src/main/kotlin/org/example/foundation/core/application',
    'starters/kotlin-android/app/src/main/java/org/example/foundation/kotlin',
  ];
  await Promise.all(directories.map((directory) => mkdir(path.join(root, directory), { recursive: true })));
  const put = (relative, text) => writeFile(path.join(root, relative), text);
  await Promise.all([
    put('starters/backend-php/app/Domain/Task.php', '<?php declare(strict_types=1); namespace App\\Domain; final class Task {}\n'),
    put('starters/backend-php/app/Application/TaskService.php', '<?php declare(strict_types=1); namespace App\\Application; final class TaskService {}\n'),
    put('starters/backend-php/app/Http/TaskController.php', '<?php declare(strict_types=1); namespace App\\Http; final class TaskController {}\n'),
    put('starters/backend-node/src/contracts.ts', 'export interface Repository {}\n'),
    put('starters/backend-node/src/application.ts', "import type { Repository } from './contracts.js';\nexport const useCase = (_repository: Repository) => true;\n"),
    put('starters/kotlin-android/app/src/main/java/org/example/foundation/kotlin/TaskScreen.kt', 'package org.example.foundation.kotlin\nclass TaskScreen\n'),
    put('starters/kotlin-android/app/src/main/java/org/example/foundation/kotlin/TaskViewModel.kt', 'package org.example.foundation.kotlin\nclass TaskViewModel\n'),
  ]);
  return root;
}

test('the maintained starters satisfy the architecture ratchet', async () => {
  assert.equal((await checkArchitecture(repository)).result, 'PASS');
});

test('raw persistence in a PHP application service is rejected', async (t) => {
  const root = await fixture(t);
  const file = path.join(root, 'starters/backend-php/app/Application/TaskService.php');
  await writeFile(file, `${await readFile(file, 'utf8')}\n<?php PDO::prepare('SELECT 1');\n`);
  await assert.rejects(checkArchitecture(root), /PHP_APPLICATION_BOUNDARY/u);
});

test('an outward domain dependency is rejected', async (t) => {
  const root = await fixture(t);
  const file = path.join(root, 'starters/backend-php/app/Domain/Task.php');
  await writeFile(file, `${await readFile(file, 'utf8')}\n<?php use App\\Infrastructure\\SqlTaskRepository;\n`);
  await assert.rejects(checkArchitecture(root), /PHP_DOMAIN_DEPENDENCY/u);
});

test('transport imported into Node application code is rejected', async (t) => {
  const root = await fixture(t);
  const file = path.join(root, 'starters/backend-node/src/application.ts');
  await writeFile(file, `${await readFile(file, 'utf8')}\nimport http from 'node:http';\n`);
  await assert.rejects(checkArchitecture(root), /NODE_APPLICATION_BOUNDARY/u);
});

test('maintained PHP without strict types is rejected', async (t) => {
  const root = await fixture(t);
  const file = path.join(root, 'starters/backend-php/app/Domain/Task.php');
  await writeFile(file, (await readFile(file, 'utf8')).replace('declare(strict_types=1);', ''));
  await assert.rejects(checkArchitecture(root), /PHP_STRICT_TYPES/u);
});
