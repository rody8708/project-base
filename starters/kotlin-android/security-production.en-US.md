# Authentication, Authorization, and Production

[Español (Latinoamérica)](security-production.es-419.md) · [Home](README.en-US.md) · [API contract](contracts/task-api-v1.openapi.json)

## Security Profile

Contract `1.0.0-draft.2`: HTTP requires an opaque bearer of 64 lowercase hex characters. The operator issues identity-specific tokens with at most 24 hours of validity and reader (own reads) or editor (own reads/writes) permissions. Expired/revoked credentials return 401; missing permission returns 403; another owner's data returns 404. Clients cannot choose ownership.

Memory mode needs no credentials. HTTP mode requires injecting a runtime provider. Setting only the URL no longer grants backend access. The starter has no login form, recovery, or credential storage.

## Usage

```text
HttpTaskRepository(apiUrl) { sessionToken }
```

This fragment shows composition: apiUrl and sessionToken must come from your application, not constants supplied by the template. The token goes exclusively in Authorization: Bearer. The adapter neither follows redirects nor retries writes. It binds to the first credential used: on token change or logout, discard the repository and visible state and create a new instance. This also applies to legitimate renewal.

Current interfaces show some remote failures generically. A full session experience belongs to the product; an authentication screen is not claimed to exist.

Never embed tokens in VITE_*, BuildConfig, --dart-define, public files, URLs, localStorage, logs, or version control. Keep them in session memory; if native persistence is required, select and verify the operating system's secure store. Human accounts with login, recovery, and MFA need an OIDC/OAuth provider through the identity port; this profile does not implement those functions.

## Production Readiness

Require HTTPS for remote destinations and never disable certificate verification. Debug networking only permits local/emulator HTTP. The backend must enforce authentication, permissions, and ownership: hiding UI buttons does not protect data. Do not retain another session's data in views/caches. Test expiration, revocation, identity changes, and errors without repeating uncertain writes.

Approval requires real deployment evidence: TLS/proxy, least-privilege DB access, backup/restore, secret rotation, load/limits, monitoring, security review, and a release owner. This guide deploys nothing. macOS/iOS remain unverified without a Mac.

## Integration Tests

Use a disposable backend and a test-only token. Never use production credentials. Keep the temporary credential file outside exported code and remove it afterward.

Instrumentation uses apiBaseUrl and apiTokenFile; the latter is a private JSON path inside the test application on the disposable emulator. Do not pass the token as a Gradle/instrumentation argument. Delete the file and stop the owned emulator afterward.
