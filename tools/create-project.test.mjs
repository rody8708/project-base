// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArguments } from './create-project.mjs';
import {
  APPROVED_DOCUMENTARY_RELEASE, CAPABILITY_PROFILE_FILES, TEMPLATE_FILES, TEMPLATE_REVISION, TEMPLATE_REVISIONS, assertNoPortableCollisions,
  createProject, isWithin, sha256, shouldExclude, validateDestinationPath,
  validateProjectName, validateRelativePath,
} from './lib/project-export.mjs';

// These are synthetic files, not replacement approval evidence. The CLI cannot
// override release pins; the imported function accepts fixture-only parameters.
async function fixture(t) {
  const temporaryParent = await fs.realpath(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporaryParent, 'foundation-export-test-'));
  t.after(async () => {
    const resolved = await fs.realpath(root);
    assert.equal(path.dirname(resolved), temporaryParent);
    assert.ok(path.basename(resolved).startsWith('foundation-export-test-'));
    assert.equal((await fs.lstat(root)).isSymbolicLink(), false);
    // Only this test's freshly created, validated temporary tree is removed.
    await fs.rm(resolved, { recursive: true, force: false });
  });
  const repositoryRoot = path.join(root, 'repository');
  const projects = path.join(root, 'projects');
  await fs.mkdir(projects);
  const put = async (relative, bytes) => {
    const target = path.join(repositoryRoot, ...relative.split('/'));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  };
  for (const template of Object.keys(TEMPLATE_FILES)) {
    await put(`starters/${template}/README.es-419.md`, '# Ejemplo sintético\r\n');
    await put(`starters/${template}/README.en-US.md`, '# Synthetic example\n');
    await put(`starters/${template}/.env.example`, 'PUBLIC_EXAMPLE=placeholder\n');
    await put(`starters/${template}/.gitignore`, 'build/\n');
  }
  await put('starters/web/package.json', JSON.stringify({
    name: 'starter-web', version: TEMPLATE_REVISION, private: true,
    scripts: { postinstall: 'this-fixture-must-never-be-executed' },
  }));
  await put('starters/web/package-lock.json', JSON.stringify({
    name: 'starter-web', version: TEMPLATE_REVISION, lockfileVersion: 3,
    packages: { '': { name: 'starter-web', version: TEMPLATE_REVISION },
      'node_modules/example': { version: '1.2.3', integrity: 'synthetic-integrity' } },
  }));
  await put('starters/web/src/main.ts', 'export const example = 1;\r\n');
  await put('starters/web/assets/bytes.bin', Buffer.from([0, 1, 128, 255, 13, 10]));
  await put('starters/web-vanilla/package.json', JSON.stringify({
    name: 'starter-web-vanilla', version: TEMPLATE_REVISION, private: true, type: 'module',
    scripts: { test: 'node --test', start: 'node scripts/serve.mjs', check: 'node scripts/check.mjs',
      postinstall: 'this-fixture-must-never-be-executed' },
    dependencies: {}, devDependencies: {},
  }));
  await put('starters/web-vanilla/package-lock.json', JSON.stringify({
    name: 'starter-web-vanilla', version: TEMPLATE_REVISION, lockfileVersion: 3,
    packages: { '': { name: 'starter-web-vanilla', version: TEMPLATE_REVISION } },
  }));
  await put('starters/web-vanilla/index.html', '<!doctype html>\r\n<html lang="en-US"></html>\r\n');
  await put('starters/web-vanilla/styles.css', ':root { color-scheme: light dark; }\n');
  await put('starters/web-vanilla/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>\n');
  await put('starters/web-vanilla/src/main.js', 'export const title = "Ejemplo / Example";\n');
  await put('starters/web-vanilla/scripts/serve.mjs', 'import http from "node:http"; // Synthetic source only\n');
  await put('starters/web-vanilla/scripts/server.mjs', 'export const localHost = "127.0.0.1"; // Synthetic source only\n');
  await put('starters/web-vanilla/scripts/check.mjs', 'import assert from "node:assert/strict"; // Synthetic source only\n');
  await put('starters/web-vanilla/assets/bytes.bin', Buffer.from([0, 128, 255, 13, 10]));
  await put('starters/flutter/pubspec.yaml', `name: foundation_starter\nversion: ${TEMPLATE_REVISIONS.flutter}\n`);
  await put('starters/flutter/pubspec.lock', '# Synthetic lock\npackages: {}\n');
  await put('starters/flutter/lib/main.dart', 'const example = 1;\n');
  await put('starters/flutter/android/app/build.gradle.kts', 'applicationId = "com.example.foundation_starter"\n');
  await put('starters/flutter/android/app/gradle.lockfile', 'synthetic:library:1.0=debugRuntimeClasspath\n');
  for (const relative of TEMPLATE_FILES['kotlin-android']) await put(`starters/kotlin-android/${relative}`, `SYNTHETIC WRAPPER/BUILD FILE: ${relative}\n`);
  await put('starters/kotlin-android/app/build.gradle.kts', 'applicationId = "org.example.synthetic"\n');
  await put('starters/kotlin-android/app/gradle.lockfile', 'synthetic:library:1.0=debugRuntimeClasspath\n');
  await put('starters/backend-php/composer.json', '{"name":"synthetic/foundation","require":{"php":"^8.5"}}\n');
  await put('starters/backend-php/composer.lock', '{"packages":[],"packages-dev":[],"content-hash":"synthetic"}\n');
  await put('starters/backend-php/artisan', '<?php // Synthetic entrypoint\n');
  await put('starters/backend-php/bootstrap/app.php', '<?php // Synthetic bootstrap\n');
  await put('starters/backend-php/database/migrations/example.php', '<?php // Synthetic migration\n');
  await put('starters/backend-node/package.json', JSON.stringify({ name: 'foundation-backend-node', version: TEMPLATE_REVISION, private: true }));
  await put('starters/backend-node/package-lock.json', JSON.stringify({ name: 'foundation-backend-node', version: TEMPLATE_REVISION, lockfileVersion: 3, packages: { '': { name: 'foundation-backend-node', version: TEMPLATE_REVISION } } }));
  await put('starters/backend-node/tsconfig.json', '{}\n');
  await put('starters/backend-node/src/server.ts', 'export const server = true;\n');
  await put('starters/backend-python/pyproject.toml', '[project]\nname = "foundation-backend-python"\n');
  await put('starters/backend-python/.python-version', '3.13.15\n');
  await put('starters/backend-python/uv.lock', 'version = 1\n');
  await put('starters/backend-python/src/project_base_api/main.py', 'app = object()\n');
  for (const relative of TEMPLATE_FILES['backend-php-native']) await put(`starters/backend-php-native/${relative}`, `SYNTHETIC NATIVE SOURCE: ${relative}\n`);
  const release = {
    version: '1.0.0', editorialRevision: '0.1.0-draft.4', files: [],
  };
  for (const name of CAPABILITY_PROFILE_FILES) {
    await put(`templates/${name}`, `# SYNTHETIC CAPABILITY PROFILE: ${name}\n`);
  }
  for (const spec of APPROVED_DOCUMENTARY_RELEASE.files) {
    const bytes = Buffer.from(`SYNTHETIC TEST ARTIFACT ONLY: ${spec.role}\n`);
    await put(`releases/${spec.name}`, bytes);
    release.files.push({ role: spec.role, name: spec.name, sha256: sha256(bytes) });
  }
  return {
    root, repositoryRoot, projects, release, put,
    source: (relative) => path.join(repositoryRoot, ...relative.split('/')),
    destination: (name = 'new-project') => path.join(projects, name),
    run(options = {}) {
      return createProject({
        repositoryRoot, release, template: 'web', name: 'new-project',
        destination: path.join(projects, 'new-project'),
        now: () => new Date('2026-09-02T12:00:00.000Z'), ...options,
      });
    },
  };
}

