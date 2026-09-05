# Native PHP SQL profiles

[Español (Latinoamérica)](sql-engines.es-419.md) · [Start](README.en-US.md)

SQLite remains the zero-service default. PostgreSQL and MySQL are additional **local-server profiles**, selected explicitly through process environment variables. No framework is required. Application/Domain and the versioned client API are unchanged. Shared prepared SQL implements the repository/token ports; server-specific schemas and the transactional row-locking limiter remain in Infrastructure. There is no silent fallback to SQLite when configuration fails.

## Configure an independent solution

Create a dedicated empty database and a least-privileged account for your own application. Do not run initial migrations against unrelated databases. Use PHP 8.5 with `pdo_pgsql` for PostgreSQL or `pdo_mysql` for MySQL; `pdo_sqlite`, mbstring and openssl remain necessary for the isolated default checks. `npm run doctor` verifies the selected driver, not the validity of credentials or server availability.

In a private PowerShell terminal at the generated solution root:

```powershell
$env:NATIVE_PHP_ENGINE = 'pgsql'
$env:NATIVE_PHP_DB_HOST = '127.0.0.1'
$env:NATIVE_PHP_DB_PORT = '5432'
$env:NATIVE_PHP_DB_NAME = 'my_application'
$env:NATIVE_PHP_DB_USER = 'my_application'
$env:NATIVE_PHP_DB_PASSWORD = Read-Host 'Database password' -MaskInput
npm run doctor
npm run setup
npm run check
npm start
```

For MySQL use `mysql` and the configured port (normally `3306`). The password is intentionally not a literal in the example: never record it in shell history, Git or logs. The process environment contains sensitive values; use an isolated account/session and clear the password afterward. No `.env` file is loaded. Hosts other than `127.0.0.1` are rejected: remote database TLS/identity verification is outside this local profile. Do not expose the unencrypted local database transport publicly.

Setup calls `php scripts/database.php server-up` inside the API component. It applies checksummed migrations to the explicitly configured database, never creates users or databases, and never copies existing SQLite data. Start preserves that engine selection. Check always uses isolated synthetic SQLite data, regardless of selected server settings; run the additional SQL lab below to exercise both server adapters.

From the API component, provision a token using `php scripts/token.php issue configured demo-user read-write 3600 --show-token`; revoke using `php scripts/token.php revoke configured HASH_ID`. The command reads the same server configuration. Protect its secret output exactly as described in the main guide.

## Migrations and recovery boundaries

PostgreSQL schema work uses a transaction and advisory lock. MySQL DDL implicitly commits: an advisory lock serializes migrations and the initial statements are idempotent for interrupted initialization. Do not describe MySQL schema rollback as transactional. Changed recorded migration hashes are rejected. Initial rollback is destructive and requires a verified backup and an operator decision; there is no automatic drop or downgrade.

The existing `recovery.php` command is **SQLite-only**. PostgreSQL/MySQL backups require their own verified native backup/restore procedure; this change does not add those commands or transfer data between engines. Changing environment variables selects another store, not a data migration. Rehearse data transfer, reconciliation, backup, cutover and rollback separately before changing a populated application.

## Isolated engine verification

From this component, with Node.js 24, Docker and tar:

```powershell
$env:TEST_DOCKER_WSL = 'Ubuntu-24.04'
node tests/server-check.mjs
```

Omit `TEST_DOCKER_WSL` when Docker is directly available. The test builds a PHP-only runtime from the pinned base, with no Composer/application framework. An explicit source-only archive excludes environment files, runtime data and dependencies. PostgreSQL 18.6 and MySQL 8.4.11 containers have random owned names, synthetic credentials, loopback ports and temporary in-memory database storage. The lab never attaches to existing databases. Only its own containers/volumes are removed; image/build caches remain.

On 2026-09-05, Windows Node 24.16.0 with Docker in Ubuntu-24.04 WSL passed both engine flows: migration replay/checksum rejection; real HTTP CRUD, Unicode, pagination, owner isolation, permissions, token expiry/revocation; 24 simultaneous creates; one winner and 11 conflicts for 12 same-version updates; and 12 independent limiter connections admitting five, rejecting seven and retaining a bounded counter. The harness initially failed readiness because inline PHP quoting was lost across the WSL invocation; using a dedicated script fixed the harness without changing database timeouts or application policy.

This is bounded local adapter acceptance, not a performance guarantee or production approval. The previous SQLite HTTPS/recovery evidence remains separate; this lab does not claim SQL-server backup/restore or remote SQL TLS verification. macOS/iOS validation is unchanged and remains pending.
