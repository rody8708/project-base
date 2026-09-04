# TypeScript / Node.js API Foundation

[Español (Latinoamérica)](README.es-419.md) · [OpenAPI contract](contracts/task-api-v1.openapi.json) · [Neutral backend architecture](architecture.en-US.md)

Technical revision: `1.1.0-draft.2`. Executable application-framework-free candidate; not production-approved.

This second implementation demonstrates that the architecture does not depend on PHP or Laravel. It uses Node.js 24 LTS, TypeScript, and standard Node modules. It retains task and token ports, explicit composition, and a replaceable SQLite adapter. `node:sqlite` remains at release-candidate stability: this is a local evaluation profile, not an automatic production database selection.

Original code is distributed under [MPL-2.0](LICENSE). Node.js, TypeScript, and other dependencies retain their own licenses.

## Run

```powershell
npm ci --ignore-scripts
npm run check
npm run build
npm run token -- operator tasks:read,tasks:write 24
npm start
```

The printed token is a secret and is shown only once. The local server listens on `127.0.0.1:8081`; `APP_ENV=production` refuses this HTTP launcher. Do not copy it as public deployment: production requires reviewed TLS/proxy configuration, tested server storage, secrets, monitoring, backup, and load controls.

## Verified Scope

Network tests verify health, authentication, opaque 256-bit tokens stored by SHA-256 hash, CRUD, optimistic concurrency, revocation, permissions, owner isolation, `es-419`/`en-US` localization, a local persistent limiter, body limits, and validation. The API uses JSON, `no-store`, stable errors, and does not return traces. Every response carries a validated `X-Request-Id`; server failures emit a structured, injectable operational log without request bodies, tokens, exception messages, or traces. Consumer products still need retention and access policies. Operational logs are not a business audit trail.

It does not yet match the PHP reference's coverage: a distributed limiter for multiple instances, executed PostgreSQL/MySQL, native recovery, isolated HTTPS, and the complete negative matrix remain pending. The two implementations are not equivalent until those points close. Python, .NET, Go, and JVM remain possible profiles, not executable starters.

Platform sources: [Node.js release lifecycle](https://nodejs.org/en/about/previous-releases) and [node:sqlite status](https://nodejs.org/api/sqlite.html).