async function absent(target) {
  await assert.rejects(fs.lstat(target), { code: 'ENOENT' });
}

async function rejectBeforeCreating(f, code, options = {}) {
  const target = options.destination ?? f.destination();
  await assert.rejects(f.run(options), { code });
  await absent(target);
}

test('web export preserves source bytes, customizes both npm root names, and records pending adoption', async (t) => {
  const f = await fixture(t);
  const manifestBefore = await fs.readFile(f.source('starters/web/package.json'));
  const lockBefore = await fs.readFile(f.source('starters/web/package-lock.json'));
  const result = await f.run();
  assert.equal(result.result, 'CREATED_FOR_EVALUATION');
  assert.equal(result.filesCopied, 15);
  assert.equal(result.consumerAdoptionStatus, 'pending-consumer-confirmation');
  assert.equal(result.technicalTemplateStatus, 'not-approved');
  assert.equal(result.foundationReleaseApproved, true);
  for (const relative of ['README.es-419.md', 'README.en-US.md', '.env.example', '.gitignore', 'src/main.ts', 'assets/bytes.bin']) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), await fs.readFile(f.source(`starters/web/${relative}`)));
  }
  const manifest = JSON.parse(await fs.readFile(path.join(f.destination(), 'package.json'), 'utf8'));
  const lock = JSON.parse(await fs.readFile(path.join(f.destination(), 'package-lock.json'), 'utf8'));
  assert.equal(manifest.name, 'new-project');
  assert.equal(lock.name, 'new-project');
  assert.equal(lock.packages[''].name, 'new-project');
  assert.deepEqual(lock.packages['node_modules/example'], JSON.parse(lockBefore).packages['node_modules/example']);
  assert.deepEqual(await fs.readFile(f.source('starters/web/package.json')), manifestBefore);
  assert.deepEqual(await fs.readFile(f.source('starters/web/package-lock.json')), lockBefore);
  const adoption = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(adoption.createdAt, '2026-09-02T12:00:00.000Z');
  assert.equal(adoption.projectName, 'new-project');
  assert.equal(adoption.documentaryFoundation.releaseVersion, '1.0.0');
  assert.equal(adoption.documentaryFoundation.scope, 'documentary');
  assert.equal(adoption.technicalTemplate.revision, TEMPLATE_REVISIONS.web);
  assert.equal(adoption.technicalTemplate.generationStatus, 'generated-for-evaluation');
  assert.equal(adoption.consumerAdoptionStatus, 'pending-consumer-confirmation');
  assert.equal(adoption.customization.packageNameChanged, true);
  assert.equal(adoption.customization.nativeIdentifiersChanged, false);
  assert.equal(result.capabilityProfileStatus, 'pending-consumer-selection');
  assert.equal(adoption.capabilityProfiles.enabledProfilesRequireConsumerImplementationAndEvidence, true);
  assert.equal(adoption.capabilityProfiles.files.length, 2);
  for (const profile of adoption.capabilityProfiles.files) {
    const name = path.basename(profile.path);
    const original = await fs.readFile(f.source(`templates/${name}`));
    assert.deepEqual(await fs.readFile(path.join(f.destination(), profile.path)), original);
    assert.equal(profile.sha256, sha256(original));
  }
  assert.deepEqual(adoption.verification, {
    copiedFileBytes: 'verified', dependenciesInstalled: false,
    productBuildExecuted: false, productPlatformSupportVerified: false,
  });
  assert.equal(adoption.technicalTemplate.sourceFileCount, 8);
  for (const file of adoption.technicalTemplate.files) {
    assert.equal(file.sourceSha256, sha256(await fs.readFile(f.source(`starters/web/${file.path}`))));
    assert.equal(file.exportedSha256, sha256(await fs.readFile(path.join(f.destination(), file.path))));
  }
  const inventory = adoption.technicalTemplate.files.map((file) => ({ path: file.path, sha256: file.sourceSha256 }));
  assert.equal(adoption.technicalTemplate.sourceInventorySha256, sha256(Buffer.from(JSON.stringify(inventory))));
  for (const spec of f.release.files) {
    const original = await fs.readFile(f.source(`releases/${spec.name}`));
    assert.deepEqual(await fs.readFile(path.join(f.destination(), 'foundation', spec.name)), original);
    assert.equal(adoption.documentaryFoundation.artifacts.find((item) => item.role === spec.role).sha256, sha256(original));
  }
  await absent(path.join(f.destination(), 'node_modules'));
  await absent(path.join(f.destination(), 'docs'));
});

