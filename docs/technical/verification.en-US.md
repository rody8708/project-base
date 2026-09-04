# Executable Base Verification

**Updated status:** token, permission, and ownership boundaries are implemented; see [security and production readiness](security-production.en-US.md). Earlier tests and limitations are historical: the API no longer accepts anonymous access. Production approval remains pending.

Technical revision: `1.1.0-draft.1`  
Initial evidence: `2026-09-02`; native web extension and API-boundary decision: `2026-09-03`, America/New_York time zone  
Status: local technical evidence; not production approval or new documentary approval.  
[Español (Latinoamérica)](verification.es-419.md) · [Home](../../README.en-US.md) · [Decisions](technology-choices.en-US.md)

## HTTP Integration Extension

The [executable integration](api-integration.en-US.md) adds a shared contract, adapters for all four clients, and tests against a real backend. The following sections preserve preintegration evidence: their counts and copy hashes are historical, not inventories of current source.

## Evidence Scope

Tests apply to these examples and tools, not to future products. Domain/component tests, real execution, compilation, and independent-copy operation are distinguished. Repeating a test does not make it a new test case. The September 3 extension adds `web-vanilla` and repeats maintenance checks; it does not present earlier React, Flutter, Kotlin, or PHP tests as new executions.

| Base or check | Recorded result |
| --- | --- |
| Web | Locked installation, strict types, 41 tests, build, and npm audit with no reported advisories. |
| Web in a real browser | Successful interactive flow in Edge 151 against the local build and an external copy. |
| Framework-free web | HTML/CSS/JavaScript without a build or third-party npm dependencies; 74 passing tests and a successful real Edge 151 flow. |
| Shared Flutter code | Successful preflight, formatting of 16 files without changes, analysis, and 27 tests. |
| Flutter Windows x64 | Release compilation, one native integration flow, and portable-package startup/shutdown check. |
| Flutter Android | Normal debug APK and one integration flow on an API 35/x86_64 emulator after pinning AGP and the application lock. |
| Kotlin Android | 21 JVM tests, three instrumented flows on Android API 35, clean lint, and generated debug APK. |
| PHP with SQLite/PostgreSQL/MySQL | Final matrix: 51 tests and 186 assertions per engine, with no failures or warnings. Real HTTP also checked from an external copy. |
| Maintenance tools | 44 tests on September 3: six document-checker tests and 38 exporter tests, with no failures or skips. The initial record had 37. |
| CI | YAML parsed and reviewed; not executed on GitHub. |

Details, sources, versions, and limitations appear in the [web](../../starters/web/docs/verification.en-US.md), [framework-free web](../../starters/web-vanilla/docs/verification.en-US.md), [Flutter](../../starters/flutter/docs/verification.en-US.md), [Kotlin](../../starters/kotlin-android/docs/verification.en-US.md), and [PHP](../../starters/backend-php/verification.en-US.md) records.

## Browser and Independent Copies

For the React base in the initial record, Playwright CLI used a dedicated headless Edge session. Checks covered the empty list, invalid and 81-code-point titles, adding by button and Enter, completing/reopening, changing language while preserving tasks, displaying HTML-like text literally, and losing memory on full page reload. Observed content widths matched the 320- and 390-pixel viewports; desktop and mobile screenshots were inspected. This does not certify complete accessibility or all browsers.

A missing favicon request was found and corrected. The new session against the exported copy recorded zero console errors/warnings and eight local static requests with status 200, including the reload. Local screenshots and snapshots are under `output/playwright/technical-web`; they are auxiliary evidence, not template dependencies. QA servers and browser sessions were closed.

The exporter created copies in new destinations outside this foundation, without moving or overwriting existing projects:

| Copy | Commands and result |
| --- | --- |
| Web | `npm ci` and `npm run check`: PASS. Final copy repeated with `npx --yes npm@11.17.0 ci` and `npx --yes npm@11.17.0 run check`: PASS, 41 tests and build. |
| Framework-free web, September 3 | `npm ci --ignore-scripts` and `npm run check`: PASS, 74 tests, 15 JavaScript files, and 52 keys per locale. Real Edge flow with the source server stopped: PASS; no build step. |
| Flutter | `dart tool/check_toolchain.dart`, `flutter pub get --enforce-lockfile`, `flutter analyze`, `flutter test`, `flutter build windows --release`, `flutter build apk --debug`: PASS from an external copy. |
| Kotlin | Strict wrapper with `:core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug`: PASS, 21 tests and APK from the final copy. |
| PHP | Locked Composer installation without plugins/scripts, strict validation, platform requirements, syntax of 37 files, 51 tests/186 assertions, and audit: PASS. Local setup, two migrations, and nine real HTTP scenarios: PASS. |

