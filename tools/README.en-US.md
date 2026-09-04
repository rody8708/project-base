# Technical foundation exporter

Working revision: `1.1.0-draft.2`, after stable technical release `1.1.0`.
Status: the exporter prepares the current checkout for evaluation. Release `1.1.0` is approved for its frozen scope, but `main` may contain later changes; adoption and validation of the consumer product always remain pending.

[Español (Latinoamérica)](README.es-419.md) · [Home](../README.en-US.md)

To select components and follow the complete process, read [how to create an application with this foundation](../docs/getting-started.en-US.md).

## Purpose and requirements

The tool prepares a new project outside this repository from six templates: `starters/web`, `starters/web-vanilla`, `starters/flutter`, `starters/kotlin-android`, `starters/backend-php`, or `starters/backend-node`. It does not install dependencies, execute package scripts, build, use the network, or publish. It copies the four approved documentary artifacts unchanged and adds a bilingual capability-selection profile; it does not extract the ZIP, copy `docs/technical`, or modify source projects.

`web` is the React/TypeScript/Vite option. `web-vanilla` is the HTML/CSS/JavaScript alternative without those frameworks or tools: its candidate has no npm dependencies and uses built-in Node.js modules for checks and local file serving. The exporter does not add packages or execute those scripts.

Use Node.js `24.x`; the tests recorded here ran with `24.16.0` on Windows. No npm packages are required for the exporter or its tests. The destination's immediate parent directory must exist; the complete destination must not exist, even as an empty directory. Use a trusted local hierarchy with no concurrent changes to files, permissions, or links.

## Usage

### Easily create a complete solution

From the repository root:

```powershell
npm run create-app
```

The bilingual assistant offers a simple website, web application, mobile, desktop, native Android, or API-only project without requiring template names. When a solution needs a client and backend, it creates both inside one common folder and generates a bilingual `START-HERE`. Creation does not install, build, publish, or overwrite. The solution provides four coordinating commands: `npm run doctor`, `npm run setup`, `npm run check`, and `npm start`; only `setup`, when explicitly run by the user, installs its components' locked dependencies.

### Export one template: advanced mode

From the repository root, choose a new absolute path and a lowercase ASCII name of 1–63 characters: it must start with a letter and may contain digits and single hyphens between groups. Spaces, underscores, repeated hyphens, and trailing hyphens are not allowed.

```powershell
node tools/create-project.mjs --template web --name my-web-project --destination "D:\projects\my-web-project"
node tools/create-project.mjs --template web-vanilla --name my-plain-site --destination "D:\projects\my-plain-site"
node tools/create-project.mjs --template flutter --name my-flutter-project --destination "D:\projects\my-flutter-project"
node tools/create-project.mjs --template kotlin-android --name my-native-project --destination "D:\projects\my-native-project"
node tools/create-project.mjs --template backend-php --name my-api-project --destination "D:\projects\my-api-project"
node tools/create-project.mjs --template backend-node --name my-node-api --destination "D:\projects\my-node-api"
```

These paths are examples; choose your own directories whose parent already exists. On a POSIX system use its local absolute path, such as `/projects/my-web-project`; this does not represent an execution test on that system.

```powershell
node tools/create-project.mjs --help
```

The CLI accepts only `--template`, `--name`, and `--destination`, or `--help` alone. There are no options to force overwrite, skip checksums, change the approved release, or approve adoption. It returns JSON and exit code `0` when the copy completes; it returns a JSON error and exit code `1` on failure.

For `web`, `web-vanilla`, and `backend-node`, `--name` changes only the name in `package.json`, the npm lockfile's top-level name, and its root package when present; the receipt records `packageNameChanged: true`. It preserves other fields and dependency records; this does not verify that they can be installed. HTML titles and visible text remain unchanged. For `flutter`, the name only identifies the preparation in the JSON receipt: it does not change `pubspec.yaml`, packages, display names, or bundle/application IDs. Distribution identifiers remain subject to the consumer's decision and verification.

