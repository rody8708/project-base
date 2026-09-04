# Pre-Stability Technical Review

[Español (Latinoamérica)](stability-review.es-419.md) · [Stable status](stability-status.en-US.md) · [Home](../../README.en-US.md)

Date: `2026-09-03`. Revision: `1.1.0-draft.1`. Result: `TECHNICAL_SCOPE_PASS_WITH_DECLARED_EXCEPTIONS`. MPL-2.0 was adopted after this review; the result assigns neither a stable version nor production approval.

> Historical 1.1.0 record. The [current status](stability-status.en-US.md) and later labs supersede its outstanding items, not its historical results.

## Corrected Findings

The review added a neutral backend architecture and an application-framework-free TypeScript/Node API. Cross-tests detected and corrected an incompatible token format, incorrect `next_after` semantics, missing CORS, non-strict UTF-8, isolated Unicode surrogates, duplicate parameters, and `Accept-Language` priority. The local limiter now persists in SQLite. Node remains a candidate profile: it does not inherit PHP's PostgreSQL/MySQL, recovery, HTTPS, or production evidence.

Current claims of five templates and missing authentication were also corrected. Old figures remain only where they identify historical evidence, with a note separating them from the current catalog.

## Current Executions

| Area | Result |
| --- | --- |
| Repository | 47 maintenance tests; 116 documents, 58 bilingual pairs, and 892 links before this record; identical OpenAPI contract in six starters. |
| React | 44 tests, type checks, and Vite build passed. |
| Native web | 85 tests and source checks passed. |
| PHP | Composer/platform requirements passed; 81 tests, 339 assertions, and 66 valid PHP files. |
| Node | Clean install with no known vulnerabilities reported by npm; build and five test groups passed. React and native web consumed its real API with authentication, CRUD, conflict, and CORS. |
| Flutter | Analysis had no findings, 30 tests passed, one opt-in HTTP test was skipped because its fixture was not enabled, and the Windows debug build passed. |
| Kotlin/Android | Gradle `check` and `assembleDebug` passed using Android Studio's JDK and the installed SDK; a physical-device trial was not repeated. |
| Integrated PHP | Isolated HTTP API passed CRUD, permissions, isolation, revocation, CORS, conflicts, and the production gate. |

## Real Exports

Six new destinations were created under `C:\Users\rodyc\AppData\Local\Temp\foundation-six-export-fad7ca1f3ad14e2caca7146b593d9945`. Each export checked bytes while copying and added a receipt. Inventory SHA-256 values: `web edc03b8e…a52a`, `web-vanilla ab6502a2…d424`, `flutter da164aac…cf9d`, `kotlin-android 928ec0b5…8d31`, `backend-php 7a15c8b8…189d`, and `backend-node 1ec8cb54…10ec`. Full hashes remain in each trial's `foundation/adoption.json`.

React, native web, PHP, and Node installation/verification were repeated from their copies, as were Flutter analysis/tests/Windows build and Kotlin `check`/debug APK. Destinations were retained for inspection; they contain generated dependencies and outputs, not real secrets.

After adopting MPL-2.0, a second set was generated under `C:\Users\rodyc\AppData\Local\Temp\foundation-mpl-export-a24d88a7543449ecbbbe55e661bfb9bc`. All six exports include `LICENSE` with SHA-256 `3f3d9e0024b1921b067d6f7f88deb4a60cbe7a78e76c64e3f1d7fc3b779b9d04`. New complete inventories: `web 3d81c60ba4c3f75a8c8a622337dfe53be2665832a21e62503be977c02b7c9514`, `web-vanilla 2acee181a22fc650f11b955ba3496d28493bf6af8320920159acbc4028e60be6`, `flutter 1caa2ee0d4189746a2684889638bbd4d71f977e1672ac2fac0affce81880aba5`, `kotlin-android a024a1afc0f066e0d1d993dc4e6c55c3df118923b5b87fc6a1261a66b8fa2f22`, `backend-php de020955aebe9f3981316b8633f23e8ece170d131028b90fa93b81be58c3c10f`, and `backend-node e7053d38b41edd8f27277c068d7131a3dd8da8a3cade2413034344e7b59cdc50`. These identify the pre-freeze exports; the [1.1.0 receipt](../../releases/approval-1.1.0.en-US.md) identifies the complete stable package.

## Exceptions and Closure

macOS/iOS did not run because no Mac is available. This is nonblocking for publishing verified targets, but those destinations must remain marked `unverified`. Linux desktop and physical-device support are not inferred from these runs either.

Per-product services—cloud, KMS, remote storage, alerts, accounts, and RPO/RTO targets—are consumer adoption and do not block this foundation. MPL-2.0 is incorporated. The exact package, its hash, version `1.1.0`, and explicit owner approval are now recorded. GitHub and branch protection are configured afterward over that frozen content.