An initial Flutter copy under the Windows temporary directory compiled, but MSBuild warned about incremental builds under Temp. Checks were repeated in a new external destination outside Temp: Windows Release and Android debug compiled without that warning. Notices about newer Flutter package versions were not hidden or addressed through an automatic upgrade.

Kotlin was first checked with a fresh Gradle cache. Subsequent review corrected a confirmed write that could become hidden if the following read failed; two regressions cover adding and toggling. A new export then repeated the 21 tests, lint, and build from the final copy, reusing only that external dependency cache without importing source from the master foundation. The three instrumented flows were repeated against the corrected source; the owned emulator was closed.

The PHP copy created its own configuration and SQLite database without copying source data or keys. The HTTP exercise covered health, empty list, Spanish validation, creation, update, version conflict, `405` with `Allow`, deletion, and Spanish `404`. Synthetic rows were removed and the owned server was stopped. The local helper under `output/verification` is auxiliary evidence, not a template dependency. Evaluation copies and their local caches are retained for inspection.

Known final-copy source inventories:

| Template | Source files | Inventory SHA-256 |
| --- | ---: | --- |
| Web | 27 | `d32808f89e0675a1da6254da407d69566444f6e7d8d9862aec2aaae52f9a25b9` |
| Framework-free web | 29 | `0e85f0d60bd267830e8566419b96e9f7d71af68c7a44fae06103bf158abb1469` |
| Flutter | 148 | `b3ff67ae2fffa3a601bdba49418348459ee1fc22c4652bb39ead6b8e445cf808` |
| Kotlin Android | 37 | `31e6bbafd775ae7e90e7816742c65053e425d1c3f0beb5ddc725b98d2ada95db` |
| PHP | 54 | `6c12e2c114861c61ce77d0a86ebc83662c87b1059f77dc695a5d7af33c51dc9f` |

These values come from `foundation/adoption.json`. They identify included source and its hashes, not a digital signature or reproducible binaries. Export includes five additional provenance files. Its receipt retains the initial preparation state; subsequent tests do not silently change consumer adoption.

## September 3 Native Web Extension

The new `web-vanilla` template uses HTML, CSS, and ES modules without React, TypeScript, Vite, third-party npm packages, or a build step. `npm ci --ignore-scripts` and `npm run check` ran with Node `24.16.0` and npm `11.17.0` on Windows: PASS. The check inspected 15 JavaScript files and 52 keys per locale; 74 cases passed: 18 domain/service/repository, 14 controller/locales, 32 server/CLI, and 10 source-checker tests. None failed, were canceled, or were skipped.

Playwright CLI drove dedicated Edge headless 151 sessions. Observations covered an empty list, empty and 81-code-point validation, acceptance of 80, adding by button/Enter, completing and reopening with Space while retaining focus, literal HTML text without injected nodes, es-419/en-US changes without altering tasks or drafts, list reload retaining data, and full page reload discarding it. Desktop `1280 × 900` and mobile `390 × 844` screenshots were inspected; content also did not overflow horizontally at `320 × 800`. A session with JavaScript disabled retained the content and displayed the `noscript` notice with inactive controls. This is not a complete accessibility audit or browser matrix.

The source session recorded 22 local static requests with status `200` across two loads and zero console errors/warnings. The server was restarted after code corrections because it serves a startup snapshot. Screenshots and snapshots remain under `output/playwright/web-vanilla`, separate from the template. Dependency failures, malformed results, and render callbacks have automated tests; not all of those failures were simulated in the browser.

Final review added regressions for IDs containing line terminators and sparse arrays, which are now rejected, and for render failures before/after a write. Then 29 source files and five provenance files were exported to a new external directory with npm name `foundation-vanilla-check`. Its lock SHA-256 is `a7a9f6b22d087e592734098bcd3195a9d7f68b1c9b86d331cadf9a6d7b176321`; only npm identity differs from the source lock. The copy passed installation and all 74 tests without importing files from this foundation.

With the source server stopped, the copy started at `127.0.0.1:5181` in a new Edge session. Checks repeated empty validation, adding by button/Enter, completing/reopening with focus, language changes retaining two tasks and a draft, literal text, list reload, and data loss on page reload. Desktop/mobile screenshots and absence of overflow at 320 and 390 pixels were inspected. All 22 requests across two loads were local and returned `200`; the console had zero errors/warnings. Both owned servers and all three browser sessions were closed; copies and screenshots remain for inspection. Three initial synthetic fixtures remained in Temp after manual cleanup was rejected; they have no active processes. Corrected test runs clean up their own fixtures.

## Backend and Data

The matrix used PHP `8.5.1`, SQLite `3.49.2`, PostgreSQL `18.6`, and MySQL `8.4.11`. Both servers were owned test containers with official digest-pinned images, loopback ports `15432` and `13306`, disposable data, and synthetic credentials. The user's MySQL instance on `3306` was not used.