test('vanilla web export preserves plain source and zero dependencies while renaming both npm roots', async (t) => {
  const f = await fixture(t);
  const sourceBefore = new Map();
  const included = ['README.es-419.md', 'README.en-US.md', '.env.example', '.gitignore',
    ...TEMPLATE_FILES['web-vanilla'], 'assets/bytes.bin'];
  for (const relative of included) sourceBefore.set(relative, await fs.readFile(f.source(`starters/web-vanilla/${relative}`)));
  const result = await f.run({ template: 'web-vanilla', name: 'plain-site' });
  assert.equal(result.template, 'web-vanilla');
  assert.equal(result.filesCopied, included.length + 7);
  const manifest = JSON.parse(await fs.readFile(path.join(f.destination(), 'package.json'), 'utf8'));
  const lock = JSON.parse(await fs.readFile(path.join(f.destination(), 'package-lock.json'), 'utf8'));
  assert.deepEqual(manifest, { ...JSON.parse(sourceBefore.get('package.json')), name: 'plain-site' });
  assert.deepEqual(manifest.dependencies, {});
  assert.deepEqual(manifest.devDependencies, {});
  assert.equal(lock.name, 'plain-site');
  assert.equal(lock.packages[''].name, 'plain-site');
  assert.deepEqual(Object.keys(lock.packages), ['']);
  for (const relative of included) {
    assert.deepEqual(await fs.readFile(f.source(`starters/web-vanilla/${relative}`)), sourceBefore.get(relative));
    if (!['package.json', 'package-lock.json'].includes(relative)) {
      assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), sourceBefore.get(relative));
    }
  }
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(record.technicalTemplate.id, 'web-vanilla');
  assert.equal(record.customization.packageNameChanged, true);
  assert.equal(record.customization.nativeIdentifiersChanged, false);
  assert.equal(record.consumerAdoptionStatus, 'pending-consumer-confirmation');
  assert.equal(record.foundationReleaseApproved, true);
  assert.equal(record.technicalTemplate.status, 'not-approved');
  assert.equal(record.verification.dependenciesInstalled, false);
  assert.equal(record.verification.productBuildExecuted, false);
  for (const file of record.technicalTemplate.files) {
    assert.equal(file.sourceSha256, sha256(sourceBefore.get(file.path)));
    assert.equal(file.exportedSha256, sha256(await fs.readFile(path.join(f.destination(), file.path))));
  }
  for (const spec of f.release.files) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), 'foundation', spec.name)), await fs.readFile(f.source(`releases/${spec.name}`)));
  }
  await absent(path.join(f.destination(), 'node_modules'));
});

test('vanilla web applies existing exclusions and preserves reviewed npm policy and environment example', async (t) => {
  const f = await fixture(t);
  const omitted = ['node_modules/example/index.js', 'nested/NODE_MODULES/example.js', 'build/app.js', 'dist/index.html',
    '.env', '.env.production', 'nested/config.env', '.git/config', '.validation/result.json', 'coverage/result.json',
    'secrets/example.txt', 'credentials.json', 'private.key', 'output/generated.js'];
  for (const relative of omitted) await f.put(`starters/web-vanilla/${relative}`, 'SYNTHETIC OMITTED CONTENT');
  const npmPolicy = Buffer.from('engine-strict=true\r\nsave-exact=true\r\n');
  await f.put('starters/web-vanilla/.npmrc', npmPolicy);
  const result = await f.run({ template: 'web-vanilla' });
  assert.ok(result.excludedEntries > 0);
  for (const relative of omitted) await absent(path.join(f.destination(), relative));
  assert.deepEqual(await fs.readFile(path.join(f.destination(), '.npmrc')), npmPolicy);
  assert.deepEqual(await fs.readFile(path.join(f.destination(), '.env.example')), await fs.readFile(f.source('starters/web-vanilla/.env.example')));
});

test('vanilla web cannot export an unreviewed npm configuration or disclose its contents', async (t) => {
  const f = await fixture(t);
  const sentinel = 'SYNTHETIC_VANILLA_NOT_A_SECRET';
  await f.put('starters/web-vanilla/.npmrc', `//registry.invalid/:_authToken=${sentinel}\n`);
  await assert.rejects(f.run({ template: 'web-vanilla' }), (error) => {
    assert.equal(error.code, 'UNSAFE_NPM_CONFIG');
    assert.equal(error.message.includes(sentinel), false);
    return true;
  });
  await absent(f.destination());
});

