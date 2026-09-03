# Verified Backup and Recovery

[Español (Latinoamérica)](recovery.es-419.md) · [Home](README.en-US.md) · [Docker lab](docker-local.en-US.md) · [Security](security-production.en-US.md)

Technical revision: `1.1.0-draft.1`. Local evidence: `2026-09-03`. Executable SQLite profile; not production recovery approval.

## Technology-Independent Contract

A backup needs an identifiable recovery point, consistency, integrity verification, and a rehearsed restore. Restoring creates a new destination; it never automatically replaces live data. Only after checking data, permissions, credentials, and application behavior may a controlled destination switch be approved.

The concept does not depend on PHP, Laravel, or SQLite. This implementation uses Laravel-independent `SqliteRecovery` and a CLI command. Its credential invalidation rules target this starter's schema. PostgreSQL and MySQL have a [separate native rehearsal](server-recovery.en-US.md): never use the SQLite command with those engines.

## Commands

From this starter, with dependencies installed and an evaluation database:

```text
php scripts/sqlite-recovery.php snapshot SQLITE_DATABASE_PATH NEW_PRIVATE_DIRECTORY
php scripts/sqlite-recovery.php verify BACKUP_DIRECTORY
php scripts/sqlite-recovery.php restore BACKUP_DIRECTORY NEW_SQLITE_DATABASE
node scripts/docker-local.mjs verify
```

Use explicit paths outside public, exported code, and repositories. The parent directory must exist and be private. snapshot requires a new directory; restore requires a new file. Existing destinations are not overwritten, and restores are not activated. Commands print metadata and outcomes, never rows, tokens, or keys.

On Windows, configure private ACLs on the parent: chmod does not replace ACLs. Linux directories use 0700 and data files use 0600. Ensure sufficient space, exclusive permissions, and a controlled destination; do not use paths writable by untrusted users.

## Adapter Behavior

snapshot uses VACUUM INTO, not a direct copy of an active database. It includes committed WAL data. It writes database.sqlite and, after integrity checks and flushing buffers, manifest.json containing SHA-256, size, UTC time, and duration. Failures may leave partial output: quarantine it and never treat it as a backup.

verify checks format, size, checksum, PRAGMA integrity_check, and PRAGMA foreign_key_check. The manifest cannot select another file. Checksums detect accidental alteration; they do not authenticate the backup creator. An attacker permitted to replace both the file and manifest can replace both: protect storage and add signing/authentication in the production profile.

restore verifies the backup, exclusively reserves a new file, copies and verifies contents, and invalidates ALL tokens in the restored database before returning RESTORED_NOT_ACTIVATED. It clears transient caches and locks. Provision fresh credentials; tokens revoked after the snapshot are never resurrected. The restored hash deliberately changes due to invalidation. Source and backup remain unchanged.

If restore fails after reserving its file, that file is incomplete and must not be activated. Even success does not approve a database switch or establish that other processes have closed their connections.

## Automated Rehearsal

Docker verification creates ANOTHER disposable container; it does not touch the open lab or its certificates:

1. Create and update a task over HTTPS.
2. Create a consistent backup.
3. Add a post-snapshot task, delete the original, and revoke the token.
4. Restore to a separate database and verify the earlier state.
5. Bootstrap an application instance against that database inside the test process: its HTTP kernel rejects the old token (401) and accepts a fresh one (200).
6. Verify over HTTPS that the original server database is unchanged, then remove only the test container.

Reading the restored copy uses the in-process HTTP kernel; no real traffic cutover or cross-server failover is claimed. The original server is checked through real HTTPS from Windows.

## Evidence and Limits

Linux PHP 8.5.10 rehearsal: 53,248-byte snapshot in 4.728 ms; restore in 3.861 ms; expected data recovered; old token returned 401 and new token returned 200. These are tiny-database measurements, not RTO/RPO targets or large-volume estimates. That rehearsal's container was removed.

Unit tests cover committed/uncommitted WAL, referential integrity, modified files, invalid manifests, incomplete backups, and rejection of existing or reserved destinations. The approved documentation core is unchanged.

All three engines now have local rehearsals and an [encrypted container](backup-operations.en-US.md) is available. Production still requires off-server storage, KMS and key custody, retention, scheduling, failed-backup alerts, least privilege, realistic-volume restoration, host-loss simulation, and controlled traffic cutover/rollback. TLS certificates and the application key are not included in data snapshots and require separate recovery. Backups inside a container disappear when it is deleted: this lab demonstrates the mechanism, not durable storage.

Basis: [SQLite VACUUM INTO](https://www.sqlite.org/lang_vacuum.html) and [SQLite integrity checks](https://www.sqlite.org/pragma.html).