Checks covered HTTP/validation, persistence after reconnection, Unicode and SQL-like text, constraints, commit/rollback, migration with existing data, and rejection of outdated versions. This is not a concurrent load test, backup/restore test, or proof of compatibility for every future query, collation, type, or extension. Test configuration rejects destinations not expressly identified as isolated.

The final matrix identified as `10eac014a09550ea` repeated the same 51-case suite across all three engines; some cases test domain/helpers rather than SQL. SQLite connection cleanup, duplicate PHP extension loading, and stderr handling were corrected. When container ownership or cleanup cannot be confirmed, the helper now reports failure without deleting an unverified target. Eight unit cases cover those decisions; no actual Docker outage was induced.

Those execution containers were removed after checking their identities and their tmpfs data was discarded; it was not user data. Downloaded images remain in the local cache. Detailed results and mechanisms for repeating the matrix appear in the PHP record.

## API-Boundary Decision

The [API boundary between clients and backend](api-boundary.en-US.md) was documented as the adopted direction for projects with a remote backend. Review checked that it separates the public contract from internal implementations, prohibits direct client access to persistence, and enumerates the implementation gate. This is documentary evidence, not connection evidence: at that time there was no shared OpenAPI contract, client HTTP adapters, or end-to-end testing between the starters.

## Independent Persistence and New Local Run

The [language- and framework-independent persistence decision](persistence-boundary.en-US.md) was added. Inspection confirmed that `TaskService` consumes `TaskRepository` and the SQL adapter centralizes engine access; starter code was not modified and no additional custom backend was built.

`php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker` was repeated from `2026-09-03T18:35:34Z` to `2026-09-03T18:36:19Z`: PASS. Local report `starters/backend-php/.validation/5ffcc7687240e5c5/report.json` records PHP `8.5.1` on Windows and Docker `29.1.3` in WSL. SQLite `3.49.2`, PostgreSQL `18.6`, and MySQL `8.4.11` passed the same suite of 51 tests and 186 assertions per engine, without warnings. This includes API checks through Laravel's test client and real persistence; it is not a frontend connection or a new network HTTP exercise.

Removal of both owned containers and their ephemeral data was confirmed; user databases were not touched. Reports and cached images were retained. Cross-engine data transfer, concurrent load, and actual outage recovery were not exercised; the new run retains those limitations.

## Python/FastAPI Backend Candidate

On September 4, 2026, template `1.2.0-draft.1` was run on Windows with Python `3.13.6` and uv `0.12.4`. `uv sync --locked --all-extras`, Ruff, strict mypy, and 15 pytest tests completed successfully. Tests use temporary SQLite files and cover migration/rollback, authentication, revocation, permissions, owner isolation, CRUD, version conflicts, pagination, and safe HTTP errors.

A fresh `api-only` solution was also exported through the assistant. Its root `doctor`, `setup`, and `check` commands completed successfully, Uvicorn returned `200` with `{"status":"ok","scope":"liveness"}` on loopback, and its temporary directory was removed afterward. This evidence does not cover PostgreSQL, MySQL, TLS, load, backup/restore, or a real deployment; those points remain pending for the product adopting this candidate.

The first CI run found an unsupported `cache: false` option on `setup-python`; it was removed instead of suppressing the failure. The same run warned that the historical Composer `2.9.5` pin was vulnerable to GitHub Actions token disclosure in logs; the CI profile was raised to fixed version `2.9.8`. This update does not rewrite historical evidence previously produced with `2.9.5`.

## Python Matrix Expansion — September 4, 2026

