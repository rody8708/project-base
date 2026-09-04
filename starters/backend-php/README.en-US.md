# PHP / Laravel API foundation

[Verified SQLite backup and restore](recovery.en-US.md).

[Native PostgreSQL/MySQL backup and restore](server-recovery.en-US.md).

[Backup encryption and safe operations](backup-operations.en-US.md).

[Isolated Docker lab: PHP 8.5 and HTTPS](docker-local.en-US.md).

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical version: `1.1.0-draft.2`. Status: unapproved technical proposal for evaluation; not a finished product.

[Español (Latinoamérica)](README.es-419.md) · [Architecture and decisions](architecture.en-US.md) · [Verification](verification.en-US.md)

This standalone foundation includes an illustrative task JSON API, SQL persistence, migrations, tests, provisioned tokens, owner authorization, and rate limiting. Replace the task resource according to the consumer's domain. It includes local HTTPS and recovery rehearsals, not production deployment or backup/restoration. Complete human accounts, enterprise multitenancy, and billing are not included. Do not expose it publicly as provided.

## Optional API Connection

The contract and HTTP adapters are implemented. Memory remains the default client mode; descriptions of data loss refer to that mode. See the [integration guide](api-integration.en-US.md) for connection setup and limitations. Production authentication is not included.

## Toolchain and local execution

Original code is distributed under [MPL-2.0](LICENSE), also declared in Composer. Laravel and every dependency retain their own licenses; review and preserve their notices when distributing.

This candidate's profile: PHP `8.5.x`, Composer `2.x`, Laravel `13.30.1`, PHPUnit `12.5.34`, and Mockery `1.6.15`. Transitive dependencies are pinned in [composer.lock](composer.lock); [composer.json](composer.json) stores the template revision in `extra`, because Composer does not accept `draft` as a package version label.

Composer's required extensions and `pdo_sqlite` are needed for the first run. The observed matrix uses PHP `8.5.1` on Windows; it does not establish support for every `8.5.x` release or other operating systems. Installations are project-local: do not use a global Laravel installer or install global services for these steps.

From a newly exported copy of this starter:

```powershell
composer install --no-interaction --prefer-dist
composer validate --strict --no-check-all
composer check-platform-reqs
composer check
composer audit
php scripts/setup-local.php
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8080 --no-reload
```

`--no-check-all` omits Composer's advisory about exact constraints, an intentional template decision; it does not skip platform requirements or audits. Package updates require reviewing advisories, regenerating the lock, and rerunning tests. An audit with no known advisories does not certify the absence of vulnerabilities.

`setup-local.php` exclusively creates a new `.env`, a random key without printing it, and an empty SQLite file. It refuses if `.env` or the database already exists; it neither overwrites nor deletes. It uses `umask(0077)` during POSIX creation and checks writes/synchronization; on Windows review the directory's ACL permissions. If it fails midway, it retains created material for inspection. There is no transaction guarantee across both files.

The built-in server is for development/QA only. Open `http://127.0.0.1:8080/api/health`; stop the process with `Ctrl+C`. That route indicates HTTP process liveness, not database readiness. `.env.example` keeps `APP_DEBUG=false`; it contains no real keys, passwords, or endpoints.

## Illustrative contract

Routes use the `/api/v1` prefix. Writes require `Content-Type: application/json`, a JSON object, and a body no larger than 8192 bytes. Unknown write fields are rejected.

| Operation | Input | Result |
| --- | --- | --- |
| `POST /tasks` | String `title` | `201`, new task, `Location`, and version `1`. |
| `GET /tasks/{id}` | Canonical lowercase ASCII UUID | `200` or `404`. |
| `GET /tasks` | `limit` from 1 to 100, default 20; optional `after` | `200`, UUID-ordered list and `next_after` cursor. |
| `PUT /tasks/{id}` | `title`, JSON boolean `completed`, JSON integer `version` | `200` and incremented version; `409` if the version already changed. |
| `DELETE /tasks/{id}` | JSON object containing integer `version` | `204`; `409` for an outdated version. |

