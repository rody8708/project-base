# Native PostgreSQL and MySQL Recovery

[Español (Latinoamérica)](server-recovery.es-419.md) · [Home](README.en-US.md) · [SQLite recovery](recovery.en-US.md) · [Encrypted operations](backup-operations.en-US.md)

Technical revision: `1.1.0-draft.1`. Local rehearsal passed on `2026-09-03`; production is not approved.

## Contract and Execution

The shared rule is to back up consistently, verify integrity, restore into a new destination, and check data and authorization before any activation. It does not depend on Laravel: each engine implements the rule using its own tools. This profile runs the PHP starter's migrations and API to check integration; it is not a general backup service for existing databases.

From this starter, with Composer dependencies installed, PHP 8.5 and SQLite, PostgreSQL, and MySQL PDO drivers, Windows, and local Docker in WSL `Ubuntu-24.04`:

```powershell
php -d extension=pdo_pgsql scripts/verify-server-recovery.php --wsl-docker
```

Omit `-d extension=pdo_pgsql` if already loaded. This does not install or replace services. It downloads official digest-pinned images and creates disposable source and target containers per engine, with dynamic loopback-only ports, tmpfs data, read-only roots, and resource limits. Passwords are random and private; they do not appear in arguments or reports. MySQL receives a private temporary configuration inside its container. Protect the local `.validation` directory with Windows ACLs.

## Verified Workflow

1. Create the actual tables and two identities' data through the HTTP kernel.
2. Produce a native backup, write it, and verify its size and SHA-256 from disk.
3. Change the source after the backup: delete the initial task, add another, and revoke the token.
4. Check that the target is empty and import into another container using the same engine and version.
5. Compare task, token, and migration data, plus table counts; this is not an exhaustive comparison of all DDL.
6. Revoke every restored token and clear caches. Check old token 401, fresh token 200, owner isolation, and absence of the post-snapshot write.
7. Verify that restoration did not change the source and that populated targets are refused. The result is `RESTORED_NOT_ACTIVATED`; no live application's traffic or connections are switched.

The restored API is tested through its in-process HTTP kernel, not a new HTTPS connection. The existing HTTPS lab and user services are unchanged. Cleanup validates the exact name, labels, and ID before removing only owned containers. Temporary dumps are deleted; manifests and a report without rows or secrets remain under `.validation/recovery-<scope>`. Images remain cached.

## Engine Conditions

PostgreSQL uses `pg_dump --format=custom --no-owner --no-acl` and `pg_restore --single-transaction --exit-on-error --no-owner --no-acl`. This backs up one database, not global roles, original permissions, or an entire cluster. WAL point-in-time recovery and cross-version migration are not tested.

MySQL uses `mysqldump --single-transaction --quick --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF` and imports with `mysql`, without `--force`. The profile requires InnoDB tables and refuses custom routines, events, or triggers. Do not allow concurrent DDL during backup. Consistency for nontransactional engines, binlog recovery, and preservation of server users and permissions are not demonstrated.

A failure leaves the target unapproved: quarantine it and never activate it. In particular, MySQL DDL can leave a partial import; do not retry over that target. The empty-target check fits these exclusively owned containers; it does not replace excluding other operators in production. SHA-256 detects corruption but does not authenticate a backup when someone can also replace its manifest.

## Evidence and Remaining Work

PostgreSQL 18.6 and MySQL 8.4.11 passed the full workflow. Rehearsal `1cc463fffbb866d6`: PostgreSQL, 7,689 bytes, backup 217.267 ms and restore 248.085 ms; MySQL, 6,056 bytes, 219.043 ms and 249.477 ms. All four containers were removed. These are tiny fixtures, not RTO/RPO commitments; dumps are buffered in memory and this verifier is not designed for large backups.

The starter now provides a verifiable [authenticated encrypted container](backup-operations.en-US.md). Each project must connect it to durable off-host storage and complete KMS/key custody, retention policy, scheduling, alerts, least privilege, remote database connection TLS, realistic-volume restores, and traffic cutover/rollback. This rehearsal does not provide those services or cover human login, account recovery, or MFA. The application key and certificates need separate recovery.

Sources: [PostgreSQL pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html), [PostgreSQL pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html), and [MySQL mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html).
