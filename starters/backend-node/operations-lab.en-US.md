# Node Operations Lab

[Español latinoamericano](operations-lab.es-419.md) · [Home](README.en-US.md)

## Run

Requirements: Node 24.16.0, npm, OpenSSL (on Windows, Git for Windows at its standard path), and Docker for PostgreSQL/MySQL. The lab does not load `.env` files or accept existing database URLs.

```powershell
npm ci --ignore-scripts
npm run check
npm run check:operations
$env:NODE_LAB_ENGINE='postgresql'
$env:NODE_LAB_WSL='Ubuntu-24.04'
npm run check:operations
$env:NODE_LAB_ENGINE='mysql'
npm run check:operations
```

On Linux use shell environment variables and omit NODE_LAB_WSL. The nine fast tests need neither OpenSSL nor Docker. The operations trial is one integrated test per engine with multiple assertions, not hundreds of independent tests. CI runs all three variants.

## Verified Scope

- HTTPS validates trust and hostname; rejects untrusted certificates, incorrect names, and expired certificates. No trust stores are modified and TLS is not disabled.
- Authentication, expiration, permissions, case-sensitive ownership, Unicode, duplicate parameters, JSON shape, size, content types, and stale versions.
- 24 simultaneous creates and 12 updates to one version: one succeeds and eleven return 409.
- Two connections/pools share a five-operation budget across 24 operations. Two HTTP servers share a real 120-request budget: 144 requests produce 120 successes and 24 responses with 429. The test fixes the window to avoid crossing a minute.
- SQLite uses `node:sqlite.backup`; PostgreSQL `pg_dump/psql`; MySQL `mysqldump/mysql`. Restore targets another empty database, verifies schema version and Unicode data, invalidates all restored tokens before serving, and tests read, update, conflict, and delete through HTTPS. The source retains its data and tokens.
- Data created after backup does not appear in the target.

Verified locally on Windows, Node 24.16.0 (SQLite 3.53.0), PostgreSQL 18.6, and MySQL 8.4.11 in Docker/WSL. Resources are synthetic and owned: containers labeled `project-base=node-test`, loopback ports, temporary storage without user mounts, and new directories. Servers, containers, DB files, certificates, and dumps are removed; cached images and dependencies remain. Dumps stay in memory and are never printed.

## Adoption and Migration

`DATABASE_URL` selects PostgreSQL/MySQL; without it, SQLite uses `DB_DATABASE`. Repositories accept asynchronous results; direct callers of application helpers must use `await`. The HTTP contract is unchanged. Do not copy SQLite databases into another engine: data migration requires a product-specific operation.

The initial migration creates tables idempotently and records `schema_migrations=1`. It adopts the previous SQLite schema without removing rows. PostgreSQL/MySQL are new installations; start a single instance to migrate before scaling. The initial migration has no automatic destructive rollback: back up first and restore that backup to return to the earlier state. Arbitrary external schema migration is not promised.

SQLite rejects versions older than 3.51.3 for files, retains WAL, and now explicitly uses FULL synchronization; use local disks and the backup API, not a copy of an open main file alone. Its driver is synchronous and can block the process during I/O: this bounded trial does not establish sustained capacity. PostgreSQL/MySQL use asynchronous pools and shared atomic limiting; behind a proxy, define and validate client identity rather than automatically trusting forwarded headers.

## Limits

No human login, password recovery, or MFA. No certification of exhaustive PHP parity, sustained capacity, availability, RPO/RTO, public deployment, or production. Consumer decisions remain: TLS provider, secrets, least privilege, encrypted external backup, retention, monitoring, alerts, volume testing, and security review. The HTTP launcher continues rejecting environments other than local/testing.

Implementation sources: [pg parameterized queries](https://node-postgres.com/features/queries), [pg transactions](https://node-postgres.com/features/transactions), [mysql2 documentation](https://sidorares.github.io/node-mysql2/docs/documentation). Drivers and dialects remain in infrastructure.
