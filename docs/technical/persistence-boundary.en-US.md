# Language- and Framework-Independent Persistence

Technical revision: `1.1.0-draft.1`  
Status: decision adopted; evidence limited to tested implementations.  
[Español (Latinoamérica)](persistence-boundary.es-419.md) · [Home](../../README.en-US.md) · [API boundary](api-boundary.en-US.md) · [Verification](verification.en-US.md)

## Tool-Independent Principle

Fundamentals and responsibilities are defined before selecting a language, framework, or engine. A custom architecture built from scratch is valid. PHP, Laravel, Kotlin, and the other catalog technologies are reference implementations, not requirements of the concept. Each concrete implementation must still consider the selected language's types, concurrency, resources, and capabilities.

Use cases depend on a persistence contract defined by the application. An adapter implements that contract and translates operations and data into the storage mechanism. The domain and application do not import drivers, connections, SQL, ORM models, or framework classes. Composition selects and injects the adapter; individual use cases do not select the engine.

```text
client -> API contract -> use cases and domain
                             -> persistence contract
                                 <- persistence adapter -> engine
```

The arrow toward the contract indicates dependency: the adapter implements a contract owned by the application, not the engine vendor. Another network API between backend and database is unnecessary: this boundary is typically an internal interface implemented using the engine's driver.

## What Must Remain Stable

The contract expresses domain operations, input/output data, and behaviors: missing results, ordering, pagination, conflicts, atomicity, and relevant failures. It does not accept arbitrary SQL or return deferred queries, connections, or ORM entities. An engine change that preserves that behavior must not require changes to use cases, the API, or clients.

Multi-repository transactions, when needed, are coordinated through an application-owned unit-of-work or transaction contract; its implementation ensures a shared connection and commit/rollback boundaries. Empty abstractions are not added, and cross-engine atomicity is not promised. Provider errors are translated at the appropriate boundary into stable errors without exposing SQL details or credentials to clients. Retries require safe operations and an explicit policy.

## Current Implementation and Selection Criterion

The PHP reference already has `TaskRepository`, `TaskService`, `SqlTaskRepository`, and composition in `AppServiceProvider`. The port and service do not depend on Laravel. Only the SQL adapter uses its query builder, which delegates to SQLite, PostgreSQL, and MySQL drivers. Using a language interface does not require a framework container: a custom implementation can compose objects directly.

A shared SQL adapter is retained while required operations preserve the same behavior across all three engines. Three identical copies are not created just for their names. If engine-specific capabilities or semantics appear, specialized adapters implement the same contract, or the contract is explicitly reconsidered if a capability cannot be preserved. An ORM alone does not demonstrate portability.

The local matrix runs the same API and persistence suite against all three engines. This verifies the covered example, not every future query. The native PHP starter also implements prepared-PDO repository and token adapters with local SQLite/PostgreSQL/MySQL profiles, while engine-specific schemas and rate limiting stay in Infrastructure. Its [SQL evidence](../../starters/backend-php-native/sql-engines.en-US.md) is separate from the Laravel reference.

## Switching Engines Does Not Transfer Data Automatically

Before adopting another engine:

1. Review types, precision, Unicode, collation, ordering, nullability, uniqueness, and constraints.
2. Verify isolation, concurrent writes, conflicts, and transactions against the actual engine.
3. Prepare schema and indexes and rehearse data transfer with backups and reconciliation.
4. Run the same contract and API tests, plus representative load tests where appropriate.
5. Define cutover, rollback, credentials, permissions, and recovery before changing production configuration.

Changing `DB_CONNECTION` selects a profile: it does not move data, create semantic equivalence, or guarantee a zero-downtime migration. Silent engine switching on failure is not allowed.

## Local Testing and Sources

Available Windows and WSL tools may be used for local tests. Each run must verify tools and targets, use synthetic data and isolated resources, and clean up only what it created. Available services do not authorize modifying existing databases. Platform-specific checks are recorded separately.

References illustrate mechanisms and limitations without mandating tools: [interface injection in Laravel](https://laravel.com/framework/docs/13.x/container#binding-interfaces-to-implementations), [query builder](https://laravel.com/framework/docs/13.x/queries), [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [InnoDB transactions](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-transaction-model.html), and [SQLite transactions](https://sqlite.org/lang_transaction.html). Choosing the shared adapter is this project's decision supported by its test matrix, not a claim of universal superiority.
