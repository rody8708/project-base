# Choosing a Platform, Backend, and Database

Technical revision: `1.2.0-draft.1`  
Sources consulted: `2026-09-04`; web fundamentals: `2026-09-03`  
Language: US English (`en-US`)  
[Español (Latinoamérica)](technology-choices.es-419.md) · [Home](../../README.en-US.md)

## This Foundation's Decision

No language, framework, or database is universally superior. Specific combinations are selected here for problem fit, maintenance, available tooling, and reproducible evidence. Consumer preferences and requirements can change the decision.

Seven independent starting points are maintained: [React/TypeScript web](../../starters/web/README.en-US.md), [framework-free HTML/CSS/JavaScript web](../../starters/web-vanilla/README.en-US.md), [Flutter](../../starters/flutter/README.en-US.md), [native Android Kotlin](../../starters/kotlin-android/README.en-US.md), [PHP/Laravel API](../../starters/backend-php/README.en-US.md), an [application-framework-free TypeScript/Node API](../../starters/backend-node/README.en-US.md), and a [Python/FastAPI API](../../starters/backend-python/README.en-US.md). They retain independent composition and do not constitute a complete product. The [API boundary](api-boundary.en-US.md) and [neutral backend architecture](backend-architecture.en-US.md) prevent tying the design to one implementation.

## Framework and Custom Architecture

A framework is not required to build correctly. It is a set of implemented tools, conventions, and decisions that can reduce work, but it does not replace architecture or guarantee product quality by itself. Architecture defines responsibilities, dependencies, contracts, data flow, and boundaries; it can be designed and implemented from scratch for the project's needs.

A custom base must go through the same process as any external dependency: explicit requirements, small interfaces, failure cases, tests, review, measurements when applicable, and controlled evolution. Until it has that evidence, it is a candidate rather than a consolidated solution. “From scratch” means the team controls its architecture; it does not require rewriting delicate or standardized components when a bounded, reviewed library better satisfies the requirement.

Laravel is the broad-coverage executable reference, not the mandatory architecture. The TypeScript/Node base demonstrates custom composition without an application framework and explicitly retains the controls still needed for equivalence.

## Web Fundamentals: HTML, CSS, and JavaScript

Web platform technologies are documented before the selected tools. HTML and CSS are not frameworks and do not serve the same role as a general-purpose programming language:

| Technology | Responsibility | Presence in the web bases |
| --- | --- | --- |
| HTML | Markup language: content structure and meaning, forms, and interaction elements. | Both have an `index.html` document; React generates some content from TSX, while `web-vanilla` uses declarative HTML and DOM APIs directly. |
| CSS | Style language: presentation, layout, visible focus, and adaptation to different widths. | Custom CSS in `web/src/ui/styles.css` and `web-vanilla/styles.css`, without a CSS framework. |
| JavaScript | Programming language: logic and interactive behavior through browser APIs. | `web` transforms TypeScript/TSX; `web-vanilla` runs its JavaScript modules directly, without a build step. |

