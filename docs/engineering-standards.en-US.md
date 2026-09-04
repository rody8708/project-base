# Applicable Engineering Standards

Working revision: `1.1.0-draft.2`  
Status: operational policy adopted for the post-`v1.1.0` tree; it does not modify the frozen release.  
Language: US English (`en-US`)  
[Español (Latinoamérica)](engineering-standards.es-419.md) · [Home](../README.en-US.md) · [Core rules](immutable-rules.en-US.md)

## Purpose and Precedence

These standards turn general principles into decisions applicable to starters and consumer projects. They complement the ten core rules; they do not replace their contracts, evidence, or limits. If two rules appear incompatible, preserve security, data integrity, authorization, and public behavior first, and document the decision.

Each rule has one of these strengths:

- **MUST:** non-negotiable for security, correctness, or architectural integrity. A violation blocks delivery.
- **SHOULD:** a strong expectation. It may be deferred only with rationale, risk, owner, and follow-up documented in the pull request.
- **NICE:** a desirable improvement. If evaluated and skipped, record a brief reason; it does not block by itself.

A rule applies only when the corresponding behavior exists. Do not invent accounts, tenants, payments, local storage, or infrastructure to satisfy a generic checklist.

## Architecture and Dependencies

- **MUST:** separate domain, application, infrastructure adapters, presentation/transport, and composition. Folder names may vary by language; dependency direction may not.
- **MUST:** domain and application do not depend on HTTP, UI, SQL drivers, connections, ORM, or provider implementations.
- **MUST:** application consumes persistence and external services through internal ports or interfaces. Implementations live in infrastructure.
- **MUST:** controllers and widgets translate the external boundary; they contain neither business rules nor data access.
- **MUST:** entities and DTOs contain no ActiveRecord persistence logic.
- **MUST:** an application with a remote backend uses the API as the client's sole boundary; no client accesses the database directly.
- **SHOULD:** extract orchestration into a use case when it combines permissions, transactions, multiple repositories, or effects. A controller method over roughly 30 body lines requires review and justification.
- **SHOULD:** use constructor injection and keep composition as the single location that selects implementations. Do not use global service locators from domain, application, or modules.
- **SHOULD:** apply Strategy, Factory, Event Bus, or Facade only where real variation or decoupling exists. A pattern without a concrete problem is not compliance.
- **MUST:** coordinate atomic operations across repositories at the application boundary through a transaction or unit-of-work abstraction; do not leak a connection into domain.

The [persistence boundary](technical/persistence-boundary.en-US.md), [API boundary](technical/api-boundary.en-US.md), and [backend architecture](technical/backend-architecture.en-US.md) define language-neutral behavior.

## Architecture Guard

`npm run architecture:check` applies an automated ratchet to maintained code. It currently blocks:

- PHP without `declare(strict_types=1)` and domain dependencies on Laravel, PDO, or outer layers.
- PDO, SQL, or infrastructure implementations inside PHP application and HTTP transport.
- HTTP or SQLite inside Node contracts/application.
- UI/adapter dependencies from web domain or application.
- presentation/infrastructure dependencies from Flutter domain and application.
- Android, networking, or adapters from the Kotlin core, and direct transport from screens or ViewModels.

**MUST:** a new violation fails CI. Exceptions are not silenced by broadening patterns or removing checks; fix the boundary or explicitly document and review an evolution of the standard.

## Security by Interface Type

- **MUST:** validate untrusted data at the boundary protecting the operation; visual validation never replaces server validation.
- **MUST:** use parameterized queries or equivalent APIs; never concatenate input into SQL.
- **MUST:** distinguish authentication from authorization and enforce ownership, tenant, and permissions in the backend when present.
- **MUST:** keep real secrets, credentials, personal data, databases, logs, backups, and `.env` files out of Git.
- **MUST:** escape untrusted content for its output context. React, Flutter, Compose, or `textContent` may provide the mechanism; HTML constructed as text requires explicit escaping.
- **MUST:** protect cookie-authenticated operations that browsers submit automatically with CSRF controls. A bearer API without cookies does not add fictitious CSRF; it protects tokens, CORS, TLS, authorization, and replay according to its threat model.
- **MUST:** store passwords with a reviewed modern password-hardening algorithm when the product uses passwords. The current starter has no human-account system; a project must select and test identity, activation, recovery, and MFA according to risk.
- **SHOULD:** rate-limit attempts, support revocation, record security events, and never display internal diagnostics.

