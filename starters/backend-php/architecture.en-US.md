# Architecture and backend selection

Technical version: `1.1.0-draft.2`. Status: unapproved technical proposal.

[Español (Latinoamérica)](architecture.es-419.md) · [Starter home](README.en-US.md) · [Verification](verification.en-US.md)

## Responsibilities

```text
HTTP (JSON, language, validation, status codes)
  -> TaskService (use cases and version conflicts)
    -> TaskRepository (contract)
      -> SqlTaskRepository (Laravel query builder + PDO)
        -> SQLite | PostgreSQL | MySQL
Task (immutable value and example rules) does not depend on Laravel.
```

The service receives its repository and ID generator; it does not create connections or configure HTTP. The SQL adapter converts rows to domain values and translates `QueryException` failures into `PersistenceUnavailable`. The HTTP boundary knows only that stable category and returns 503 without importing provider classes or exposing SQL details. Updates use an `id` and `version` condition: an outdated write cannot overwrite the preceding result. This mechanism protects the example's individual resource; it does not implement distributed transactions, general idempotency, or automatic conflict resolution.

Migrations separate initial `tasks` creation from adding `completed`/`version`. Updating an existing row and rolling back the schema are tested only in disposable test databases. Title and version limits are enforced in the domain; SQLite is not assumed to enforce `VARCHAR` lengths like other engines. No migration should run against consumer data without reviewing backups, permissions, and the transition.

## Why the first implementation uses Laravel

The local choice considers available PHP/Composer tools and the need for a business API with conventions, validation, migrations, and tests. Laravel declares first-party support for all three engines, although each combination needs verification. The candidate uses its query builder; no other ORM or persistence framework is added. [Laravel databases](https://laravel.com/framework/docs/13.x/database#introduction).

There is no universally best option. These are foundation alternatives, not additional installed stacks or capabilities verified by this delivery:

| Alternative | Condition that may justify choosing it | Cost or limitation |
| --- | --- | --- |
| TypeScript + Fastify | Share a language with the frontend; small modular API. | Select/maintain persistence, migrations, and authentication. Fastify is database agnostic. |
| TypeScript + Nest | A team prefers prescriptive modules and dependency injection. | More abstractions; it can use Fastify underneath. |
| Python + Django | Business models and integrated administration. | Define the API layer and maintain the Python/server environment. |
| Python + FastAPI | Typed API and work in the Python ecosystem. | Choose persistence and migrations; size worker processes. |
| Kotlin/JVM + Ktor or Spring Boot | A JVM/Kotlin requirement or relevant team experience. | JDK and Gradle/Maven; budget resources and review blocking SQL access. |

These comparisons are design criteria, not speed/price rankings. Official sources: [Fastify](https://fastify.dev/docs/latest/Guides/Database/), [Nest](https://docs.nestjs.com/), [Django](https://docs.djangoproject.com/en/6.0/intro/overview/), [FastAPI](https://fastapi.tiangolo.com/tutorial/sql-databases/), [Ktor/Exposed](https://ktor.io/docs/server-integrate-database.html), [Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html). A Kotlin/JVM backend does not replace an Android Kotlin foundation or determine the interface technology.

Laravel 13 declares PHP 8.3–8.5 support and security support through March 17, 2028; this candidate restricts its profile to PHP 8.5.x and records only the specific observed execution. A provider-supported range is not equivalent to local testing of that entire range. [Release policy](https://laravel.com/framework/docs/13.x/releases#support-policy).

## Selecting an engine

- SQLite reduces initial operational components and fits embedded/local storage or appropriately sized services. It allows only one simultaneous writer per file; it is not presented as a universal replacement for a SQL server. [Appropriate uses](https://sqlite.org/whentouse.html).
- PostgreSQL is a reasonable default to evaluate for a new multiuser service; MVCC is part of its concurrency model. Connections, permissions, backups, and maintenance must be operated. [MVCC](https://www.postgresql.org/docs/current/mvcc-intro.html).
- MySQL/InnoDB is a reasonable alternative when MySQL requirements, experience, or infrastructure already exist. Transactions and foreign keys do not eliminate SQL, type, and collation differences. [InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html).

Select one engine per consumer, rather than running all three in production by default. The example avoids engine-specific features such as text search, complex JSON types, decimal calculations, and specific SQL. If a consumer needs them, expand the test matrix; a common contract does not require abandoning useful capabilities of the chosen engine.

## Limits before adoption

Define authentication/authorization and sensitive data, public contracts/versioning, end-to-end TLS, least-privilege permissions, logging policies, backups and restoration, observability, expected load, and security updates. A correct HTTP response or an audit without advisories does not settle those decisions. The example does not automatically connect the other templates or contain consumer-selected production configuration.