For `kotlin-android`, packages and application IDs also remain unchanged; for `backend-php`, the Composer identity remains unchanged. Gradle wrappers and locks, or the Composer manifest and lock, are preserved as applicable. The tool checks for essential files; it does not resolve dependencies or certify lockfile content.

## Delivered content

In addition to the allowed template files, the `foundation/` directory contains:

| File | Purpose |
| --- | --- |
| `foundation-0.1.0-draft.4.zip` | Documentary snapshot approved as release `1.0.0`; retains its historical editorial filename. |
| `approval-1.0.0.es-419.md` | Latin American Spanish approval receipt. |
| `approval-1.0.0.en-US.md` | United States English approval receipt. |
| `foundation-0.1.0-draft.4.verification.json` | Historical record linked by the receipts; its preapproval status is not rewritten. |
| `capability-profile.es-419.md` | Consumer selection and acceptance record in Latin American Spanish. |
| `capability-profile.en-US.md` | Equivalent US English capability record. |
| `adoption.json` | Inventory and result of this preparation, not consumer approval. |

The four historical artifacts are compared against SHA-256 values pinned in the code before creating the destination. Each written file is read back and compared byte-for-byte with its prepared content. The historical receipts retain their links between these files. These hashes detect a difference from the pinned values; they are not a digital signature and cannot independently authenticate a compromised repository or tool.

The `adoption.json` record distinguishes:

```json
{
  "foundationReleaseApproved": true,
  "consumerAdoptionStatus": "pending-consumer-confirmation",
  "capabilityProfiles": {
    "selectionStatus": "pending-consumer-selection"
  },
  "technicalTemplate": {
    "revision": "1.1.0-draft.2",
    "stage": "draft",
    "status": "not-approved",
    "generationStatus": "generated-for-evaluation"
  }
}
```

All current starters are at `1.1.0-draft.2`; the receipt always records the exact revision of the selected template instead of assigning one global revision. The two capability files are copied byte-for-byte and their SHA-256 values are recorded in `adoption.json`. They require the consumer to select `not applicable`, `planned`, or `enabled` for identity, multitenancy/privacy, payments/licensing, secure mobile, offline/sync, and distribution. Selection is not implementation or approval.

It also includes a UTC timestamp, source and copy hashes, name changes, and checks that were not performed. The inventory hash identifies the source files included in that preparation; it is not a Git identifier, signature, or evidence of binary reproducibility. It includes no absolute machine paths. Available documentary approval does not confer technical approval, consumer adoption, or platform support.

## Copying and exclusions

When present, both template READMEs, `.env.example`, allowed source files, assets, and lockfiles are retained. Both READMEs and the corresponding manifest/lock must exist. Content is not executed or translated; npm JSON and `.npmrc` are parsed for the checks described here. Except for the two customized npm JSON files and the new receipt, included files retain their bytes.

`web-vanilla` additionally requires `index.html`, `styles.css`, `favicon.svg`, `src/main.js`, `scripts/serve.mjs`, `scripts/server.mjs`, and `scripts/check.mjs`. Its `package.json` and `package-lock.json` undergo the same JSON, identity, and npm lock-version (`1`, `2`, or `3`) checks as `web`. Requiring those files does not certify browser behavior or that every future script remains dependency-free.

The filename policy in [the exporter](lib/project-export.mjs) excludes the following, including in nested directories and regardless of case:

- Known dependencies, caches, and outputs: `node_modules`, `build`, `dist`, `.dart_tool`, `.fvm` (while retaining `.fvmrc`), `.gradle`, `outputs`, `output`, `coverage`, `.cache`, `.next`, `.turbo`, `Pods`, `ephemeral`, and `.symlinks`.
- Local metadata and internal results: `.git`, `.idea`, `.validation`, `releases`, `.iml` files, logs, and known temporary files.
- Local native configuration: `local.properties`, `key.properties`, locally generated Flutter files, and known Xcode data locations.
- Real environment files recognized by name: `.env`, `.env.*` except `.env.example`, `.envrc`, and names ending in `.env`.
- Recognized secret/credential directories and files, keys and signing stores, service configuration, and package-manager configuration that may contain credentials.
- PHP/Kotlin dependencies and outputs: `vendor`, `.phpunit.cache`, `.kotlin`, `.cxx`, `artifacts`, `auth.json`, and the PHPUnit result cache. Files matching `*.sqlite`, `*.sqlite3`, `*.db`, and their `-wal`, `-shm`, and `-journal` files are excluded: databases are created through migrations, not by copying data.

For Laravel, recognized `storage` scaffold directories and their `.gitignore` files are retained, while data, sessions, compiled views, caches, uploads, and logs are excluded. Only `.gitignore` is retained inside `bootstrap/cache`. Migrations and source configuration are copied.

`.npmrc` is a reviewed exception: only `engine-strict=true` and/or `save-exact=true` lines are accepted, without duplicates, with LF/CRLF separators and optional empty lines. Its bytes are preserved. Any other configuration stops export before destination creation; the error does not show its contents. An empty `.npmrc` is also rejected.

This policy is not a universal secret detector. Review the template's content, including environment examples and assets, before exporting: a credential embedded in an ordinarily named file is not detected by these filters. Configuration needed for a private npm registry, signing, or distribution is not all copied automatically.

## Safety and recovery limits

Relative destinations, explicit traversal, Windows device/stream names, UNC, and device namespaces are rejected. The destination is checked to be outside the repository by both lexical and resolved location. Symlinks, junctions, and detectable aliases in inspected paths are rejected, as are hard-linked included files. Excluded directories are not traversed.

Copying rejects case or Unicode NFC name collisions and the reserved `foundation` path in a template. Limits are 10,000 source files, 128 MiB of total source content, and 32 MiB per file read. Files are opened for exclusive creation; the tool never overwrites or deletes files or directories, or initializes Git.

Path checks and exclusive creation use [Node.js's official filesystem APIs](https://nodejs.org/docs/latest-v24.x/api/fs.html). They are not a sandbox against malicious processes changing the hierarchy between operations; they also do not certify all reparse-point types, mounts, network filesystems, or naming semantics. Do not run on shared or untrusted hierarchies. A whole-directory transaction and power-loss durability are not guaranteed.

If a failure occurs after destination creation, the tool returns `partialDestinationRetained` and preserves the partial directory for inspection; it does not declare that preparation complete. It does not resume into that directory. After investigating the cause, use another new destination if appropriate. The consumer must review the template, confirm or reject documentary adoption, and verify its environments, dependencies, identifiers, and product requirements.

## Exporter tests

```powershell
node --test tools/create-project.test.mjs
```

Recorded local result: `40` tests passed, `0` failed, and `0` skipped on Windows with Node.js `24.16.0`, on 2026-09-04. The suite covers capability-profile presence, byte/hash receipts, exact per-template revisions, synthetic web/Flutter/Kotlin/PHP copies, data and cache exclusions, scaffold file types, pending adoption, portable names, and two creators competing for one destination. Earlier framework-free web coverage remains: dependency-free source preservation, npm renaming/receipt, exclusions, `.npmrc`, required files, manifests/locks, and destination/link protections.

Tests create isolated synthetic fixtures in their own temporary directories and remove only those directories after verifying their location. Their supposed approval artifacts are test data, not new receipts; pin replacement exists only in the importable test interface, not the CLI. The suite uses [Node.js's built-in test runner](https://nodejs.org/docs/latest-v24.x/api/test.html). POSIX lexical cases run as string functions on Windows: they do not test a POSIX filesystem. This suite does not install or test React, Flutter, browsers, devices, native builds, or real consumer projects.