test('vanilla web requires both languages and every declared source entry before creating a destination', async (t) => {
  const f = await fixture(t);
  for (const runtimeFile of ['scripts/server.mjs', 'favicon.svg']) {
    assert.ok(TEMPLATE_FILES['web-vanilla'].includes(runtimeFile), `Runtime file must remain required: ${runtimeFile}`);
  }
  for (const relative of ['README.es-419.md', 'README.en-US.md', ...TEMPLATE_FILES['web-vanilla']]) {
    const location = f.source(`starters/web-vanilla/${relative}`);
    const parked = `${location}.fixture-parked`;
    await fs.rename(location, parked);
    await rejectBeforeCreating(f, 'INCOMPLETE_TEMPLATE', { template: 'web-vanilla' });
    await fs.rename(parked, location);
  }
});

test('vanilla web rejects malformed manifests and mismatched lock root records before copying', async (t) => {
  const f = await fixture(t);
  const manifestPath = f.source('starters/web-vanilla/package.json');
  const lockPath = f.source('starters/web-vanilla/package-lock.json');
  const manifest = await fs.readFile(manifestPath);
  for (const malformed of [Buffer.from([255]), Buffer.from('{'), Buffer.from('null'), Buffer.from('[]')]) {
    await fs.writeFile(manifestPath, malformed);
    await rejectBeforeCreating(f, 'INVALID_MANIFEST', { template: 'web-vanilla' });
  }
  await fs.writeFile(manifestPath, manifest);
  for (const malformed of [Buffer.from([255]), Buffer.from('{'), Buffer.from('[]')]) {
    await fs.writeFile(lockPath, malformed);
    await rejectBeforeCreating(f, 'INVALID_MANIFEST', { template: 'web-vanilla' });
  }
  for (const lock of [
    { name: 'wrong-name', lockfileVersion: 3 },
    { name: 'starter-web-vanilla', lockfileVersion: 4 },
    { name: 'starter-web-vanilla', lockfileVersion: 3, packages: { '': null } },
    { name: 'starter-web-vanilla', lockfileVersion: 3, packages: { '': { name: 'wrong-name' } } },
  ]) {
    await fs.writeFile(lockPath, JSON.stringify(lock));
    await rejectBeforeCreating(f, 'INVALID_MANIFEST', { template: 'web-vanilla' });
  }
});

test('vanilla web keeps the same supported npm lock versions without adding dependency records', async (t) => {
  const f = await fixture(t);
  for (const version of [1, 2, 3]) {
    const lock = { name: 'starter-web-vanilla', lockfileVersion: version,
      ...(version >= 2 ? { packages: { '': { name: 'starter-web-vanilla', private: true } } } : { dependencies: {} }) };
    await f.put('starters/web-vanilla/package-lock.json', JSON.stringify(lock));
    const destination = f.destination(`lock-${version}`);
    await f.run({ template: 'web-vanilla', destination });
    const expected = { ...lock, name: 'new-project',
      ...(version >= 2 ? { packages: { '': { name: 'new-project', private: true } } } : {}) };
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(destination, 'package-lock.json'), 'utf8')), expected);
  }
});

test('vanilla web retains existing-target, repository-boundary and included-link protections', async (t) => {
  const f = await fixture(t);
  const existing = f.destination('existing');
  await fs.mkdir(existing);
  await fs.writeFile(path.join(existing, 'preserve.txt'), 'synthetic existing material');
  await assert.rejects(f.run({ template: 'web-vanilla', destination: existing }), { code: 'DESTINATION_EXISTS' });
  assert.deepEqual(await fs.readdir(existing), ['preserve.txt']);
  assert.equal(await fs.readFile(path.join(existing, 'preserve.txt'), 'utf8'), 'synthetic existing material');
  await rejectBeforeCreating(f, 'DESTINATION_INSIDE_REPOSITORY', { template: 'web-vanilla', destination: path.join(f.repositoryRoot, 'consumer') });
  await fs.link(f.source('starters/web-vanilla/src/main.js'), path.join(f.projects, 'source-hard-link.js'));
  await rejectBeforeCreating(f, 'LINK_REJECTED', { template: 'web-vanilla' });
});

test('Flutter export preserves lock, pubspec and native IDs without implying native verification', async (t) => {
  const f = await fixture(t);
  await f.put('starters/flutter/.fvmrc', '{"flutter":"synthetic-version"}\n');
  await f.put('starters/flutter/.fvm/flutter_sdk/bin/cache/fixture', 'SYNTHETIC CACHE');
  const result = await f.run({ template: 'flutter', name: 'my-flutter-project' });
  assert.equal(result.filesCopied, 17);
  for (const relative of ['pubspec.yaml', 'pubspec.lock', '.fvmrc', 'android/app/build.gradle.kts', 'lib/main.dart', 'README.es-419.md', 'README.en-US.md']) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), await fs.readFile(f.source(`starters/flutter/${relative}`)));
  }
  await absent(path.join(f.destination(), '.fvm'));
  const adoption = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(adoption.projectName, 'my-flutter-project');
  assert.equal(adoption.customization.packageNameChanged, false);
  assert.equal(adoption.customization.flutterProjectAndBundleIdentifiers, 'unchanged-from-template');
  assert.equal(adoption.customization.distributionIdentifiersStatus, 'pending-consumer-review');
  assert.equal(adoption.verification.productPlatformSupportVerified, false);
  assert.equal(adoption.technicalTemplate.revision, TEMPLATE_REVISIONS.flutter);
});

