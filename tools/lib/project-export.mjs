// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const DEFAULT_REPOSITORY_ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const TEMPLATE_REVISIONS = Object.freeze({
  web: '1.1.0-draft.3',
  'web-vanilla': '1.1.0-draft.3',
  flutter: '1.1.0-draft.2',
  'kotlin-android': '1.1.0-draft.2',
  'backend-php': '1.1.0-draft.2',
  'backend-node': '1.2.0-rc.1',
  'backend-python': '1.2.0-draft.1',
  'backend-php-native': '1.3.0-draft.1',
});
export const TEMPLATE_REVISION = TEMPLATE_REVISIONS.web;
export const SOLUTION_PRESETS = Object.freeze({
  'simple-website': Object.freeze({ client: 'web-vanilla', backend: false }),
  'web-app': Object.freeze({ client: 'web', backend: true }),
  'mobile-app': Object.freeze({ client: 'flutter', backend: true }),
  'desktop-app': Object.freeze({ client: 'flutter', backend: true }),
  'android-app': Object.freeze({ client: 'kotlin-android', backend: true }),
  'api-only': Object.freeze({ client: null, backend: true }),
});
export const CAPABILITY_PROFILE_FILES = Object.freeze([
  'capability-profile.en-US.md',
  'capability-profile.es-419.md',
]);
export const TEMPLATE_FILES = Object.freeze({
  web: Object.freeze(['package.json', 'package-lock.json']),
  'web-vanilla': Object.freeze(['package.json', 'package-lock.json', 'index.html', 'styles.css', 'favicon.svg', 'src/main.js', 'scripts/serve.mjs', 'scripts/server.mjs', 'scripts/check.mjs']),
  flutter: Object.freeze(['pubspec.yaml', 'pubspec.lock', 'android/app/build.gradle.kts', 'android/app/gradle.lockfile']),
  'kotlin-android': Object.freeze(['settings.gradle.kts', 'build.gradle.kts', 'app/build.gradle.kts', 'core/build.gradle.kts', 'app/gradle.lockfile', 'core/gradle.lockfile', 'gradle/verification-metadata.xml', 'gradle/wrapper/gradle-wrapper.properties', 'gradle/wrapper/gradle-wrapper.jar', 'gradlew', 'gradlew.bat']),
  'backend-php': Object.freeze(['composer.json', 'composer.lock', 'artisan', 'bootstrap/app.php']),
  'backend-node': Object.freeze(['package.json', 'package-lock.json', 'tsconfig.json', 'src/server.ts']),
  'backend-python': Object.freeze(['.python-version', 'pyproject.toml', 'uv.lock', 'src/project_base_api/main.py']),
  'backend-php-native': Object.freeze(['LICENSE', 'bootstrap.php', 'scripts/local.mjs', 'scripts/path-policy.php', 'scripts/database.php', 'scripts/token.php', 'scripts/recovery.php', 'public/router.php', 'contracts/task-api-v1.openapi.json']),
});
export const APPROVED_DOCUMENTARY_RELEASE = Object.freeze({
  version: '1.0.0',
  editorialRevision: '0.1.0-draft.4',
  files: Object.freeze([
    Object.freeze({ role: 'archive', name: 'foundation-0.1.0-draft.4.zip', sha256: '9ecfbba67604bf27dcfd4812a592f7b5066aba7b1ac58bcb58dbe6c20685fd1a' }),
    Object.freeze({ role: 'approval-es-419', name: 'approval-1.0.0.es-419.md', sha256: '4d268b48ad6c1cf0d6c4b0667ae92ee46e2a4fdca8e1fd669e43dfa18a8ac350' }),
    Object.freeze({ role: 'approval-en-US', name: 'approval-1.0.0.en-US.md', sha256: 'dd4400c4779141a65bdd51c296712655865fe85fb2ce56a1024e762de05ea6cb' }),
    Object.freeze({ role: 'verification', name: 'foundation-0.1.0-draft.4.verification.json', sha256: 'c0ea514c22b4eca33aca4cae308e2e78704733f56df66edd73c9f8337ad5449b' }),
  ]),
});

