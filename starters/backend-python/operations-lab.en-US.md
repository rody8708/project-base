# Python Operations Lab

[Español latinoamericano](operations-lab.es-419.md) · [Start](README.en-US.md)

## Run the Complete Trial

From this starter, with Python 3.13, uv, and Docker:

```powershell
uv sync --locked --all-extras
uv run ruff check .
uv run mypy
uv run pytest -W error --tb=short --live-https
uv run pytest -W error --tb=short --live-https --database-engine=postgresql --docker-wsl=Ubuntu-24.04
uv run pytest -W error --tb=short --live-https --database-engine=mysql --docker-wsl=Ubuntu-24.04
```

Omit `--docker-wsl` when Docker is directly available. Do not supply an existing database: the lab only creates owned resources with synthetic data. `--live-https` replaces HTTP with HTTPS for API flows; dedicated TLS and recovery tests always use HTTPS. CI runs all three engines with this profile.

## What Is Verified

- **TLS:** an ephemeral CA signs a local server certificate. The client validates its chain and hostname without disabling verification. TLS 1.2 or 1.3 is required, and untrusted CA, wrong hostname, and expired certificate rejection are checked. No system trust store is modified.
- **Concurrency:** 24 simultaneous creates retain unique identifiers; of 12 updates against one version, one wins and 11 receive 409. A burst of 144 requests in a test-fixed time window admits 120 and rejects 24 with 429. Twelve simultaneous SQL connections check a limit of five for both new and existing counters.
- **Recovery:** SQLite uses its native backup API; PostgreSQL uses `pg_dump`/`psql`; MySQL uses `mysqldump`/`mysql`. The target is another empty database. Migrations and tokens are compared, a Unicode task and its version are checked, and post-snapshot data must not appear in the target. Recovered tokens are invalidated and a fresh synthetic token is issued before enabling the restored API. HTTPS confirms reads, updates, and rejection of the old token. The source database remains intact.

The concurrency correction lives exclusively in infrastructure: dialect-specific idempotent insertion and atomic conditional update within the unit of work. It changes neither the API contract nor the schema. A product adopting the adapter must keep both operations in the same transaction.

## Safety and Cleanup

Certificates and keys are temporary; the CA key stays in memory. Server certificates, keys, and SQLite databases are removed afterward. Containers have owned random names, loopback ports, and temporary in-memory storage without user mounts. PostgreSQL/MySQL dumps remain in process memory and are never printed. Downloaded images and tool caches are retained. Tests do not read `.env` or use real databases or credentials. These are not production backup commands.

## Evidence and Limits

### Repeatable PY-LAB-001 Diagnosis

```powershell
uv run pytest tests/integration/test_recovery.py --recovery-repeat=40 --recovery-diagnostics -s --tb=short
```

`--recovery-repeat` accepts 1 through 100 and creates isolated resources per iteration. Omit `--recovery-diagnostics` to compare without instrumentation. The HTTP timeout remains five seconds. Optional instrumentation records SQL durations, client connect/send/receive stages, and server HTTP progress; it retains at most 80 events. Network failures capture stack function/file names and line numbers before server shutdown, never local variables. SQL text, parameters, headers, bodies, and exception text are not recorded. `-s` also displays successful summaries; CI retains failure diagnostics and repeats three recoveries per engine.

September 4, 2026 investigation based on `bf225bf`, branch `diagnose/python-recovery-timeout`, same Windows/Python 3.13.6 environment: **340 SQLite recovery flows passed** in the campaign (40 isolated instrumented runs; four simultaneous processes of 40 with independent databases; 100 without instrumentation; 40 within the full suite). The last execution passed 66 tests. The timeout did not recur. The first 200 measurements placed the entire flow at approximately 0.54–0.81 seconds and the largest observed query at about 28.5 ms; these are not performance guarantees. Tests were added for bounded events, omission of sensitive values, and disabled diagnostics.

**PY-LAB-001 remains open: cause undetermined.** There is no evidence attributing the historical episode to SQLite, TLS, the server, or the host. No production code was changed and no correction is claimed. On recurrence, compare the last client stage with `body.wait`, `sql.begin`/`sql.end`, and response stages before selecting a correction.

Final local result: **25 tests passed per engine**, with Ruff and mypy passing. Removal of owned containers, SQLite files, and temporary TLS material was checked; cached images remain. Root checks passed 71 tests and documentation/architecture validation.

Open finding `PY-LAB-001`: one SQLite run raised a five-second `ReadTimeout` when updating over HTTPS after restore. It did not recur in the next full suite or four isolated trials with the same timeout; the limit was not increased and the check was not skipped. Cause undetermined: do not label it resolved or promise latency based on this evidence. If it recurs, retain sanitized server/client traces before attempting a correction.

On September 4, 2026, based on `60176b3` on branch `test/python-operational-lab`, Windows with Python 3.13.6, uv 0.12.4, and Docker in Ubuntu-24.04 WSL ran this profile with SQLite, PostgreSQL 18.6, and MySQL 8.4.11. The initial counter regression admitted 12 operations with a maximum of five: a reproduced failure. Atomic updating corrected the cause. The first test CA lacked extensions required by strict validation; the certificate was corrected without relaxing TLS.

These are bounded trials, not a benchmark, sustained load test, disaster recovery exercise, or production approval. They establish no latency target, maximum capacity, RPO/RTO, or multiworker performance. The product remains responsible for real domains and certificates, deployment proxy/TLS, renewal, backup encryption and off-host storage, retention, point-in-time recovery, realistic data volumes, monitoring, and alerts. Switching engines with existing data requires a dedicated data migration; this trial restores within the same engine.