test('Kotlin export preserves wrapper, dependency lock and native identifiers without claiming verification', async (t) => {
  const f = await fixture(t);
  await f.put('starters/kotlin-android/.kotlin/cache.bin', 'SYNTHETIC CACHE');
  const result = await f.run({ template: 'kotlin-android', name: 'native-example' });
  for (const relative of [...TEMPLATE_FILES['kotlin-android'], 'app/build.gradle.kts', 'app/gradle.lockfile']) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), await fs.readFile(f.source(`starters/kotlin-android/${relative}`)));
  }
  await absent(path.join(f.destination(), '.kotlin'));
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(record.customization.kotlinAndroidIdentifiers, 'unchanged-from-template');
  assert.equal(record.customization.nativeIdentifiersChanged, false);
  assert.equal(record.verification.productPlatformSupportVerified, false);
  assert.equal(record.technicalTemplate.status, 'not-approved');
  assert.equal(record.technicalTemplate.revision, TEMPLATE_REVISIONS['kotlin-android']);
});

test('PHP export preserves Composer identity, lock and migrations while excluding runtime state and databases', async (t) => {
  const f = await fixture(t);
  const omitted = ['vendor/package/code.php', '.phpunit.cache/test-results', '.phpunit.result.cache', 'auth.json',
    'database/database.sqlite', 'database/database.sqlite-wal', 'database/database.sqlite-shm', 'database/database.sqlite-journal',
    'database/private.SQLITE3', 'database/other.db', 'bootstrap/cache/config.php', 'storage/private-state.txt',
    'storage/framework/cache/data/value', 'storage/framework/sessions/session', 'storage/framework/views/compiled.php',
    'storage/app/private/file.txt', 'storage/app/public/upload.txt', 'storage/logs/laravel.log', 'artifacts/package.zip'];
  for (const relative of omitted) await f.put(`starters/backend-php/${relative}`, 'SYNTHETIC RUNTIME DATA');
  const retained = ['storage/framework/cache/data/.gitignore', 'storage/framework/sessions/.gitignore',
    'storage/framework/views/.gitignore', 'storage/app/private/.gitignore', 'storage/app/public/.gitignore',
    'storage/logs/.gitignore', 'bootstrap/cache/.gitignore'];
  for (const relative of retained) await f.put(`starters/backend-php/${relative}`, '*\n!.gitignore\n');
  const result = await f.run({ template: 'backend-php', name: 'api-example' });
  for (const relative of [...TEMPLATE_FILES['backend-php'], 'database/migrations/example.php', ...retained]) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), await fs.readFile(f.source(`starters/backend-php/${relative}`)));
  }
  for (const relative of omitted) await absent(path.join(f.destination(), relative));
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(record.customization.composerPackageNameChanged, false);
  assert.equal(record.customization.packageNameChanged, false);
  assert.equal(record.consumerAdoptionStatus, 'pending-consumer-confirmation');
  assert.equal(record.verification.dependenciesInstalled, false);
  assert.equal(record.technicalTemplate.revision, TEMPLATE_REVISIONS['backend-php']);
});

test('Node backend export preserves sources and lock while changing only npm root identity', async (t) => {
  const f = await fixture(t);
  const result = await f.run({ template: 'backend-node', name: 'node-api-example' });
  const manifest = JSON.parse(await fs.readFile(path.join(f.destination(), 'package.json'), 'utf8'));
  const lock = JSON.parse(await fs.readFile(path.join(f.destination(), 'package-lock.json'), 'utf8'));
  assert.equal(manifest.name, 'node-api-example');
  assert.equal(lock.name, 'node-api-example');
  assert.equal(lock.packages[''].name, 'node-api-example');
  assert.deepEqual(await fs.readFile(path.join(f.destination(), 'src/server.ts')), await fs.readFile(f.source('starters/backend-node/src/server.ts')));
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(record.customization.packageNameChanged, true);
  assert.equal(record.technicalTemplate.id, 'backend-node');
  assert.equal(record.technicalTemplate.revision, TEMPLATE_REVISIONS['backend-node']);
  assert.equal(record.verification.dependenciesInstalled, false);
});

test('Python backend export preserves its lock, package identity, and source', async (t) => {
  const f = await fixture(t);
  const result = await f.run({ template: 'backend-python', name: 'python-api-example' });
  for (const relative of TEMPLATE_FILES['backend-python']) {
    assert.deepEqual(
      await fs.readFile(path.join(f.destination(), relative)),
      await fs.readFile(f.source(`starters/backend-python/${relative}`)),
    );
  }
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord), 'utf8'));
  assert.equal(record.customization.packageNameChanged, false);
  assert.equal(record.technicalTemplate.id, 'backend-python');
  assert.equal(record.technicalTemplate.revision, TEMPLATE_REVISIONS['backend-python']);
});

test('runtime filters retain scaffold directories but reject unrecognized storage files', () => {
  for (const relative of ['storage', 'storage/framework', 'storage/framework/cache', 'storage/framework/cache/data', 'bootstrap/cache', 'storage/app/private/.gitignore']) {
    assert.equal(shouldExclude(relative, 'backend-php'), false, relative);
  }
  for (const relative of ['storage/custom-state', 'storage/app/private/file', 'storage/framework/cache/data/item', 'bootstrap/cache/generated.php', 'state.sqlite-journal', 'state.db-wal']) {
    assert.equal(shouldExclude(relative, 'backend-php'), true, relative);
  }
  assert.equal(shouldExclude('storage/domain-adapter.ts', 'web'), false);
});

