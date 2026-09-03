# API Boundary Between Clients and Backend

**Updated status:** token, permission, and ownership boundaries are implemented; see [security and production readiness](security-production.en-US.md). Earlier tests and limitations are historical: the API no longer accepts anonymous access. Production approval remains pending.

Technical revision: `1.1.0-draft.1`  
Status: decision adopted; local HTTP integration implemented, not approved for production.  
Language: US English (`en-US`)  
[Español (Latinoamérica)](api-boundary.es-419.md) · [Home](../../README.en-US.md) · [Implementation](implementation.en-US.md) · [Verification](verification.en-US.md)

## Decision

When a project has a remote backend, every authorized client—web, mobile, desktop, or another kind—will communicate with it exclusively through an API that is public to those clients, versioned, and verifiable. A client will not directly access the database, PHP code, Laravel classes, server files, or internal persistence models.

The API will be the sole communication boundary between the two sides. This does not mean there is no coupling: client and backend will be deliberately coupled to the API contract, but not to each other's internal implementations. They can therefore be built, deployed, tested, and replaced independently while they preserve a compatible contract.

The rule covers HTTP/JSON in the current foundation. If a product adds WebSocket, events, streaming, or another transport, it must also define that transport as an external contract; it does not become a direct persistence access path.

## Dependency Direction

```text
web client / Flutter / Kotlin / another client
    -> client application port
        -> HTTP adapter
            -> versioned API contract
                -> backend HTTP adapter
                    -> backend application and domain
                        -> repository port
                            -> persistence adapter
                                -> selected engine
```

The backend will not know client screens or frameworks. The client will not know Laravel, PHP, SQL, or the physical schema. API data-transfer objects will be mapped explicitly: database rows, ORM entities, and internal details will not be exposed as though they were the public contract.

The [persistence decision](persistence-boundary.en-US.md) defines this second boundary independently of language or framework. Laravel is an executable reference, not the mandatory concept.

## Contract Responsibilities

Before an application is connected, the contract must define and test the following as applicable:

| Area | Required decision |
| --- | --- |
| Operations | Paths, methods, HTTP statuses, and observable behavior. |
| Data | Requests, responses, required fields, nullability, identifiers, Unicode, numbers, and time. |
| Failures | Stable format and machine-readable codes; the interface translates messages for the person. |
| Security | Authentication, per-operation authorization, encrypted transport, and credential handling. |
| Collections | Pagination, filters, sorting, and size limits. |
| Writes | Validation, concurrency, versions, idempotency, and conflicts where applicable. |
| Evolution | Compatibility, versioning, deprecation, and change procedure. |

The backend remains authoritative for security and business invariants. Client validation improves the experience, but it does not replace server validation or make the client trusted.

## Actual State of This Foundation

The React, HTML/CSS/JavaScript, Flutter, and Kotlin clients can select memory or HTTP behind their ports. The reference backend exposes `/api/v1`, persists through a SQL adapter, and operates independently.

The [integration record](api-integration.en-US.md) describes the OpenAPI contract, adapters, and local tests. Titles were aligned at 80 code points, and versions, pagination, IDs, and unknown time were defined. Flutter's previous limit was 120, like PHP; the initial statement of 80 for every client was incorrect.

## Gate for Implementing the Connection

Local integration covers the contract, adapters, and tests. Adopting a connection in a product also requires checking its security and operations:

1. Define a neutral, versioned contract; OpenAPI is the initial choice for HTTP, not a mandate for other transports.
2. Align semantics, validation, errors, concurrency, and compatibility for the selected example.
3. Implement one HTTP adapter per selected client behind its repository port, retaining the memory adapter for isolated tests.
4. Configure URLs and credentials per environment without shipping server secrets in distributed applications.
5. Verify backend conformance, consumers against contract doubles, and at least one end-to-end flow with a real backend and database engine.
6. Record limitations, failures, migration, and the strategy for incompatible changes.

The contract must describe domain capabilities and must not force every future project to adopt the task example. The exporter may include an integration only when it is relevant to the selected template; it must not merge all starters into a single product.

## Scope and References

This decision applies when a product chooses a remote backend. A static page or completely local application does not need an invented API. It also does not mean duplicating business logic in every interface, trusting the client, sharing a language across layers, or treating authentication, TLS, deployment, or recovery as solved.

The [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) describes an HTTP API independently of its implementation language. [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines HTTP's uniform interface and explains its role in independent implementation evolution. They support the boundary; evidence for this foundation will still depend on its own contracts and tests.
