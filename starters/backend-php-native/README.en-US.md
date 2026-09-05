# Native PHP backend — no application framework

[Español (Latinoamérica)](README.es-419.md)

A reusable PHP 8.5 API with no Laravel, Composer packages or application framework. It includes task CRUD, explicit authentication/authorization, versioned JSON contracts, repository ports, a SQLite adapter, migrations and isolated tests. Template revision: `1.3.0-draft.1`; local evaluation is verified, not production approved.

## Start your own application

In Project Base, run `npm run create-app` and select **Native PHP — no framework, SQLite** when asked for a backend. The generated project is independent: no connection to Project Base is needed afterward. Keep the original repository out of your product's runtime.

From the generated solution root:

```powershell
npm run doctor
npm run setup
npm run check
npm start
```

Requirements: Node.js 24, PHP 8.5 with `pdo_sqlite`, `mbstring` and `openssl`. Composer is not needed. Setup creates `api/.runtime/local.sqlite`, repeats migrations safely and never issues credentials automatically. The runtime directory is ignored by Git. Protect its directory ACLs on Windows. Tests use separate temporary databases, never this file.

Start binds only to `http://127.0.0.1:8080`; `/api/health` is liveness, not production approval. Set `NATIVE_PHP_PORT` to a free port if necessary. Stop with Ctrl+C. The PHP built-in server is for development only. The generated frontend starts in memory mode until you explicitly configure API identity and its HTTP adapter.

For an individually exported component, use `node scripts/local.mjs doctor|setup|check|start` from the component folder. In the maintained source checkout, setup/start refuse to create runtime data; tests still run there.

## Provision a local identity

From the component folder, replace the absolute example path with your generated database path:

```powershell
php scripts/token.php issue C:/products/my-app/api/.runtime/local.sqlite demo-user read-write 3600 --show-token
```

This command intentionally prints a new secret token, its hash `id` and expiry. Use a private terminal without transcription; never put its output in Git, logs or issues. Send API requests with `Authorization: Bearer TOKEN`. The database stores only the SHA-256 hash. Profiles are `read` and `read-write`; lifetime is 1..86400 seconds.

Revoke with `php scripts/token.php revoke ABSOLUTE_DATABASE HASH_ID`, using the hash ID rather than the token. HTTP also provides `GET /api/v1/auth/session` and `DELETE /api/v1/auth/token`. Provisioned tokens are not password login, account recovery or MFA.

## Build on the example

- Domain: pure task entities, validation and conflict categories.
- Application: use cases/services, identity and repository/auth/rate-limit ports; no SQL or framework.
- Infrastructure: SQLite persistence, token hashing/storage, atomic rate limiting, migrations and recovery.
- HTTP presentation: typed/limited requests, safe bilingual errors, exact-origin CORS and request IDs.
- Contract: [task API v1](contracts/task-api-v1.openapi.json).

Clients use the API only; never connect them directly to SQLite. Reads/writes are owner-scoped, permissions are explicit and updates/deletes require the current version. Add your business behavior in Application/Domain and keep engine details in adapters. PostgreSQL and MySQL are not implemented in this native profile; changing engines requires implementing and verifying their adapters/migrations and migrating existing data.

## Configuration and safeguards

The router reads `NATIVE_PHP_DATABASE` and `API_ALLOWED_ORIGINS` from the process environment, never a real `.env` file. Generated start supplies the local database and the selected web origin. Origins must be exact HTTP(S) origins without wildcard, path or cookies. The direct peer is rate-limited to 120 requests/minute; forwarded IP headers are ignored. Fixed windows allow boundary bursts. Reverse-proxy identity and a production web-server configuration are not provided.

For an explicit external database, use `php scripts/database.php init ABSOLUTE_NEW.sqlite`, then `up` for migration replay. Parents must exist; initialization never overwrites. Checksummed migrations run transactionally. Rollback notes are in each SQL file; rollback is not an automatic destructive operation. Repository source and exported frozen foundation paths are protected.

## Back up and restore

From the component folder, use explicit absolute paths in a private directory:

```powershell
php scripts/recovery.php snapshot C:/sandbox/source.sqlite C:/sandbox/snapshot-01
php scripts/recovery.php verify C:/sandbox/snapshot-01
php scripts/recovery.php restore C:/sandbox/snapshot-01 C:/sandbox/restored.sqlite
```

Both destinations must be new. SQLite `VACUUM INTO` takes a consistent snapshot, including committed WAL pages, without copying an open main file blindly. Verification checks SHA-256, SQLite integrity and foreign keys. These backups are **unencrypted**: keep them private and outside Git. Checksums detect corruption, not malicious replacement of both database and manifest.

Restore never replaces the live database. It invalidates all recovered tokens, clears rate counters and returns `RESTORED_NOT_ACTIVATED`. Provision new tokens and verify the restored application before explicitly changing its database path. Failed operations retain partial output for inspection; never activate it.

## Verification and limits

Run from this component:

```powershell
node scripts/local.mjs check
node tests/transport-check.mjs
```

The second command additionally needs the OpenSSL CLI (Git for Windows' bundled binary is detected; `TEST_OPENSSL` can specify another executable). It creates temporary TLS material and eight local PHP processes. It changes no trust store and never disables certificate verification. All owned processes, databases, sidecars and keys are cleaned up. No real environment files or customer data are read.

Windows/PHP 8.5.1/Node 24.16.0 evidence on 2026-09-04:

- Domain/in-memory and SQLite integration, migrations/checksum rejection, HTTP CRUD, Unicode, owner isolation, permissions, expired/revoked tokens, CORS, input limits, duplicate JSON/query rejection and localization passed. The duplicate-query defect had been reproduced as 200 instead of 422 before correction.
- Shared React/native-web adapter acceptance passed against both Laravel and native PHP in Project Base. Browser acceptance passed allowed-origin CRUD and rejected-origin blocking; test pages/processes were closed. These additional cross-starter/browser checks require the repository, but the exported component's own checks do not.
- Local recovery passed source preservation, no overwrite, damaged-file rejection, credential invalidation and committed-WAL/uncommitted-write separation.
- Verified TLS 1.2/1.3 connection, untrusted certificate and wrong-hostname rejection passed. With eight processes sharing one database: 24 concurrent creates persisted; one of 12 same-version updates succeeded and 11 returned 409. After 38 accepted requests, a 144-request burst admitted 82 and rejected 62 with 429 in the same window.
- Restored data was read and updated over HTTPS using a new token; the old token returned 401.
- Independent wizard export passed diagnosis, setup/replay, isolated checks, start and authenticated task creation/read. All supported client compositions generated successfully; this is not a fresh native-device verification.

The lab uses an ephemeral self-signed certificate explicitly trusted by its client and a test-only loopback TLS terminator. It is not a production proxy or certificate-renewal implementation. Results are bounded acceptance trials, not sustained-load capacity, an RPO/RTO guarantee, exhaustive contract validation or production approval. Real deployment TLS, renewal, monitoring, alerts, backup encryption/retention/offsite storage and product-specific identity remain each application's responsibility. CI is configured; no remote result is claimed for this uncommitted revision.