test('native PHP export preserves source and rejects runtime material and incomplete entry points', async (t) => {
  const f = await fixture(t);
  for (const relative of ['.runtime/state.json', '.runtime/local.sqlite', 'backups/manifest.json', '.env', 'private.key']) {
    await f.put(`starters/backend-php-native/${relative}`, 'synthetic-private-data');
  }
  const result = await f.run({ template: 'backend-php-native' });
  for (const relative of TEMPLATE_FILES['backend-php-native']) {
    assert.deepEqual(await fs.readFile(path.join(f.destination(), relative)), await fs.readFile(f.source(`starters/backend-php-native/${relative}`)));
  }
  for (const relative of ['.runtime', 'backups', '.env', 'private.key', 'composer.json', 'vendor']) {
    await assert.rejects(fs.lstat(path.join(f.destination(), relative)), { code: 'ENOENT' });
  }
  const record = JSON.parse(await fs.readFile(path.join(f.destination(), result.adoptionRecord)));
  assert.equal(record.technicalTemplate.id, 'backend-php-native');
  assert.equal(record.customization.packageNameChanged, false);
  await fs.unlink(f.source('starters/backend-php-native/bootstrap.php'));
  const missing = f.destination('missing-native');
  await assert.rejects(f.run({ template: 'backend-php-native', destination: missing }), { code: 'INCOMPLETE_TEMPLATE' });
  await assert.rejects(fs.lstat(missing), { code: 'ENOENT' });
});

test('runtime scaffold names cannot disguise state files or directory-shaped gitignore entries', async (t) => {
  for (const relative of ['storage', 'storage/logs', 'storage/framework/cache/data', 'bootstrap/cache']) {
    const f = await fixture(t);
    await f.put(`starters/backend-php/${relative}`, 'SYNTHETIC STATE IN WRONG FILE TYPE');
    await rejectBeforeCreating(f, 'INVALID_SCAFFOLD', { template: 'backend-php' });
  }
  const f = await fixture(t);
  await f.put('starters/backend-php/storage/logs/.gitignore/private.txt', 'SYNTHETIC STATE');
  await rejectBeforeCreating(f, 'INVALID_SCAFFOLD', { template: 'backend-php' });
});

test('generated dependencies, outputs, environment files and named secrets are excluded', async (t) => {
  const f = await fixture(t);
  const omitted = [
    'node_modules/dependency.js', 'build/output.js', 'dist/bundle.js', '.dart_tool/cache.json',
    '.git/config', '.gradle/cache.bin', 'android/local.properties', 'android/key.properties',
    'android/app/outputs/app.apk', '.env', '.env.local', '.env.production', 'config.env',
    'nested/.env.test', 'secrets/token.txt', 'credentials.json', 'secret.yaml', 'cert.pem',
    'signing.p12', '.netrc', 'id_rsa', '.yarnrc.yml', '.idea/workspace.xml', 'module.iml',
    'nested/node_modules/dependency.js', '.flutter-plugins-dependencies',
    'ios/Pods/code.m', 'macos/Flutter/ephemeral/generated.txt', 'coverage/results.json',
    '.validation/result.log', 'releases/internal.txt',
  ];
  for (const relative of omitted) await f.put(`starters/web/${relative}`, 'SYNTHETIC OMITTED DATA');
  const result = await f.run();
  assert.equal(result.filesCopied, 15);
  assert.ok(result.excludedEntries > 0);
  for (const relative of omitted) await absent(path.join(f.destination(), relative));
  assert.equal(await fs.readFile(path.join(f.destination(), '.env.example'), 'utf8'), 'PUBLIC_EXAMPLE=placeholder\n');
  assert.equal(shouldExclude('src/.env.example'), false);
  assert.equal(shouldExclude('package-lock.json'), false);
  assert.equal(shouldExclude('pubspec.lock'), false);
  assert.equal(shouldExclude('NODE_MODULES/package.json'), true);
});

test('reviewed npm policy is preserved byte-for-byte', async (t) => {
  const f = await fixture(t);
  const bytes = Buffer.from('save-exact=true\r\nengine-strict=true\r\n');
  await f.put('starters/web/.npmrc', bytes);
  await f.run();
  assert.deepEqual(await fs.readFile(path.join(f.destination(), '.npmrc')), bytes);
});

test('unreviewed npm registry or token configuration is rejected without leaking contents', async (t) => {
  const f = await fixture(t);
  const sentinel = 'SYNTHETIC_NOT_A_REAL_TOKEN';
  await f.put('starters/web/.npmrc', `engine-strict=true\n//registry.invalid/:_authToken=${sentinel}\n`);
  await assert.rejects(f.run(), (error) => {
    assert.equal(error.code, 'UNSAFE_NPM_CONFIG');
    assert.equal(error.message.includes(sentinel), false);
    return true;
  });
  await absent(f.destination());
});

test('existing directory remains untouched', async (t) => {
  const f = await fixture(t);
  await fs.mkdir(f.destination());
  await fs.writeFile(path.join(f.destination(), 'keep.txt'), 'user material');
  await assert.rejects(f.run(), { code: 'DESTINATION_EXISTS' });
  assert.deepEqual(await fs.readdir(f.destination()), ['keep.txt']);
  assert.equal(await fs.readFile(path.join(f.destination(), 'keep.txt'), 'utf8'), 'user material');
});

test('existing file remains untouched', async (t) => {
  const f = await fixture(t);
  await fs.writeFile(f.destination(), 'user material');
  await assert.rejects(f.run(), { code: 'DESTINATION_EXISTS' });
  assert.equal(await fs.readFile(f.destination(), 'utf8'), 'user material');
});

test('destination inside the repository is rejected', async (t) => {
  const f = await fixture(t);
  await rejectBeforeCreating(f, 'DESTINATION_INSIDE_REPOSITORY', { destination: path.join(f.repositoryRoot, 'consumer') });
});