const MAX_FILE_BYTES = 32 * 1024 * 1024;
const MAX_SOURCE_BYTES = 128 * 1024 * 1024;
const MAX_SOURCE_FILES = 10000;
const EXCLUDED_COMPONENTS = new Set([
  'node_modules', 'vendor', 'build', 'dist', '.dart_tool', '.fvm', '.git', '.gradle', '.kotlin', '.cxx', '.phpunit.cache', 'outputs', 'output', 'artifacts',
  'coverage', '.cache', '.next', '.turbo', '.idea', '.validation', 'releases',
  '.venv', '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.runtime', 'backups',
  'secrets', '.secrets', 'credentials', '.credentials', 'pods', '.symlinks',
  'ephemeral', 'deriveddata', 'xcuserdata',
]);
const EXCLUDED_FILES = new Set([
  '.env', '.envrc', '.netrc', '.pypirc', '.git-credentials', '.yarnrc.yml', 'auth.json', '.phpunit.result.cache',
  '.ds_store', 'thumbs.db', 'local.properties', 'key.properties',
  '.flutter-plugins', '.flutter-plugins-dependencies', '.packages',
  'generated.xcconfig', 'flutter_export_environment.sh',
  'google-services.json', 'googleservice-info.plist', 'keystore.properties',
  'id_rsa', 'id_ed25519', 'id_ecdsa', 'id_dsa',
]);
const STORAGE_SCAFFOLD = new Set(['storage', 'storage/framework', 'storage/framework/cache', 'storage/framework/cache/data', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'storage/app', 'storage/app/private', 'storage/app/public']);