A task serializes only `id`, `title`, `completed`, and `version`. The title is trimmed at its edges and must retain 1–80 Unicode code points; internal controls or line/paragraph separators are rejected. This is not a visual-grapheme limit. Case and accents are preserved; title search and title uniqueness are not implemented.

Noncanonical identifiers reaching the service are rejected before querying SQL. Valid versions extend through `2147483646`; an update requires at most `2147483645`. There is no automatic counter reset. `PUT` replaces the complete editable fields; it is not `PATCH`. The cursor is the last returned ID, not a guarantee that another page exists. Pagination is stable for an unchanged dataset, not a snapshot during concurrent insertions.

Successful responses use `data`; errors use `error.code` and `error.message`, with invalid field names when applicable. Relevant statuses: `400` invalid JSON, `404` not found, `405` method not allowed with `Allow`, `409` version conflict, `413` large body, `415` incorrect content type, `422` invalid contract, `503` SQL error, and `500` unexpected error. Errors do not return SQL, private values, traces, or internal paths.

Every response carries `X-Request-Id`. A caller-supplied canonical UUID is preserved; any absent or malformed value is replaced. Server failures produce a structured operational entry with that identifier, method, route template, status, and exception type, without request bodies, tokens, exception messages, or traces. Configure retention and access in the consumer product. These operational records are not a business audit trail.

Translations are separate in [es-419](lang/es-419/api.php) and [en-US](lang/en-US/api.php). Selection uses `Accept-Language` (`es-419`/`es` or `en-US`/`en`, considering positive quality); other preferences use `en-US`. Responses include `Content-Language` and `Vary: Accept-Language`. Machine codes are not translated.

## Database profiles

SQLite is the default local profile. MySQL and PostgreSQL require explicit host, port, database, username, and password in a private environment; no connection URL is inherited and the engine never changes silently.

- `mysql`: this candidate permits only `127.0.0.1`, `localhost`, or `::1`; enabling a remote host requires implementing and verifying appropriate TLS/authentication. It is not a remote production configuration.
- `pgsql`: the default TLS mode is `verify-full`; `DB_SSLROOTCERT` can specify an appropriate root certificate. Isolated QA uses `DB_SSLMODE=disable` only against its disposable loopback instance. Do not copy that exception to a remote connection.
- `sqlite`: uses `database/database.sqlite`, enables foreign keys, and sets a 5000 ms busy timeout; it is not configured as a network service.

Actually tested versions and limitations are in [verification](verification.en-US.md). SQLite tests do not establish MySQL/PostgreSQL compatibility. Do not select the database engine based on the client device: a web, Flutter, or Kotlin app can consume the same API.

## Isolated tests and export

`composer check` checks source syntax and runs PHPUnit against its own temporary SQLite file. It ignores `.env` connections, isolates configuration caches, and removes only its identified temporary files. The suite tests the example's contracts and SQL operations, not comprehensive Laravel coverage.

The additional matrix requires Windows, WSL `Ubuntu-24.04`, a working local Docker installation, and all three PDO drivers; it does not install WSL/Docker. If `pdo_pgsql` is already loaded, omit `-d` to avoid loading it twice:

```powershell
php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker
```

That command downloads official images pinned by version/digest, checks Windows/WSL port availability, and creates its own PostgreSQL/MySQL containers on `127.0.0.1:15432` and `127.0.0.1:13306`. It uses tmpfs, read-only container roots, restricted capabilities, and resource limits; it neither mounts host directories nor uses `--privileged`. Synthetic credentials travel through stdin, never through arguments/output or exportable files. Local reports are retained under `.validation/`; on completion, names and labels are verified before removing only those containers and their ephemeral data. Downloaded images remain cached. The user's instance on `3306` is not used.

Do not export `vendor`, `.env`, local databases, caches, logs, `.validation`, or keys. Retain both languages, source, tests, migrations, `composer.lock`, and `.env.example`. The project's exporter adds approved documentary release `1.0.0` under `foundation/`; its receipt keeps consumer adoption pending and the technical template unapproved. Documentary approval does not automatically validate this API.
