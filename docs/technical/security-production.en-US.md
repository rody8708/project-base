# API Security and Production Readiness

[Verified SQLite backup and restore](../../starters/backend-php/recovery.en-US.md).

[Locally verified native PostgreSQL/MySQL recovery](../../starters/backend-php/server-recovery.en-US.md).

[Backup encryption and safe operations](../../starters/backend-php/backup-operations.en-US.md).

[Isolated Docker lab: PHP 8.5 and HTTPS](../../starters/backend-php/docker-local.en-US.md).

Technical revision: `1.1.0-draft.1`. Contract: `1.0.0-draft.2`. Local evaluation: `2026-09-03`. Not approved for production.

[Español (Latinoamérica)](security-production.es-419.md) · [Home](../../README.en-US.md) · [API integration](api-integration.en-US.md)

## Implemented Scope

The API requires random opaque bearer tokens (256 bits), expiration, and revocation. Only a SHA-256 hash is stored. A trusted operator provisions each identity; there is no public registration, shared password, embedded application token, or anonymous fallback.

This is a provisioned API access profile. It is not a complete human account system: a login screen, passwords, recovery, MFA, OAuth consent, and refresh tokens are not implemented. Those requirements need a selected OIDC/OAuth provider or additional identity adapter; do not invent a cryptographic protocol.

The `TokenAuthenticator`, `IdentityContext`, and `Principal` ports do not depend on Laravel. The SQL adapter authenticates; the HTTP boundary sets and clears context for each request; the repository requires permissions and filters ownership even in conditional updates and deletes. A custom backend may replace both adapters but must retain these guarantees and tests.

## Permissions and Ownership

| Case | Behavior |
| --- | --- |
| Missing, invalid, expired, or revoked token | 401, UNAUTHENTICATED, WWW-Authenticate: Bearer |
| reader | tasks:read; own list and read |
| editor | tasks:read and tasks:write; own CRUD |
| Insufficient permission | 403, FORBIDDEN |
| Another identity's object ID | 404; omitted from lists |
| Owner supplied in JSON or a header | Grants no authority; unknown JSON field rejected |
| Excess requests | 429 with Retry-After; no automatic retry |

There is no global administrator permission or enterprise multitenancy. The example's isolation unit is `subject`. Reusing a subject grants access to the same data: the operator must control assignment. Revocation affects subsequent requests; an already authorized request may finish.

The migration retains old rows with `owner_id=null`: inaccessible through the API. It neither assigns existing data to a user nor deletes it. Review ownership, back up, and migrate deliberately before deployment. Reversing this migration removes ownership information: it is not a safe production rollback strategy.

## Usage and Clients

The [backend guide](../../starters/backend-php/security-production.en-US.md) describes issuance, revocation, and commands. The [React](../../starters/web/security-production.en-US.md), [native web](../../starters/web-vanilla/security-production.en-US.md), [Flutter](../../starters/flutter/security-production.en-US.md), and [Kotlin](../../starters/kotlin-android/security-production.en-US.md) guides document token-provider injection.

Memory mode remains independent. HTTP now needs more than a URL: composition must supply a credential acquired at runtime. Starters do not include a screen to enter it or persist secrets themselves. Never put tokens in VITE_*, BuildConfig, --dart-define, public files, URLs, localStorage, or repositories.

Each adapter is bound to the token from its first request. Changing tokens requires recreating the repository and UI state: this prevents mixing identities' data, including during pagination. Clearing visible state on logout belongs to product composition. Flutter/Kotlin and web interfaces retain some network errors as a generic notice; 401/403/429 codes exist in the contract and web transport, not a complete login experience.

## Production Verification

From the backend: `php scripts/check-production.php`. This read-only inspection neither migrates nor changes configuration nor displays secrets. It returns BLOCKED and exit code 1 for failures; LOCAL_CHECKS_PASS means only its local checks passed and always returns `productionApproved: false`.

Checks cover environment, disabled debug, valid application-key format, HTTPS URL, exact HTTPS CORS, persistent rate-limit storage, configuration/route caches, no deployed PHPUnit dependencies, a minimal public surface, applied migrations, and no unassigned legacy data. Correct key length alone does not prove secrecy or randomness.

APP_ENV=production startup rejects unsafe basic configuration. Outside local/testing the API rejects plain HTTP. Rate limits use SQL storage: 120 requests/minute per IP, including unauthenticated attempts. This is a baseline defense, not a strict concurrent quota or DDoS protection; NAT may group users. X-Forwarded-For/Proto are not automatically trusted: proxies require explicit configuration and verification.

The root test `node scripts/test-api-integration.mjs` creates disposable data and credentials; it also tests an isolated production profile with valid caches and configuration. It verifies that development dependencies still block it. Absolute Windows cache-path handling was corrected to keep those files outside the starter.

## Local Evidence

- Backend: 63 tests, 271 assertions per engine in matrix `320ecdd2dbebb766`: SQLite 3.49.2, PostgreSQL 18.6, and MySQL 8.4.11. Owned containers removed. A later bootstrap change corrects Windows cache paths; HTTP integration verifies that correction.
- React: 44 tests, types, and build. Native web: 85 tests. Real HTTP transport: authentication, CRUD, permissions, isolation, revocation, and production configuration gate.
- Flutter: clean analysis and 31 tests against an authenticated backend; one Windows UI flow using a token read from a private test file.
- Kotlin: JVM tests, lint, debug APK, and test APK built; five instrumented tests passed on an API 35 emulator, including authenticated API and remote UI.
- Maintenance: 46 tests; 100 documents, 50 language pairs, and 800 local links verified. Export tests retain the new files, and the previous approved core was not modified.
- Composer audit --locked and React npm audit: no known advisories in this run. These are not Flutter/Kotlin audits or guarantees of no vulnerabilities.

## What Cannot Be Closed on This Machine Alone

Product approval needs evidence from its real target: TLS certificate/chain, proxy and permitted hosts; least-privilege DB access; secret management and rotation; measured backup restore; application/migration rollback; load and limits; monitoring/alerts; security review and approval owner. The limiter does not replace a gateway; logs are not yet a business audit trail. macOS/iOS still require a Mac. No public deployment or ASVS certification occurred.

## Basis

Separation of authentication and authorization, least privilege, default denial, and checking each resource follow [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). HTTPS, keeping credentials out of URLs, and restricted CORS follow [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html). For future federated login consult [OWASP OAuth2](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html). These references justify decisions; they do not certify this implementation.