These roles are supported by the [WHATWG HTML standard](https://html.spec.whatwg.org/multipage/introduction.html), the [W3C description of CSS](https://www.w3.org/Style/CSS/Overview.en.html), and the [Ecma International ECMAScript standard](https://ecma-international.org/publications-and-standards/standards/ecma-262/). They are references, not a claim to implement or verify all their requirements.

In `web`, TypeScript provides static checking, React organizes the interface, and Vite provides development and build tooling. None replaces HTML semantics or CSS behavior. In `web-vanilla`, composition, state, and DOM updates are implemented directly and tested separately; equivalence with all React capabilities is not claimed. A static page does not need to include JavaScript merely to satisfy this catalog.

The `web-vanilla` alternative does not depend on React, TypeScript, Vite, or third-party npm packages. Node is used only for its verification tools and local server. Choosing between the two bases depends on the domain, interface complexity, and maintenance the team will undertake; neither is mandatory or universally superior. Recorded logic/component tests and browser inspection do not certify complete HTML/CSS conformance, comprehensive accessibility, or compatibility with all browsers. Those checks are defined and verified for each product.

## Flutter and Kotlin Do Not Cover Exactly the Same Scope

Flutter supports sharing interface and application logic across platforms. It can also call Kotlin or other native code through [platform channels](https://docs.flutter.dev/platform-integration/platform-channels); a native API is therefore not necessarily beyond its reach. That integration adds a boundary that must be maintained and tested.

The Kotlin base uses [Jetpack Compose for Android](https://developer.android.com/compose). It fits products prioritizing Android and direct access to its APIs, libraries, lifecycle, and native integration. This is this project's architectural choice, not a benchmark proving better performance for every application. This template does not implement Kotlin Multiplatform, a Kotlin server, macOS, or iOS.

## Backend Selection

| Option | When it fits | Decision here |
| --- | --- | --- |
| PHP + Laravel | Business APIs with integrated validation, migrations, and conventions; a team maintaining PHP and Composer. | First executable backend base. |
| Custom architecture without an application framework | Particular requirements, direct dependency control, or a minimal base the team can maintain and test. | Executable TypeScript/Node starter; candidate with pending coverage. |
| TypeScript + Fastify | A shared language with the web client and a small modular API. | Compatible with the neutral architecture; not adopted by the current starter. |
| TypeScript + Nest | Teams wanting more prescriptive modules and dependency injection. | Evaluated alternative; not executed. |
| Python + FastAPI | Typed API in a Python ecosystem, with OpenAPI and explicit SQL adapters. | Executable starter verified with SQLite, PostgreSQL 18.6, and MySQL 8.4.11; each product still requires its own validation. |
| Python + Django | Integrated administration and business models. | Evaluated alternative; not executed. |
| Kotlin/JVM + Ktor / Spring Boot | A team or product requiring JVM/Kotlin and its ecosystem integrations. | Evaluated alternatives; distinct from the Android starter. |

Laravel is selected for its integrated conventions and because PHP `8.5.1`, Composer, and local drivers allow checking it in this environment. Its documentation describes [support and versions](https://laravel.com/framework/docs/13.x/releases#support-policy) and [database connections](https://laravel.com/framework/docs/13.x/database#introduction). This does not certify our implementation: actual executions are recorded separately.

FastAPI `0.141.1` is selected for the Python option because of its typing and OpenAPI integration; SQLAlchemy `2.0.52` remains confined to the infrastructure adapter. The [FastAPI PyPI record](https://pypi.org/project/fastapi/) and [official SQLAlchemy dialects](https://docs.sqlalchemy.org/en/20/dialects/index.html) support the dependency versions and engines, not this template. The local matrix verifies Python `3.13.6` with SQLite, PostgreSQL `18.6`, and MySQL `8.4.11` through real HTTP; CI adds all three engines. The operations lab adds HTTPS, bounded concurrency, and native backup/restore; it does not certify capacity or production.

Fastify provides [HTTP injection for tests](https://fastify.dev/docs/latest/Guides/Testing/), while its [persistence integration](https://fastify.dev/docs/latest/Guides/Database/) remains a project decision. Nest provides [modular structure](https://docs.nestjs.com/). Django offers [integrated models and administration](https://docs.djangoproject.com/en/6.0/intro/overview/); FastAPI describes [typing and OpenAPI](https://fastapi.tiangolo.com/features/). Ktor documents [persistence with Exposed](https://ktor.io/docs/server-integrate-database.html), and Spring publishes [its own requirements](https://docs.spring.io/spring-boot/system-requirements.html). These sources support functional distinctions, not cost or speed comparisons measured here.

## Database Selection

| Engine | Recommended use in this foundation | Limit that must remain explicit |
| --- | --- | --- |
| PostgreSQL | First option to evaluate for a new multiuser service when it can be operated properly. | Requires a server, driver, administration, backups, and its own tests. |
| MySQL / InnoDB | An alternative when MySQL experience, operations, or requirements already exist. | Not interchangeable with PostgreSQL without verifying queries, types, and semantics. |
| SQLite | Serverless local startup, embedded storage, and products whose write patterns fit. | One simultaneous writer per file; does not represent a multiuser server's conditions. |

Recommending PostgreSQL is an engineering decision informed by its [MVCC concurrency model](https://www.postgresql.org/docs/current/mvcc-intro.html), not a claim of universal superiority. MySQL [InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html) also provides transactions and row-level locking. SQLite documents [appropriate uses and concurrency limits](https://sqlite.org/whentouse.html); it is not exclusively a testing tool.

SQLite is the API's local startup profile to avoid requiring an additional service. PostgreSQL/MySQL profiles must be tested against their actual engines. Using the same ORM does not eliminate differences in collation, uniqueness, Unicode, dates, decimals, locking, or migrations. Claims are limited to the example and the [verification record](verification.en-US.md).

## Before Adopting a Combination

Define expected data and concurrency, response objectives, maintenance, licensing, deployment, supported versions, and team skills. Measure a representative workload before making performance-based decisions. Add authentication, authorization, encryption, backups, and recovery according to the product; do not infer them from a CRUD example.

Maintain versions and locks, rerun installation and tests from an independent copy, and review both languages when a decision changes. Historical documentary approval does not automatically approve these starters or a future product.