export class ExportError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ExportError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new ExportError(code, message);
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function validateSegment(segment) {
  if (!segment || segment === '.' || segment === '..' || /[\x00-\x1f\x7f<>:"|?*\\/]/u.test(segment)
    || /[. ]$/u.test(segment)
    || /^(?:con|prn|aux|nul|conin\$|conout\$|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/iu.test(segment)) {
    fail('UNSAFE_PATH', 'Paths must not contain traversal, device names, streams, or ambiguous segments.');
  }
}

export function validateRelativePath(value) {
  if (typeof value !== 'string' || value.startsWith('/') || value.includes('\\')) {
    fail('UNSAFE_PATH', 'Source paths must be portable relative paths using forward slashes.');
  }
  for (const segment of value.split('/')) validateSegment(segment);
  return value;
}

// Windows lexical checks are also independently testable on non-Windows hosts.
export function validateDestinationPath(value, flavor = process.platform === 'win32' ? 'win32' : 'posix') {
  const api = flavor === 'win32' ? path.win32 : path.posix;
  if (typeof value !== 'string' || !api.isAbsolute(value)) {
    fail('ABSOLUTE_DESTINATION_REQUIRED', 'Destination must be an absolute local path.');
  }
  if (flavor === 'win32' && !/^[a-z]:[\\/]/iu.test(value)) {
    fail('UNSAFE_PATH', 'Use a local drive-rooted path; UNC, device, and drive-relative paths are not supported.');
  }
  if (flavor !== 'win32' && (value.startsWith('//') || value.includes('\\'))) {
    fail('UNSAFE_PATH', 'Ambiguous or foreign-platform destination path.');
  }
  const root = api.parse(value).root;
  const segments = value.slice(root.length).split(flavor === 'win32' ? /[\\/]/u : /\//u).filter(Boolean);
  if (segments.length === 0) fail('UNSAFE_PATH', 'A filesystem root cannot be a project destination.');
  for (const segment of segments) validateSegment(segment);
  return api.normalize(value);
}

export function validateProjectName(name) {
  if (typeof name !== 'string' || name.length > 63 || /[^a-z0-9-]/u.test(name) || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(name)) {
    fail('INVALID_NAME', 'Name must be a lowercase ASCII slug of 1-63 characters, starting with a letter.');
  }
  return name;
}

export function isWithin(root, candidate, flavor = process.platform === 'win32' ? 'win32' : 'posix') {
  const api = flavor === 'win32' ? path.win32 : path.posix;
  const relative = api.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${api.sep}`) && !api.isAbsolute(relative));
}

function samePath(left, right) {
  const a = path.normalize(left);
  const b = path.normalize(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

async function lstatIfPresent(target) {
  try {
    return await fs.lstat(target);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function requirePlainDirectoryChain(directory) {
  const absolute = path.resolve(directory);
  const root = path.parse(absolute).root;
  let current = root;
  const paths = [root];
  for (const component of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    paths.push(current);
  }
  for (const item of paths) {
    const stat = await lstatIfPresent(item);
    if (!stat) fail('PARENT_MISSING', 'The destination parent and source directories must already exist.');
    if (stat.isSymbolicLink()) fail('LINK_REJECTED', 'Symbolic links and junctions are not accepted in a source or destination path.');
    if (!stat.isDirectory()) fail('NOT_A_DIRECTORY', 'Every parent path component must be a directory.');
    const resolved = await fs.realpath(item);
    if (!samePath(resolved, item)) fail('PATH_ALIAS_REJECTED', 'A path resolves through an alias or reparse point. Use its plain canonical location.');
  }
  return fs.realpath(absolute);
}

async function readPlainFile(filePath) {
  await requirePlainDirectoryChain(path.dirname(filePath));
  const before = await fs.lstat(filePath);
  if (before.isSymbolicLink()) fail('LINK_REJECTED', 'Included symbolic links and junctions are rejected.');
  if (!before.isFile()) fail('SPECIAL_FILE_REJECTED', 'Only regular source files are supported.');
  if (before.nlink > 1) fail('LINK_REJECTED', 'Included hard-linked files are rejected.');
  if (!samePath(await fs.realpath(filePath), filePath)) fail('PATH_ALIAS_REJECTED', 'Source file resolves through an alias.');
  if (before.size > MAX_FILE_BYTES) fail('SOURCE_LIMIT', 'A source file exceeds the 32 MiB limit.');
  const flags = constants.O_RDONLY | (process.platform === 'win32' ? 0 : (constants.O_NOFOLLOW ?? 0));
  const handle = await fs.open(filePath, flags);
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.nlink > 1 || opened.dev !== before.dev || opened.ino !== before.ino) {
      fail('SOURCE_CHANGED', 'Source identity changed while opening a file.');
    }
    if (opened.size > MAX_FILE_BYTES) fail('SOURCE_LIMIT', 'An opened source file exceeds the 32 MiB limit.');
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (bytes.length !== before.size || after.size !== before.size || after.mtimeMs !== before.mtimeMs) {
      fail('SOURCE_CHANGED', 'Source content changed during the read. Stop concurrent edits before exporting.');
    }
    const current = await fs.lstat(filePath);
    if (current.isSymbolicLink() || current.dev !== opened.dev || current.ino !== opened.ino) {
      fail('SOURCE_CHANGED', 'Source path changed during the read.');
    }
    return { bytes, mode: 0o644 | (opened.mode & 0o111) };
  } finally {
    await handle.close();
  }
}

export function shouldExclude(relativePath, template) {
  const parts = relativePath.split('/').map((part) => part.toLowerCase());
  if (parts.some((part) => EXCLUDED_COMPONENTS.has(part))) return true;
  const name = parts.at(-1);
  // Keep Laravel's empty directory scaffolding, never compiled config, logs or sessions.
  if (template === 'backend-php') {
    if (parts[0] === 'bootstrap' && parts[1] === 'cache' && parts.length > 2) return name !== '.gitignore';
    if (parts[0] === 'storage') return !STORAGE_SCAFFOLD.has(parts.join('/')) && name !== '.gitignore';
  }
  if (EXCLUDED_FILES.has(name)) return true;
  if (name.startsWith('.env.') && name !== '.env.example') return true;
  if (name.endsWith('.env') || /^(?:secrets?|credentials?)\./u.test(name)) return true;
  return /\.(?:jks|keystore|p12|pfx|pem|key|log|tmp|bak|iml|xcuserstate|sqlite|sqlite3|db)(?:-(?:wal|shm|journal))?$/u.test(name);
}

function validateNpmConfig(bytes) {
  let lines;
  try {
    lines = new TextDecoder('utf-8', { fatal: true }).decode(bytes).split(/\r?\n/u).filter((line) => line !== '');
  } catch {
    fail('UNSAFE_NPM_CONFIG', 'Only reviewed non-secret npm policy lines may be exported.');
  }
  const allowed = new Set(['engine-strict=true', 'save-exact=true']);
  if (lines.length === 0 || new Set(lines).size !== lines.length || lines.some((line) => !allowed.has(line))) {
    fail('UNSAFE_NPM_CONFIG', 'Only reviewed non-secret npm policy lines may be exported.');
  }
}

export function assertNoPortableCollisions(relativePaths) {
  const seen = new Set();
  for (const relative of relativePaths) {
    validateRelativePath(relative);
    const key = relative.normalize('NFC').toLowerCase();
    if (seen.has(key)) fail('SOURCE_COLLISION', 'Source paths collide under portable case/Unicode normalization.');
    seen.add(key);
  }
}

async function collectTemplate(templateRoot, template) {
  await requirePlainDirectoryChain(templateRoot);
  const files = [];
  const directories = [];
  const seenPaths = [];
  const excluded = [];
  let byteCount = 0;
  async function visit(relativeDirectory = '') {
    const absolute = path.join(templateRoot, relativeDirectory);
    await requirePlainDirectoryChain(absolute);
    const entries = await fs.readdir(absolute, { withFileTypes: true });
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      validateRelativePath(relativePath);
      if (shouldExclude(relativePath, template)) {
        excluded.push(relativePath);
        continue;
      }
      if (relativePath.split('/')[0].normalize('NFC').toLowerCase() === 'foundation') {
        fail('RESERVED_OUTPUT', 'The starter must not contain the reserved foundation path.');
      }
      seenPaths.push(relativePath);
      const fullPath = path.join(templateRoot, ...relativePath.split('/'));
      const stat = await fs.lstat(fullPath);
      if (stat.isSymbolicLink()) fail('LINK_REJECTED', 'Included symbolic links and junctions are rejected.');
      const normalizedPath = relativePath.toLowerCase();
      if (template === 'backend-php'
        && (STORAGE_SCAFFOLD.has(normalizedPath) || normalizedPath === 'bootstrap/cache') && !stat.isDirectory()) {
        fail('INVALID_SCAFFOLD', 'Laravel runtime scaffold paths must be directories, never state files.');
      }
      if (entry.name.toLowerCase() === '.gitignore' && !stat.isFile()) {
        fail('INVALID_SCAFFOLD', 'Included .gitignore entries must be regular files.');
      }
      if (stat.isDirectory()) {
        directories.push(relativePath);
        await visit(relativePath);
      } else {
        const item = await readPlainFile(fullPath);
        if (entry.name.toLowerCase() === '.npmrc') validateNpmConfig(item.bytes);
        byteCount += item.bytes.length;
        files.push({ ...item, relativePath, sourceSha256: sha256(item.bytes) });
        if (files.length > MAX_SOURCE_FILES || byteCount > MAX_SOURCE_BYTES) {
          fail('SOURCE_LIMIT', 'Template exceeds 10000 source files or 128 MiB.');
        }
      }
    }
  }
  await visit();
  assertNoPortableCollisions(seenPaths);
  return { files, directories, excluded };
}

function parseObject(bytes, label) {
  let result;
  try {
    result = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    fail('INVALID_MANIFEST', `${label} must be a valid UTF-8 JSON object.`);
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) fail('INVALID_MANIFEST', `${label} must be a JSON object.`);
  return result;
}

function prepareTemplate(plan, template, projectName) {
  const byName = new Map(plan.files.map((file) => [file.relativePath, file]));
  const required = ['README.es-419.md', 'README.en-US.md', ...TEMPLATE_FILES[template]];
  for (const name of required) {
    if (!byName.has(name)) fail('INCOMPLETE_TEMPLATE', `Template is missing required source file: ${name}`);
  }
  if (template === 'web' || template === 'web-vanilla' || template === 'backend-node') {
    const packageFile = byName.get('package.json');
    const lockFile = byName.get('package-lock.json');
    const manifest = parseObject(packageFile.bytes, 'package.json');
    const lock = parseObject(lockFile.bytes, 'package-lock.json');
    if (typeof manifest.name !== 'string' || lock.name !== manifest.name || ![1, 2, 3].includes(lock.lockfileVersion)) {
      fail('INVALID_MANIFEST', 'The npm manifest and supported lockfile must identify the same starter.');
    }
    if (lock.lockfileVersion >= 2) {
      if (!lock.packages || !Object.hasOwn(lock.packages, '') || !lock.packages[''] || lock.packages[''].name !== manifest.name) {
        fail('INVALID_MANIFEST', 'The npm lockfile root package must match package.json.');
      }
      lock.packages[''].name = projectName;
    }
    manifest.name = projectName;
    lock.name = projectName;
    packageFile.bytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
    lockFile.bytes = Buffer.from(`${JSON.stringify(lock, null, 2)}\n`);
  }
  return plan;
}

async function collectRelease(repositoryRoot, release) {
  const requiredRoles = ['archive', 'approval-en-US', 'approval-es-419', 'verification'].sort();
  if (!release || release.version !== '1.0.0' || release.editorialRevision !== '0.1.0-draft.4'
    || !Array.isArray(release.files) || release.files.length !== 4
    || release.files.map((item) => item.role).sort().join('|') !== requiredRoles.join('|')) {
    fail('INVALID_RELEASE', 'Expected the approved documentary release and its four pinned artifacts.');
  }
  assertNoPortableCollisions(release.files.map((item) => item.name));
  const files = [];
  for (const spec of release.files) {
    validateSegment(spec.name);
    if (!/^[a-f0-9]{64}$/u.test(spec.sha256)) fail('INVALID_RELEASE', 'Invalid pinned SHA-256.');
    const item = await readPlainFile(path.join(repositoryRoot, 'releases', spec.name));
    if (sha256(item.bytes) !== spec.sha256) fail('FOUNDATION_HASH_MISMATCH', `Approved artifact does not match its pinned SHA-256: ${spec.name}`);
    files.push({ ...item, mode: 0o644, role: spec.role, relativePath: `foundation/${spec.name}`, sha256: spec.sha256 });
  }
  return files;
}

async function collectCapabilityProfiles(repositoryRoot) {
  const files = [];
  for (const name of CAPABILITY_PROFILE_FILES) {
    validateSegment(name);
    let item;
    try {
      item = await readPlainFile(path.join(repositoryRoot, 'templates', name));
    } catch (error) {
      if (error.code === 'ENOENT') fail('INCOMPLETE_CAPABILITY_PROFILE', `Capability profile is missing: ${name}`);
      throw error;
    }
    files.push({
      ...item,
      mode: 0o644,
      relativePath: `foundation/${name}`,
      sha256: sha256(item.bytes),
    });
  }
  return files;
}

function makeAdoptionRecord({ template, name, sourceFiles, releaseFiles, profileFiles, release, createdAt }) {
  const sourceInventory = sourceFiles.map((file) => ({ path: file.relativePath, sha256: file.sourceSha256 }));
  return {
    formatVersion: 1,
    kind: 'foundation-project-preparation',
    createdAt,
    projectName: name,
    foundationReleaseApproved: true,
    consumerAdoptionStatus: 'pending-consumer-confirmation',
    documentaryFoundation: {
      releaseVersion: release.version,
      editorialRevision: release.editorialRevision,
      scope: 'documentary',
      artifacts: releaseFiles.map((file) => ({ role: file.role, path: file.relativePath, sha256: file.sha256 })),
      integrityCheck: 'matched-pinned-sha256-before-copy-and-after-copy',
      approvalAuthentication: 'trusted-local-receipts-and-tool-pins; not-a-digital-signature',
    },
    capabilityProfiles: {
      selectionStatus: 'pending-consumer-selection',
      files: profileFiles.map((file) => ({ path: file.relativePath, sha256: file.sha256 })),
      enabledProfilesRequireConsumerImplementationAndEvidence: true,
    },
    technicalTemplate: {
      id: template,
      revision: TEMPLATE_REVISIONS[template],
      stage: 'draft',
      status: 'not-approved',
      generationStatus: 'generated-for-evaluation',
      sourceInventorySha256: sha256(Buffer.from(JSON.stringify(sourceInventory))),
      sourceFileCount: sourceFiles.length,
      files: sourceFiles.map((file) => ({ path: file.relativePath, sourceSha256: file.sourceSha256, exportedSha256: sha256(file.bytes) })),
    },
    customization: {
      packageNameChanged: template === 'web' || template === 'web-vanilla' || template === 'backend-node',
      nativeIdentifiersChanged: false,
      distributionIdentifiersStatus: 'pending-consumer-review',
      flutterProjectAndBundleIdentifiers: template === 'flutter' ? 'unchanged-from-template' : 'not-applicable',
      kotlinAndroidIdentifiers: template === 'kotlin-android' ? 'unchanged-from-template' : 'not-applicable',
      composerPackageNameChanged: false,
    },
    verification: {
      copiedFileBytes: 'verified',
      dependenciesInstalled: false,
      productBuildExecuted: false,
      productPlatformSupportVerified: false,
    },
    nextDecisions: [
      'Confirm or reject documentary adoption for this consumer.',
      'Complete both capability-profile files and select only profiles the product actually needs.',
      'Review and verify the draft technical template in the intended environments.',
      'Choose distribution identifiers, credentials, permissions, and product support before distribution.',
    ],
  };
}

async function writeNewFile(destination, file) {
  const target = path.join(destination, ...file.relativePath.split('/'));
  if (!isWithin(destination, target)) fail('UNSAFE_PATH', 'Output escaped the project directory.');
  await requirePlainDirectoryChain(path.dirname(target));
  const handle = await fs.open(target, 'wx', file.mode ?? 0o644);
  try {
    await handle.writeFile(file.bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  const copied = await readPlainFile(target);
  if (!copied.bytes.equals(file.bytes)) fail('COPY_VERIFICATION_FAILED', 'Copied bytes differ from the prepared source.');
}

// The root/release/clock parameters are explicit test seams; the CLI never accepts pin overrides.
export async function createProject({ template, name, destination, repositoryRoot = DEFAULT_REPOSITORY_ROOT, release = APPROVED_DOCUMENTARY_RELEASE, now = () => new Date() }) {
  if (typeof template !== 'string' || !Object.hasOwn(TEMPLATE_FILES, template)) fail('INVALID_TEMPLATE', 'Unknown template; consult the creation catalog.');
  validateProjectName(name);
  const requestedDestination = validateDestinationPath(destination);
  const repository = await requirePlainDirectoryChain(repositoryRoot);
  if (isWithin(repository, requestedDestination)) fail('DESTINATION_INSIDE_REPOSITORY', 'Projects must be created outside the foundation repository.');
  if (await lstatIfPresent(requestedDestination)) fail('DESTINATION_EXISTS', 'Destination already exists; nothing will be overwritten.');
  const parent = await requirePlainDirectoryChain(path.dirname(requestedDestination));
  const resolvedDestination = path.join(parent, path.basename(requestedDestination));
  if (isWithin(repository, resolvedDestination)) fail('DESTINATION_INSIDE_REPOSITORY', 'Resolved destination is inside the foundation repository.');
  const releaseFiles = await collectRelease(repository, release);
  const profileFiles = await collectCapabilityProfiles(repository);
  const sourcePlan = prepareTemplate(await collectTemplate(path.join(repository, 'starters', template), template), template, name);
  const date = now();
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) fail('INVALID_CLOCK', 'The creation timestamp is invalid.');
  const adoption = makeAdoptionRecord({ template, name, sourceFiles: sourcePlan.files, releaseFiles, profileFiles, release, createdAt: date.toISOString() });
  const directories = [...sourcePlan.directories, 'foundation'].sort((a, b) => a.split('/').length - b.split('/').length || (a < b ? -1 : a > b ? 1 : 0));
  const files = [...sourcePlan.files, ...releaseFiles, ...profileFiles, {
    relativePath: 'foundation/adoption.json', mode: 0o644, bytes: Buffer.from(`${JSON.stringify(adoption, null, 2)}\n`),
  }];
  assertNoPortableCollisions([...directories, ...files.map((file) => file.relativePath)]);
  await requirePlainDirectoryChain(parent);
  let created = false;
  try {
    await fs.mkdir(resolvedDestination, { mode: 0o755 });
    created = true;
    for (const relative of directories) {
      const target = path.join(resolvedDestination, ...relative.split('/'));
      await requirePlainDirectoryChain(path.dirname(target));
      await fs.mkdir(target, { mode: 0o755 });
    }
    for (const file of files) await writeNewFile(resolvedDestination, file);
  } catch (error) {
    if (created) error.partialDestination = resolvedDestination;
    throw error;
  }
  return {
    result: 'CREATED_FOR_EVALUATION',
    destination: resolvedDestination,
    template,
    name,
    filesCopied: files.length,
    excludedEntries: sourcePlan.excluded.length,
    foundationReleaseApproved: true,
    consumerAdoptionStatus: adoption.consumerAdoptionStatus,
    technicalTemplateStatus: adoption.technicalTemplate.status,
    capabilityProfileStatus: adoption.capabilityProfiles.selectionStatus,
    adoptionRecord: 'foundation/adoption.json',
  };
}

function solutionComponents(preset, backend) {
  const selection = SOLUTION_PRESETS[preset];
  if (!selection) fail('INVALID_PRESET', 'Unknown application type.');
  if (!['backend-node', 'backend-php', 'backend-python', 'backend-php-native'].includes(backend)) fail('INVALID_BACKEND', 'Unknown backend; consult the creation catalog.');
  return [
    ...(selection.client ? [{ directory: 'app', template: selection.client, suffix: 'app' }] : []),
    ...(selection.backend ? [{ directory: 'api', template: backend, suffix: 'api' }] : []),
  ];
}

function startDocument(language, name, preset, components) {
  const connected = components.length > 1;
  const connectionEs = connected ? '\n\n## Conexión entre app y API\n\nLa interfaz comienza deliberadamente en modo memoria para que pueda abrirse sin credenciales. No está conectada automáticamente porque esta base no debe inventar el sistema de usuarios de tu producto ni guardar un token inseguro. Cuando decidas la identidad, sigue la [guía de integración](app/api-integration.es-419.md) y la [guía de seguridad](app/security-production.es-419.md); el adaptador HTTP ya existe.\n' : '';
  const connectionEn = connected ? '\n\n## Connection between app and API\n\nThe interface deliberately starts in memory mode so it can open without credentials. It is not connected automatically because this foundation must not invent your product identity system or store an unsafe token. After choosing identity, follow the [integration guide](app/api-integration.en-US.md) and [security guide](app/security-production.en-US.md); the HTTP adapter already exists.\n' : '';
  if (language === 'es-419') return `# Empieza aquí: ${name}\n\n[English (United States)](START-HERE.en-US.md)\n\nProject Base preparó esta solución como **${preset}**. Todo se controla desde esta carpeta; no necesitas memorizar los comandos de cada tecnología ni volver al repositorio original.\n\n## Qué hay en esta carpeta\n\n${components.map((item) => `- \`${item.directory}/\`: base ${item.template}.`).join('\n')}\n\n## Los cuatro comandos\n\n\`\`\`powershell\nnpm run doctor\nnpm run setup\nnpm run check\nnpm start\n\`\`\`\n\n1. \`doctor\` te dice qué herramienta falta o tiene una versión incompatible.\n2. \`setup\` instala las dependencias bloqueadas y prepara almacenamiento local cuando corresponde. Nunca instala herramientas del sistema ni inventa credenciales.\n3. \`check\` ejecuta las verificaciones y pruebas disponibles de todos los componentes.\n4. \`start\` abre la solución para desarrollo. En Android compila el APK y te pide seleccionar el dispositivo en Android Studio.\n\nSi un comando falla, corrige únicamente el problema indicado y ejecútalo de nuevo.${connectionEs}\n## Después\n\n1. Abre el README en español dentro de cada componente.\n2. Describe las funciones reales de tu aplicación y reemplaza el ejemplo de tareas una función a la vez.\n3. Completa \`foundation/capability-profile.es-419.md\` dentro de cada componente; deja como planificado lo que todavía no exista.\n4. Mantén el cliente conectado al backend mediante la API; nunca conectes la interfaz directamente a la base de datos.\n5. Ejecuta \`npm run check\` antes de cada cambio importante.\n\nEstos comandos preparan y comprueban la base; no publican la aplicación ni la aprueban para producción.\n`;
  return `# Start here: ${name}\n\n[Español (Latinoamérica)](START-HERE.es-419.md)\n\nProject Base prepared this solution as **${preset}**. Everything is controlled from this folder; you do not need to memorize technology-specific commands or return to the original repository.\n\n## What is in this folder\n\n${components.map((item) => `- \`${item.directory}/\`: ${item.template} foundation.`).join('\n')}\n\n## The four commands\n\n\`\`\`powershell\nnpm run doctor\nnpm run setup\nnpm run check\nnpm start\n\`\`\`\n\n1. \`doctor\` reports a missing tool or incompatible version.\n2. \`setup\` installs locked dependencies and prepares local storage where applicable. It never installs system tools or invents credentials.\n3. \`check\` runs the available verification and tests for every component.\n4. \`start\` opens the solution for development. For Android it builds the APK and asks you to select the device in Android Studio.\n\nIf a command fails, correct only the reported problem and run it again.${connectionEn}\n## Then\n\n1. Open the English README inside each component.\n2. Describe the real product features and replace the task example one feature at a time.\n3. Complete \`foundation/capability-profile.en-US.md\` inside each component; keep anything not implemented as planned.\n4. Keep the client connected to the backend through the API; never connect the interface directly to the database.\n5. Run \`npm run check\` before every important change.\n\nThese commands prepare and verify the foundation; they neither publish the application nor approve it for production.\n`;
}

export async function createSolution({ preset, backend = 'backend-node', language = 'es-419', name, destination, repositoryRoot = DEFAULT_REPOSITORY_ROOT, release = APPROVED_DOCUMENTARY_RELEASE, now = () => new Date() }) {
  validateProjectName(name);
  if (!['es-419', 'en-US'].includes(language)) fail('INVALID_LANGUAGE', 'Language must be es-419 or en-US.');
  const components = solutionComponents(preset, backend).map((item) => ({ ...item, name: validateProjectName(`${name}-${item.suffix}`) }));
  const requestedDestination = validateDestinationPath(destination);
  const repository = await requirePlainDirectoryChain(repositoryRoot);
  if (isWithin(repository, requestedDestination)) fail('DESTINATION_INSIDE_REPOSITORY', 'Applications must be created outside the foundation repository.');
  if (await lstatIfPresent(requestedDestination)) fail('DESTINATION_EXISTS', 'Destination already exists; nothing will be overwritten.');
  const parent = await requirePlainDirectoryChain(path.dirname(requestedDestination));
  const resolvedDestination = path.join(parent, path.basename(requestedDestination));
  if (isWithin(repository, resolvedDestination)) fail('DESTINATION_INSIDE_REPOSITORY', 'Resolved destination is inside the foundation repository.');
  const createdAt = now();
  if (!(createdAt instanceof Date) || !Number.isFinite(createdAt.getTime())) fail('INVALID_CLOCK', 'The creation timestamp is invalid.');
  const runner = await readPlainFile(path.join(repository, 'tools', 'solution-runner.mjs'));
  const packageManifest = {
    name: `${name}-workspace`, version: '0.1.0', private: true, license: 'MPL-2.0', type: 'module',
    engines: { node: '24.x' }, scripts: { doctor: 'node project-base.mjs doctor', setup: 'node project-base.mjs setup', check: 'node project-base.mjs check', start: 'node project-base.mjs start' },
  };
  await fs.mkdir(resolvedDestination, { mode: 0o755 });
  const results = [];
  try {
    for (const component of components) {
      results.push(await createProject({ template: component.template, name: component.name,
        destination: path.join(resolvedDestination, component.directory), repositoryRoot: repository, release, now: () => createdAt }));
    }
    const manifest = { formatVersion: 1, kind: 'project-base-solution', createdAt: createdAt.toISOString(), name, preset, language,
      components: components.map((item) => ({ directory: item.directory, template: item.template, revision: TEMPLATE_REVISIONS[item.template] })) };
    for (const file of [
      { relativePath: 'START-HERE.es-419.md', bytes: Buffer.from(startDocument('es-419', name, preset, components)) },
      { relativePath: 'START-HERE.en-US.md', bytes: Buffer.from(startDocument('en-US', name, preset, components)) },
      { relativePath: 'project-base.json', bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`) },
      { relativePath: 'project-base.mjs', bytes: runner.bytes },
      { relativePath: 'package.json', bytes: Buffer.from(`${JSON.stringify(packageManifest, null, 2)}\n`) },
    ]) await writeNewFile(resolvedDestination, { ...file, mode: 0o644 });
  } catch (error) {
    error.partialDestination = resolvedDestination;
    throw error;
  }
  return { result: 'SOLUTION_CREATED_FOR_EVALUATION', destination: resolvedDestination, name, preset,
    components: results.map((item) => ({ directory: path.basename(item.destination), template: item.template, revision: TEMPLATE_REVISIONS[item.template] })),
    startHere: 'START-HERE.es-419.md' };
}