The implemented profile and its limits are recorded in [security and production](technical/security-production.en-US.md).

## Interfaces, Languages, and Accessibility

- **MUST:** all maintained user-visible text comes from a translatable source. Starter minimum: `es-419` and `en-US`.
- **MUST:** preserve valid UTF-8, real accents, and `ñ`; mojibake blocks delivery.
- **MUST:** represent relevant loading, empty, success, error, unauthenticated, and forbidden states. Offline/sync becomes mandatory only when the product declares that capability.
- **MUST:** provide light and dark modes and verify contrast and readability in both when a starter has a visual interface.
- **MUST:** adapt the interface to declared device sizes and classes, with focus, keyboard, semantics, and touch targets as appropriate for the platform.
- **SHOULD:** use shared visual tokens and extract repeated patterns. Stretched screens or raw error text do not satisfy a product visual review.

## Tests and Evidence

- **MUST:** new behavior and fixed defects have proportional automated tests; a reproducible defect includes regression coverage.
- **MUST:** application logic is tested without real network, UI, or databases through appropriate doubles. An unused double for every interface is not required.
- **MUST:** persistence adapters are tested with isolated infrastructure and every engine claimed as compatible.
- **MUST:** tests and trials use synthetic data, explicitly owned resources, and verified cleanup.
- **MUST:** before merge, run affected starter commands and exercise its real entry point when observable behavior changes. A blocked check remains pending.
- **MUST:** failing CI blocks merge. Controls are not weakened and exceptions are not broadened to hide a failure.
- **SHOULD:** controllers cover authentication, authorization, validation, and responses when those routes exist.

The [development workflow](development-workflow.en-US.md) defines the minimum record and definition of done.

## Data, Operations, and Delivery

- **MUST:** schema changes use versioned migrations with rollback or an explicit irreversibility and recovery note.
- **MUST:** public errors are safe and stable; internal diagnostics never expose secrets, SQL, tokens, or traces.
- **SHOULD:** operational logs include a request identifier and, when safe, identity, tenant, route, and failure category.
- **SHOULD:** sensitive operations produce audit records separate from technical logs.
- **MUST:** every change starts from updated `main`, stays focused, reviews staged paths/diff for private data, and passes PR/CI before merge.
- **MUST:** behavior, architecture, setup, testing, or operations changes update `es-419` and `en-US` documentation in the same PR.
- **SHOULD:** each distributable application maintains semantic versioning, a technical changelog, and localized commercial release notes. A build-only change does not represent new user-visible behavior.

The automatic pull-request template makes these checks visible.

## Conditional Profiles

These capabilities are not universal requirements. When a project declares one, its guarantees become MUST and require their own contract, implementation, and tests:

- **Human identity:** registration or provisioning, activation, login, recovery, MFA, sessions, revocation, and secure storage.
- **Multitenant SaaS and privacy:** backend isolation, validated tenant context, data export/correction/deletion, retention, anonymization, and applicable legal responsibilities.
- **Payments:** provider behind a port, idempotency, verified webhooks, reconciliation, backend-only secrets, and server authority for plans/licenses.
- **Secure mobile:** tokens in secure storage, clearing or rescoping cache on identity/tenant changes, and protected navigation.
- **Offline and synchronization:** visible pending state, cache scope, encryption for sensitive data, invalidation, and explicit conflict resolution.

Class names, namespaces, endpoints, providers, and paths belong to the consumer project. This foundation defines observable guarantees; it does not clone another system's implementation.
