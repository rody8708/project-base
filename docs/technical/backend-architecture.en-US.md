# Neutral Backend Architecture

[Español (Latinoamérica)](backend-architecture.es-419.md) · [Technology options](technology-choices.en-US.md) · [API boundary](api-boundary.en-US.md)

Technical revision: `1.1.0-draft.1`. This architecture is mandatory for reference starters; it does not require a language or framework.

A compatible backend separates responsibilities: domain invariants; application use cases and permissions; ports describing identity, persistence, time, and effects; HTTP, SQL, and external-provider adapters; and composition selecting implementations. Dependencies point toward internal contracts. A framework may host adapters and composition, but it does not become the domain.

The public OpenAPI API is the client boundary. Internal ports do not share source code across languages; they share observable behavior. A custom implementation built from scratch is valid when it preserves validation, error codes, concurrency, authorization, transactions, and operational controls, and passes the same contract suite.

## Minimum Conformance Criteria

- The same exact OpenAPI contract copy and versioned routes.
- Random tokens, expiration, revocation, stored hash, and explicit permissions.
- Data ownership applied inside every query; a foreign resource returns 404.
- Bounded strict JSON input; server-controlled IDs and versions.
- No implicit write retries, optimistic concurrency, and errors without secrets.
- Replaceable persistence adapter; changing engines requires migrations and real tests, not only configuration changes.
- Honest, verifiable states for health, logging, limits, TLS, recovery, and production.

A shared suite must run positive and negative examples against a real HTTP process. Language-internal tests complement that suite; they do not replace it. A reference with fewer controls remains a candidate and is not declared equivalent.

PHP/Laravel, application-framework-free TypeScript/Node, and Python/FastAPI are executable implementations. Each retains its own evidence; .NET, Go, and JVM remain documented alternatives. The [current status](stability-status.en-US.md) distinguishes catalog, release, and limits.
