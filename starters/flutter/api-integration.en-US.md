# API Integration

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical revision: `1.1.0-draft.1`. Candidate for local evaluation; not production.

[Español (Latinoamérica)](api-integration.es-419.md) · [Home](README.en-US.md)

## Configuration

For Windows:

```text
flutter run -d windows --dart-define=API_BASE_URL=http://127.0.0.1:8080/api/v1
```

Android: explicitly select the owned emulator, run `adb -s SERIAL reverse tcp:8080 tcp:8080`, and use the same URL with `flutter run -d SERIAL --dart-define=API_BASE_URL=http://127.0.0.1:8080/api/v1`. Remove the reverse afterward. Only debug allows HTTP for loopback/emulator; Android release requires HTTPS. The adapter uses `dart:io`: native targets, not Flutter web. macOS has network-client permission, but macOS/iOS still require verification on a Mac.

Adapter test with an isolated fixture: set `FOUNDATION_TEST_API_URL` and run `flutter test`. Windows UI test: `flutter test integration_test/api_flow_test.dart -d windows --dart-define=API_BASE_URL=FIXTURE_URL`. Without a fixture, the external HTTP test in `flutter test` is explicitly skipped.

## Contract and Limitations

This integration uses the [included OpenAPI contract](contracts/task-api-v1.openapi.json), revision `1.0.0-draft.1`. The contract does not depend on PHP, Laravel, or the client language. A custom backend may implement it and demonstrate conformance with the same operations and errors.

The server assigns canonical UUIDs and versions. Titles contain 1–80 Unicode code points after edge trimming. This revision reduces the previous PHP/Flutter limit from 120 to 80: an incompatible candidate-example change; review existing data before adoption without automatically truncating it.

Clients traverse pages of 100 items until an empty page, with at most 100 requests per listing. They reject malformed data and retain the observed version for writes. A conflict is not resolved by silently rereading and overwriting. Writes are not automatically retried: a disconnect, timeout, or invalid response may happen after commit. The interface asks users to reload before repeating; some failures, including conflicts, use the generic unconfirmed-operation notice.

The API does not provide a creation time. Web/Kotlin representations use `null` for unknown time; Flutter does not expose that field. Memory-mode local IDs/clocks are not authoritative in HTTP mode: the adapter sends only the title on creation and keeps the server result.

Responses are limited to 1 MiB. Network timeouts are 10 seconds; JavaScript/Dart bound each complete request, while Android bounds connection and reads. There is no offline cache, automatic synchronization, authentication, or authorization. Pagination is not a snapshot under concurrent changes.

## Evaluation Security

This is a local reference integration, not production configuration. Keep the unauthenticated backend on loopback. CORS is not authentication and does not protect against other local programs. Nonlocal destinations require HTTPS; do not ship server secrets in distributed applications.

Memory repositories remain the clients' default. Configuring a URL explicitly selects HTTP; a remote failure never silently switches to memory. Each export includes the contract, adapter, and this guide without importing master-foundation files.