test('a sibling sharing the repository name prefix remains external', async (t) => {
  const f = await fixture(t);
  const destination = `${f.repositoryRoot}-consumer`;
  const result = await f.run({ destination });
  assert.equal(result.destination, destination);
});

test('missing parents are rejected without creating any path', async (t) => {
  const f = await fixture(t);
  const missingParent = path.join(f.projects, 'missing');
  await rejectBeforeCreating(f, 'PARENT_MISSING', { destination: path.join(missingParent, 'consumer') });
  await absent(missingParent);
});

test('destination directory aliases and junctions are rejected', async (t) => {
  const f = await fixture(t);
  const alias = path.join(f.root, 'project-alias');
  await fs.symlink(f.projects, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await rejectBeforeCreating(f, 'LINK_REJECTED', { destination: path.join(alias, 'consumer') });
  await absent(path.join(f.projects, 'consumer'));
});

test('an alias into the repository cannot bypass the external destination rule', async (t) => {
  const f = await fixture(t);
  const alias = path.join(f.root, 'repository-alias');
  await fs.symlink(f.repositoryRoot, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await rejectBeforeCreating(f, 'LINK_REJECTED', { destination: path.join(alias, 'consumer') });
  await absent(path.join(f.repositoryRoot, 'consumer'));
});

test('existing destination junction remains untouched', async (t) => {
  const f = await fixture(t);
  await fs.symlink(f.repositoryRoot, f.destination(), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(f.run(), { code: 'DESTINATION_EXISTS' });
  assert.equal((await fs.lstat(f.destination())).isSymbolicLink(), true);
});

test('included source directory links are rejected before creating a destination', async (t) => {
  const f = await fixture(t);
  await fs.symlink(f.projects, f.source('starters/web/linked-source'), process.platform === 'win32' ? 'junction' : 'dir');
  await rejectBeforeCreating(f, 'LINK_REJECTED');
});

test('excluded dependency links are never traversed', async (t) => {
  const f = await fixture(t);
  await fs.writeFile(path.join(f.projects, 'must-not-copy.txt'), 'synthetic');
  await fs.symlink(f.projects, f.source('starters/web/node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await f.run();
  await absent(path.join(f.destination(), 'node_modules'));
  await absent(path.join(f.destination(), 'must-not-copy.txt'));
});

test('included hard-linked files are rejected', async (t) => {
  const f = await fixture(t);
  await fs.link(f.source('starters/web/src/main.ts'), path.join(f.projects, 'hard-link.ts'));
  await rejectBeforeCreating(f, 'LINK_REJECTED');
});

test('all four approved artifact roles are verified before destination creation', async (t) => {
  const f = await fixture(t);
  for (const spec of f.release.files) {
    const location = f.source(`releases/${spec.name}`);
    const original = await fs.readFile(location);
    await fs.writeFile(location, Buffer.concat([original, Buffer.from('changed')]));
    await rejectBeforeCreating(f, 'FOUNDATION_HASH_MISMATCH');
    await fs.writeFile(location, original);
  }
});

test('both capability profiles are required and copied before project adoption', async (t) => {
  const f = await fixture(t);
  for (const name of CAPABILITY_PROFILE_FILES) {
    const location = f.source(`templates/${name}`);
    const parked = `${location}.fixture-parked`;
    await fs.rename(location, parked);
    await rejectBeforeCreating(f, 'INCOMPLETE_CAPABILITY_PROFILE');
    await fs.rename(parked, location);
  }
});

test('a starter cannot collide with the reserved foundation output', async (t) => {
  const f = await fixture(t);
  await f.put('starters/web/Foundation/adoption.json', '{}');
  await rejectBeforeCreating(f, 'RESERVED_OUTPUT');
});

test('required language counterparts and lockfiles must exist', async (t) => {
  const f = await fixture(t);
  for (const relative of ['starters/web/README.en-US.md', 'starters/web/package-lock.json', 'starters/flutter/pubspec.lock', 'starters/flutter/android/app/gradle.lockfile', ...TEMPLATE_FILES['kotlin-android'].map((name) => `starters/kotlin-android/${name}`), 'starters/backend-php/composer.lock']) {
    const location = f.source(relative);
    const parked = `${location}.fixture-parked`;
    await fs.rename(location, parked);
    await rejectBeforeCreating(f, 'INCOMPLETE_TEMPLATE', { template: relative.split('/')[1] });
    await fs.rename(parked, location);
  }
});

test('malformed UTF-8/JSON and mismatched npm root records fail preflight', async (t) => {
  const f = await fixture(t);
  const manifestPath = f.source('starters/web/package.json');
  const manifest = await fs.readFile(manifestPath);
  for (const malformed of [Buffer.from([255]), Buffer.from('{'), Buffer.from('[]')]) {
    await fs.writeFile(manifestPath, malformed);
    await rejectBeforeCreating(f, 'INVALID_MANIFEST');
  }
  await fs.writeFile(manifestPath, manifest);
  const lockPath = f.source('starters/web/package-lock.json');
  for (const lock of [
    { name: 'wrong-name', lockfileVersion: 3 },
    { name: 'starter-web', lockfileVersion: 4 },
    { name: 'starter-web', lockfileVersion: 3, packages: { '': null } },
    { name: 'starter-web', lockfileVersion: 3, packages: { '': { name: 'wrong-name' } } },
  ]) {
    await fs.writeFile(lockPath, JSON.stringify(lock));
    await rejectBeforeCreating(f, 'INVALID_MANIFEST');
  }
});

test('two simultaneous creators cannot overwrite each other', async (t) => {
  const f = await fixture(t);
  const outcomes = await Promise.allSettled([f.run({ name: 'first-project' }), f.run({ name: 'second-project' })]);
  const accepted = outcomes.filter((item) => item.status === 'fulfilled');
  const rejected = outcomes.filter((item) => item.status === 'rejected');
  assert.equal(accepted.length, 1);
  assert.equal(rejected.length, 1);
  assert.ok(['EEXIST', 'DESTINATION_EXISTS'].includes(rejected[0].reason.code));
  const manifest = JSON.parse(await fs.readFile(path.join(f.destination(), 'package.json'), 'utf8'));
  assert.equal(manifest.name, accepted[0].value.name);
  const adoption = JSON.parse(await fs.readFile(path.join(f.destination(), 'foundation/adoption.json'), 'utf8'));
  assert.equal(adoption.projectName, manifest.name);
});

test('unknown templates, invalid dates and explicit traversal fail before writes', async (t) => {
  const f = await fixture(t);
  await rejectBeforeCreating(f, 'INVALID_TEMPLATE', { template: '../web' });
  await rejectBeforeCreating(f, 'INVALID_CLOCK', { now: () => new Date('invalid') });
  await rejectBeforeCreating(f, 'UNSAFE_PATH', { destination: `${f.projects}${path.sep}..${path.sep}consumer` });
});

test('project names are bounded lowercase ASCII slugs', () => {
  for (const name of ['a', 'sample-project', 'a1-b2', 'a'.repeat(63)]) assert.equal(validateProjectName(name), name);
  for (const name of ['', 'A', '1abc', 'a_b', '-abc', 'abc-', 'a--b', 'á', 'a b', 'a\n', 'a\r', 'a'.repeat(64), null]) {
    assert.throws(() => validateProjectName(name), { code: 'INVALID_NAME' });
  }
});

test('portable relative paths reject traversal, devices, streams and collisions', () => {
  assert.equal(validateRelativePath('src/valid-file.ts'), 'src/valid-file.ts');
  for (const relative of ['', '/absolute', '../outside', 'a/../b', 'a/./b', 'a//b', 'a\\b', 'C:/file', 'file:stream', 'NUL.txt', 'com1', 'a.', 'a ']) {
    assert.throws(() => validateRelativePath(relative), { code: 'UNSAFE_PATH' });
  }
  for (const paths of [['A.ts', 'a.ts'], ['café.ts', 'cafe\u0301.ts'], ['source', 'source']]) {
    assert.throws(() => assertNoPortableCollisions(paths), { code: 'SOURCE_COLLISION' });
  }
  assert.doesNotThrow(() => assertNoPortableCollisions(['a.ts', 'b.ts', 'nested/a.ts']));
});

test('Windows destination lexical rules reject unsafe path namespaces on every host', () => {
  assert.equal(validateDestinationPath('D:/Projects/my-project', 'win32'), 'D:\\Projects\\my-project');
  for (const unsafe of ['relative', 'C:relative', '\\root-relative', '\\\\server\\share\\project', '\\\\?\\C:\\project', 'C:\\', 'C:\\a\\..\\b', 'C:\\a\\.\\b', 'C:\\a:stream', 'C:\\NUL\\project', 'C:\\bad.\\project', 'C:\\bad \\project']) {
    assert.throws(() => validateDestinationPath(unsafe, 'win32'));
  }
  assert.equal(isWithin('C:\\Repository', 'c:\\repository\\child', 'win32'), true);
  assert.equal(isWithin('C:\\Repository', 'C:\\Repository-other', 'win32'), false);
  assert.equal(isWithin('C:\\Repository', 'D:\\Repository', 'win32'), false);
});

test('POSIX destination lexical rules remain distinct from Windows syntax', () => {
  assert.equal(validateDestinationPath('/tmp/project', 'posix'), '/tmp/project');
  for (const unsafe of ['relative', '/', '//host/project', '/tmp/../project', '/tmp/./project', '/tmp\\project', '/tmp/name:stream']) {
    assert.throws(() => validateDestinationPath(unsafe, 'posix'));
  }
  assert.equal(isWithin('/repo', '/repo/child', 'posix'), true);
  assert.equal(isWithin('/repo', '/repo-other', 'posix'), false);
});

test('CLI accepts only the documented arguments and offers a non-mutating help command', () => {
  const destination = path.join(os.tmpdir(), 'example-new-project');
  const valid = ['--template', 'web', '--name', 'example', '--destination', destination];
  assert.deepEqual(parseArguments(valid), { template: 'web', name: 'example', destination });
  assert.deepEqual(parseArguments(['--template', 'web-vanilla', '--name', 'example', '--destination', destination]), { template: 'web-vanilla', name: 'example', destination });
  assert.deepEqual(parseArguments(['--help']), { help: true });
  for (const args of [[], ['--template', 'web'], [...valid, '--name', 'again'], [...valid, '--adopt'], [...valid, '--release', 'override'], ['--help', '--name', 'example']]) {
    assert.throws(() => parseArguments(args), { code: 'INVALID_ARGUMENTS' });
  }
  const executable = fileURLToPath(new URL('./create-project.mjs', import.meta.url));
  const help = spawnSync(process.execPath, [executable, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.equal(help.stderr, '');
  assert.equal(JSON.parse(help.stdout).adoptionRequiresConsumerConfirmation, true);
  assert.equal(JSON.parse(help.stdout).capabilityProfileIncluded, true);
  assert.equal(JSON.parse(help.stdout).usage.includes('web|web-vanilla|flutter|kotlin-android|backend-php|backend-node|backend-python'), true);
  const invalid = spawnSync(process.execPath, [executable, '--force'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.equal(JSON.parse(invalid.stderr).error, 'INVALID_ARGUMENTS');
});