Change based on `0192d46` (PR #25), branch `test/python-database-matrix`. Windows, Python `3.13.6`, uv `0.12.4`, Docker in WSL `Ubuntu-24.04`; PostgreSQL `18.6-bookworm` and MySQL `8.4.11`. From `starters/backend-python`, `uv run pytest -W error --tb=short --live-http` was run, then repeated with `--database-engine=postgresql --docker-wsl=Ubuntu-24.04` and `--database-engine=mysql --docker-wsl=Ubuntu-24.04`: **18 tests passed per engine**. Ruff and strict mypy also passed.

The first MySQL trial failed because driver RSA support was missing; the locked `pymysql[rsa]` extra was added. Next, regression `test_owner_isolation[USER-1]` demonstrated unauthorized access to the `user-1` listing due to MySQL's case-insensitive text comparison. Binary comparison inside the adapter corrected the cause without changing the contract or schema. The same regression now checks an empty listing, foreign GET/PUT/DELETE returning 404, and preservation of the original record. Reader permissions (403), expired tokens (401), CRUD, conflicts, revocation, and migration/rollback/reapplication were also verified. Explicit permission and expiry coverage is added in this expansion; the previous record's 15 tests had not demonstrated it.

HTTP flows use Uvicorn on ephemeral ports and verify responses and persisted state with synthetic data. They do not read `.env` or accept existing databases. No containers labeled `project-base=python-test` remained; ephemeral data was removed and cached images retained. CI adds the same three-engine matrix. TLS, concurrent load, backup/restore, and production approval **remain pending for Python**; PHP evidence does not replace those trials.

## Documentary Integrity and Limits

### Node Expansion for 1.2.0

The Node lab exercises HTTPS trust/hostname verification, expired/untrusted certificate rejection, negative API cases, concurrent writes, and limits shared by two servers. On Windows with Node 24.16.0, SQLite 3.53.0, and Docker/WSL, SQLite, PostgreSQL 18.6, and MySQL 8.4.11 passed native backup/restore and HTTPS use of the target; schema, Unicode, versions, and revocation of every restored token were verified. The [Node lab](../../starters/backend-node/operations-lab.en-US.md) retains commands, isolation, and limits.

Nine fast Node tests, 73 maintenance tests, documentation/architecture checks, and React/native-web cross-integration passed. An api-only solution exported outside the repository passed doctor/setup/check and server startup. Its temporary files are synthetic; no user configuration or databases were used. Lab containers were removed; downloaded images and dependencies remain cached. Proposed release 1.2.0 still requires preservation, recovery, and exact approval; this evidence approves neither production nor Apple platforms.

### Python Operations Trials After PR #27

Update after `bf225bf`: the lab reproduced a timeout inside `commit` and two controlled blocking cases. WAL with `FULL`, a fixed SQLite minimum, and persistence execution outside the HTTP event loop were implemented. Managed Python 3.13.15/SQLite 3.53.1, 31 tests per engine, and 100 fragmented recoveries passed. Evidence and the distinction between corrected blocking and the untraced historical episode are in the lab's “Correction of Reproduced Blocking” section; the following paragraphs retain the earlier historical status.

The [Python operations lab](../../starters/backend-python/operations-lab.en-US.md) records commands, environment, cleanup, and limits for HTTPS, concurrency, and native backup/restore. Based on `60176b3`, branch `test/python-operational-lab` passed 25 tests per engine (SQLite/PostgreSQL/MySQL), Ruff, and mypy. The counter regression reproduced 12 admissions with a maximum of five; atomic conditional updating corrected it. Intermittent finding `PY-LAB-001` remains open and documented without changing the timeout. No production approval is claimed and earlier historical evidence is unchanged.

Before integrating this expansion, GitHub alert `GHSA-6w46-j5rx-g56g` identified vulnerable temporary-directory handling in pytest. Its pin and lockfile were updated from `8.4.1` to fixed version `9.0.3`, and the 18 tests per engine, Ruff, and mypy were repeated. No vulnerability exploit was attempted or claimed to have been reproduced locally; the update follows the provider advisory. The final revision and CI results for this change are associated with PR #27.

The historically approved ZIP retains SHA-256 `9ecfbba67604bf27dcfd4812a592f7b5066aba7b1ac58bcb58dbe6c20685fd1a`. Both receipts and its historical JSON were also checked against the exporter's four pins. None of those artifacts were rewritten.

For the pre-HTTP-integration tree, `npm ci --ignore-scripts`, `npm test`, and `npm run check` completed: PASS; 44 tests and 76 documents in 38 pairs, with 656 local links checked. Before the API-boundary decision was added, the tree had 72 documents/36 pairs and 628 links; the initial record before the native web extension had 37 tests, 66 documents/33 pairs, and 582 links. The last check verifies Markdown pairs, local links, titles, and the ZIP hash; it does not interpret every Markdown construct or certify translation equivalence. Cross-language content review complements that check. On September 3, source/copy hashes across all five inventories and the four approved artifacts in each copy were compared: PASS; the four earlier templates remained unchanged.

macOS, iOS, and Linux have generated Flutter host projects but still lack verified native builds/execution. WSL checks found no Flutter, clang, CMake, Ninja, or GTK development setup; a global toolchain was not installed to imply coverage. iOS/macOS require a suitable Apple environment. Physical-device testing, production signing, publication, exhaustive security, and production operation of clients connected to the API are also not claimed.

This paragraph records inspection before the repository was published: CI was manual-only, no remote existed, and no jobs had run. Since publication, the YAML automatically runs web/maintenance, portable Flutter, Kotlin Android, PHP/SQLite, and Python with SQLite/PostgreSQL/MySQL on pull requests; the expanded Flutter matrix remains manual. Current results belong to each GitHub run and do not rewrite this section's historical evidence.
