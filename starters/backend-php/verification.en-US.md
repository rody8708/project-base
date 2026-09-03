# Observed PHP API foundation verification

Technical version: `1.1.0-draft.1`. Status: unapproved technical proposal; this record is execution evidence, not product approval.

[Español (Latinoamérica)](verification.es-419.md) · [Starter home](README.en-US.md) · [Architecture](architecture.en-US.md)

## Recorded execution

The final matrix ran from `2026-09-03T01:59:05Z` to `2026-09-03T01:59:50Z` (September 2 in the local America/New_York time zone). PHP `8.5.1` NTS x64 client on Windows, Composer `2.9.5`, Laravel `13.30.1`, PHPUnit `12.5.34`, Mockery `1.6.15`. PostgreSQL/MySQL ran as Linux servers in containers on local Docker `29.1.3` within WSL `Ubuntu-24.04`.

| Check | Observed result |
| --- | --- |
| `composer validate --strict --no-check-all` | Valid manifest and lock; no error output. |
| `composer check-platform-reqs` | Installed package requirements satisfied. |
| `composer check` | Syntax of 37 PHP files; 51 tests, 186 assertions with SQLite. |
| `composer audit --format=json` | `advisories: []`, `abandoned: []` at query time. |
| SQLite `3.49.2` matrix | 51 tests, 186 assertions; no warnings. |
| PostgreSQL `18.6` matrix | The same suite: 51 tests, 186 assertions; no warnings. |
| MySQL `8.4.11` matrix | The same suite: 51 tests, 186 assertions; no warnings. |
| Real HTTP, local server and SQLite | 9 scenarios completed; process stopped and synthetic rows removed. |

The three runs repeat one suite, not 153 distinct cases. Some tests cover the domain or helpers and do not use SQL. Persistence and API tests do run against the indicated engine, not an in-memory substitute.

The real HTTP scenarios were process liveness (`200`), creation (`201`), retrieval (`200`), update (`200`, version `2`), outdated deletion (`409`), current deletion (`204`), missing resource in Spanish (`404`), malformed JSON (`400`), and unsupported method (`405`, `Allow: GET, HEAD`). They used only `127.0.0.1:18080`; they do not test HTTPS or a production server. Repeatable HTTP contract automation resides in [ApiTest.php](tests/Feature/ApiTest.php); the nine additional scenarios ran through a local client over TCP.

## Identity and isolation

Final local receipt identifier: `10eac014a09550ea`. The helper retains the report and each engine's output under `.validation/`, excluded from exports. This portable summary retains lock, receipt, and image identity without secrets or personal paths.

```text
composer.lock SHA-256
2815933939c353ee7c6c5154f89eece6101bd1aa6a329c4eb4a778b565d92656
report.json SHA-256
91da1ca70efab4ff8a4143ca6cc5921c18a7a003bc3a07e6fbae39fc54bb2284
postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af
mysql:8.4.11@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
```

Tags came from the official image catalogs for [PostgreSQL](https://github.com/docker-library/official-images/blob/master/library/postgres) and [MySQL](https://github.com/docker-library/official-images/blob/master/library/mysql); the digests above pin the images actually used. `latest` was not used.

Ports `15432` and `13306` were checked for availability in Windows/WSL before creating new instances. Databases and passwords were synthetic; server data used tmpfs without mounting host folders. The report confirmed removal of `foundation-php-pgsql-10eac014a09550ea` and `foundation-php-mysql-10eac014a09550ea`; a subsequent query by their label returned no containers. The user's instance on `3306` was neither queried nor modified. Downloaded images remain in Docker's cache.

The matrix enabled `pdo_pgsql` per process only. PostgreSQL used `sslmode=disable` solely for this disposable loopback QA. The candidate's default remains `verify-full`; that configuration is not an actual remote certificate/TLS test.

## What the suite checks

- Unicode title limits, value immutability, canonical UUIDs and versions; rejection of invalid types, extra fields, oversized bodies, invalid JSON, controls, and line/paragraph separators.
- CRUD, cursor and pagination limits, languages and stable codes, the `Allow` header, and error responses without SQL or private details.
- Persistence across reconnection, SQL parameters, unique primary key, `NOT NULL`, transaction rollback, the two-migration transition, and defaults on an earlier row.
- Version-conditional updates/deletions and sequentially interleaved stale writes. This is not a load test or an actual distributed-concurrency test.
- Explicit server configuration and rejection of the not-yet-enabled remote MySQL profile, without connecting to that host.
- Exclusive local setup, preservation of preexisting files, and no key on stdout. POSIX creation permissions are not verified on Windows.
- Pure runner guards: failed inspection, foreign label, or foreign name prevents removal; PHP stderr or a nonzero exit code prevents success. Extension selection avoids loading it twice. These cases do not simulate a real daemon outage.

## Corrections and limits

Earlier runs detected unwanted normalization of `es-419`, the difference between JSON objects and arrays, and an open SQLite connection during cleanup of a test changing the default engine. These were corrected and the suite repeated. Review also strengthened canonical UUIDs across engines, preservation of `Allow`, local permissions, and fail-closed helper behavior. Earlier runs with warnings were not used as the final clean result.

This record does not verify every PHP, operating-system, or SQL-version combination; native PostgreSQL/MySQL on Windows; remote TLS; authentication/authorization; backup restoration; observability; data volume, performance, or client accessibility; deployment or comprehensive security. The `503` error tests include controlled SQL-exception injection; actual server-outage recovery is not claimed. There is no measured coverage percentage or guarantee that any future query will be portable.

Repeat the [README](README.en-US.md) commands in the consumer copy after reviewing its environment. Current results justify evaluating this candidate under the described contract and versions; they do not select an engine, license, or production configuration for the consumer.
