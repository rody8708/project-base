# Safe Backup Operations

[Español (Latinoamérica)](backup-operations.es-419.md) · [Home](README.en-US.md) · [SQLite](recovery.en-US.md) · [PostgreSQL/MySQL](server-recovery.en-US.md)

Technical revision: `1.1.0-draft.1`. Locally verifiable profile; it neither configures production storage nor approves production.

## Required Separation

The native dump or snapshot is the input. `BackupEnvelope` produces an authenticated encrypted file and a manifest without private data. It still has `SEALED_NOT_REPLICATED` status: it is not durable until another adapter confirms copying it to storage independent of the host and verifies it there. The key must live in a secret manager or medium separate from both the backup and repository.

The format splits input into 1 MiB chunks encrypted with AES-256-GCM, using a random nonce and positional context for each chunk, and authenticates the complete sequence and ending with HMAC-SHA-256. Encryption and authentication keys are derived with HKDF-SHA-256 from a random 32-byte binary master key. Before opening, size, SHA-256, structure, and the complete HMAC are checked; every chunk is authenticated again during decryption.

## Local Commands

Use private absolute paths outside the repository and public root. Every destination must be new:

```text
php scripts/backup-envelope.php keygen NEW_KEY_FILE
php scripts/backup-envelope.php seal SOURCE_DUMP NEW_BACKUP.enc NEW_MANIFEST.json KEY_FILE
php scripts/backup-envelope.php verify BACKUP.enc MANIFEST.json KEY_FILE
php scripts/backup-envelope.php open BACKUP.enc MANIFEST.json NEW_RESTORED_DUMP KEY_FILE
```

`open` returns `OPENED_NOT_ACTIVATED`: next apply the SQLite, PostgreSQL, or MySQL procedure to a new destination. It never activates data. Any nonzero exit means failure; quarantine partial output and alert. Error messages do not print paths, keys, or content.

`keygen` supports local evaluation, but production must source its key from a KMS/HSM or secret manager and define rotation, custody, recovery, and dual access. Never copy the key into backup storage. Retain a key while any backup needs it; deleting it first makes that data unrecoverable.

## Scheduling, Alerts, and Retention

The consumer project must wrap this sequence in Windows Task Scheduler, a `systemd` timer, cron, or an equivalent service: create a new dump, seal it, verify locally, copy through its storage adapter, verify the remote copy, record a secret-free receipt, and remove the plaintext dump. Only then mark `REPLICATED_AND_VERIFIED`. Never put a key or password on the command line. Run under a dedicated least-privilege account.

The supervisor must treat every nonzero exit, a missing receipt within the interval, or age beyond the agreed RPO as an alert. Alerts identify engine, environment, time, and stage, never rows, tokens, keys, or passwords. Test the alert channel too; a silently failing job is not monitored.

The foundation does not automatically delete backups. Each project must declare periods by data classification and legal obligations, minimum retention, immutable copies where applicable, and who approves destruction. First generate a plan containing identifiers, dates, and hashes; a separate action must revalidate target and policy immediately before deletion. Retain at least one independently restorable copy and perform periodic restores. RPO/RTO are accepted only after tests with representative volume and networking.

## Verified Scope and Limits

Tests cover binaries larger than one chunk, a null byte, tampering, truncation, wrong key, modified manifest, and refusal of existing destinations. Processing is incremental by chunk; it does not load the whole backup into memory. Manifest SHA-256 detects accidental corruption, while HMAC and GCM require the key for authentication.

No remote provider, KMS/HSM, immutable lock, scheduler, or alert channel is integrated because those are per-project decisions and credentials. Sector-specific compliance has not been evaluated. This container is specific to the starter; other languages may implement the same contract or adopt a maintained standard format, but interoperability must be demonstrated before relying on this format.

Cryptographic basis: [NIST SP 800-38D, GCM](https://csrc.nist.gov/pubs/sp/800/38/d/final) and [RFC 5869, HKDF](https://www.rfc-editor.org/rfc/rfc5869).
