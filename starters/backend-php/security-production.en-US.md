# Authentication, Authorization, and Production

[Español (Latinoamérica)](security-production.es-419.md) · [Home](README.en-US.md) · [API contract](contracts/task-api-v1.openapi.json)

## Security Profile

Contract `1.0.0-draft.2`: HTTP requires an opaque bearer of 64 lowercase hex characters. The operator issues identity-specific tokens with at most 24 hours of validity and reader (own reads) or editor (own reads/writes) permissions. Expired/revoked credentials return 401; missing permission returns 403; another owner's data returns 404. Clients cannot choose ownership.

Identity ports are framework-independent. The SQL implementation stores only SHA-256 hashes of random 256-bit tokens. Middleware clears identity after each request. Migrations add ownership, tokens, and SQL rate-limit cache; existing unassigned data stays inaccessible pending review. Do not migrate real data without backup and reviewed assignment.

## Usage

```text
php scripts/token.php issue demo-user editor 3600
php scripts/token.php revoke TOKEN_ID
php scripts/check-production.php
```

Run from a backend copy with private configuration and applied migrations. Issuance prints the plaintext token once: use a private terminal, deliver through a secure channel, and never log the output. TOKEN_ID is the hash identifier from that output, not the token. Different owners require different subjects; reusing a subject shares that identity's data. The CLI is an operator tool with database access, not public account-registration API.

GET /api/v1/auth/session returns identity and permissions. DELETE /api/v1/auth/token, with Authorization: Bearer and a JSON {} body, revokes the current token. No automatic refresh exists. An already authorized operation may finish after revocation. To rotate: issue a new token, switch sessions deliberately, and revoke the previous token.

Never embed tokens in VITE_*, BuildConfig, --dart-define, public files, URLs, localStorage, logs, or version control. Keep them in session memory; if native persistence is required, select and verify the operating system's secure store. Human accounts with login, recovery, and MFA need an OIDC/OAuth provider through the identity port; this profile does not implement those functions.

## Production Readiness

The check-production command is read-only. BLOCKED/exit 1 flags problems; LOCAL_CHECKS_PASS does not approve deployment. It checks basic configuration, caches, migrations, legacy ownership, public surface, and development dependencies. It always reports productionApproved=false and pending external evidence. Unsafe production configuration is rejected at startup; HTTP is rejected outside local/testing. Explicitly configure trusted proxies; do not assume X-Forwarded-Proto makes a connection secure.

The SQL limiter applies 120 requests/minute per IP and returns 429 with Retry-After. This is baseline protection: test concurrency, NAT, proxies, and capacity, and use edge controls for abuse/DDoS. CORS allows exact origins and Authorization without cookies. Do not confuse CORS with authorization.

Approval requires real deployment evidence: TLS/proxy, least-privilege DB access, backup/restore, secret rotation, load/limits, monitoring, security review, and a release owner. This guide deploys nothing. macOS/iOS remain unverified without a Mac.

## Integration Tests

composer check repeats isolated tests, never using a consumer database. php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker repeats the matrix in owned instances, with prerequisites documented in the backend guide.
