# Node backend changes

[Español (Latinoamérica)](CHANGELOG.es-419.md) · [Home](README.en-US.md)

## 1.1.0-draft.2 — 2026-09-04

### Added

- Validated `X-Request-Id` correlation, including CORS allow/expose behavior.
- An injectable structured logger for server failures with bounded route labels and no sensitive error message.
- Network regressions for correlation, log contents, invalid identifiers, and preflight behavior.
