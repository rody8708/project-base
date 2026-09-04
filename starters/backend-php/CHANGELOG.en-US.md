# PHP backend changes

[Español (Latinoamérica)](CHANGELOG.es-419.md) · [Home](README.en-US.md)

## 1.1.0-draft.2 — 2026-09-04

### Added

- Validated `X-Request-Id` correlation on successful and error responses.
- Structured server-failure logging with bounded context and no request bodies, tokens, exception messages, or traces.
- Regression coverage for accepted and rejected caller identifiers and safe error correlation.
