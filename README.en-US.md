# Master Software Project Foundation

## I Want to Create an Application: How Does This Help Me?

This foundation helps you start an application on a prepared technical structure instead of beginning with an empty folder and making every decision without a reference. It supports web, mobile, native Android, desktop, and backend projects.

**It is not documentation alone.** It includes executable starter code, working examples, automated tests, a shared API contract, persistent backends, and a tool that copies the selected foundation into a new project.

**It is not a finished application or a one-click generator.** It does not yet know your business, screens, or features. It provides the foundations; then you, a team, or a coding assistant build your product's specific capabilities on them.

### What It Gives You

- Avoids starting completely from scratch.
- Lets you select only the pieces you need without forcing a particular language or framework.
- Separates the interface, backend, and database so they can be replaced with less impact.
- Prepares validation, tests, API communication, persistence, tokens, and basic permissions.
- States what has been verified and what remains pending so an example is not mistaken for a production-ready product.

### How to Begin Even If You Do Not Know How to Program

1. Describe your application idea, who will use it, and what problem it will solve.
2. Decide where it must run: web, mobile, Android, desktop, or multiple platforms.
3. Use the guide to select and export the required foundations.
4. Build one small feature at a time and verify every change.

You can give this repository to a developer or coding assistant and ask: “I want to create an application for `[goal]`, aimed at `[users]`, and available on `[platforms]`. Help me define it and use this foundation to create the required projects without coupling clients to the backend.”

**Next step:** read the [application creation guide](docs/getting-started.en-US.md), which explains the complete process and its limits.

[Isolated Docker lab: PHP 8.5 and HTTPS](starters/backend-php/docker-local.en-US.md).

**Updated status:** token, permission, and ownership boundaries are implemented; see [security and production readiness](docs/technical/security-production.en-US.md). Earlier tests and limitations are historical: the API no longer accepts anonymous access. The [stable release status](docs/technical/stability-status.en-US.md) records macOS/iOS as nonblocking pending work and MPL-2.0 as the adopted license.

Post-freeze working revision: `1.1.0-draft.1`  
Status: technical release `1.1.0` approved for its declared scope; the working tree may contain later external records.  
Language: US English (`en-US`)  
[Latin American Spanish version](README.es-419.md)

License for original code and documentation: [Mozilla Public License 2.0](LICENSE). See the [license scope](LICENSE-SCOPE.en-US.md) and [trademark policy](TRADEMARKS.en-US.md).

The project is maintained by **Zendrhax LLC** under the **Zendrhax** brand. To collaborate, read the [contribution guide](.github/CONTRIBUTING.en-US.md); to report a vulnerability, follow the [security policy](.github/SECURITY.en-US.md).

Stable release: [technical approval 1.1.0](releases/approval-1.1.0.en-US.md), tied to the exact package and SHA-256 without rewriting its bytes.

## Contents

This project maintains reusable bases. Final applications are created in separate locations from those bases.

| Layer | Contents | Status |
| --- | --- | --- |
| Documentary core | Fundamentals, ten rules, workflow, profiles, and project brief template. | Release `1.0.0` approved; package unchanged. |
| Web base | HTML and CSS; JavaScript behavior authored in TypeScript, with React and Vite; domain, service, memory, interface, and tests. | Reference code in the [web starter](starters/web/README.en-US.md); bounded evidence in the technical record. |
| Framework-free web base | Native HTML, CSS, and JavaScript, ES modules, and tests without third-party dependencies; no build step. | [web-vanilla starter](starters/web-vanilla/README.en-US.md); independent of React, TypeScript, and Vite. |
| Desktop/mobile base | Flutter with shared code and Windows, macOS, Linux, Android, and iOS host projects. | Reference code in the [Flutter starter](starters/flutter/README.en-US.md); each target retains its verification status. |
| Native Android base | Kotlin and Jetpack Compose, independent of Flutter. | [Kotlin starter](starters/kotlin-android/README.en-US.md); its scope is Android. |
| Backend base | PHP/Laravel API with migrations and SQLite, PostgreSQL, and MySQL profiles. | [PHP starter](starters/backend-php/README.en-US.md); engine-specific results in its record. |
| Custom backend base | Application-framework-free TypeScript/Node API with ports and local SQLite. | [Node starter](starters/backend-node/README.en-US.md); exportable candidate with explicit limits. |
| Tools | Export to new destinations, checks, automatic pull-request CI, and expanded manually triggered matrices. | [Maintenance instructions](tools/README.en-US.md); no services or application publication. |

Executable bases are replaceable starting points, not a commercial application or a mandatory architecture for every project. Using an existing framework is optional: a project may adopt one, combine components, or implement its own architecture from scratch. In every case, it must demonstrate its contracts, limits, and operation with the same discipline before it is considered a consolidated base. The task example exercises contracts, validation, state, and tests. Clients lose their data when their instance ends; on the web, a full page reload also discards it. The APIs provide persistence, provisioned tokens, and owner authorization. Clients connect through their HTTP adapters and the shared contract. Real credentials, complete human accounts, and a deployed product are not included.

## Start From a Base

Web fundamentals are distinguished from tools: HTML for structure and semantics, CSS for presentation and responsive layout, and JavaScript for behavior when needed. `web` uses React, TypeScript, and Vite; `web-vanilla` implements its own interface with HTML/CSS/JavaScript and does not need those tools. They are independent templates, not two modes of the same application. Node supports tests and the native variant's local server, not the code running in the browser.

Read the [technical scope](docs/technical/implementation.en-US.md), the [API boundary between clients and backend](docs/technical/api-boundary.en-US.md), and [technology and database selection](docs/technical/technology-choices.en-US.md), then the chosen starter's instructions and its [verification record](docs/technical/verification.en-US.md). The adopted direction requires every client with a remote backend to use the API as its sole communication boundary and never access the database or server implementation directly. The [executable integration](docs/technical/api-integration.en-US.md) has bounded local evidence; having a platform's files does not mean it has run there.

The six `--template` options describe the exporter's current catalog, not the only permitted architectures. Another custom base built from scratch can start with the documentary core and define an independent implementation; selecting a template or using this CLI is not required. That new base needs its own tests and verification record.

To inspect the tools without installing application dependencies:

```text
node --version
npm ci --ignore-scripts
npm test
npm run check
node tools/create-project.mjs --help
```

To create an evaluation copy, provide a new absolute destination whose parent exists outside this repository. Windows example:

```text
node tools/create-project.mjs --template web --name mi-web --destination "D:\proyectos\mi-web"
```

Use `--template web-vanilla` for framework-free HTML/CSS/JavaScript, `--template flutter` for desktop/mobile, `--template kotlin-android` for native Android, `--template backend-php` for Laravel, or `--template backend-node` for an application-framework-free TypeScript API. The exporter copies the starter's instructions and lockfiles and the approved documentary release; it does not install tools, configure accounts, or confirm consumer adoption. Continue inside the new folder using its README. Native distribution identifiers remain examples until the consumer configures them.

## Approved Documentary Core

The [1.0.0 approval](releases/approval-1.0.0.en-US.md) ties the release to the [preserved package](releases/foundation-0.1.0-draft.4.zip) and its SHA-256. The ZIP filename retains its editorial revision; the external receipt establishes approval. That package was not modified to add executable bases.

Core reading: [governance](docs/foundation-governance.en-US.md), [rules](docs/immutable-rules.en-US.md), [fundamentals](docs/programming-fundamentals.en-US.md), [data and time](docs/data-and-time.en-US.md), [failures and resources](docs/failures-and-resources.en-US.md), [applicability](docs/applicability.en-US.md), [traceability](docs/traceability.en-US.md), [workflow](docs/development-workflow.en-US.md), and [project brief](templates/project-brief.en-US.md).

Their draft headers are the preapproval snapshot. Historical fixed-inventory checks run against a recovery of that ZIP. Use `npm run check` for the extended working tree. A correction or new release requires a new identity; a starter does not become stable by inheriting documentary approval.

## Languages, Security, and Scope

Every maintained Markdown document has separate `.es-419.md` and `.en-US.md` files with equivalent meaning. Code, identifiers, and external originals that must remain intact are not translated when doing so would alter them. Product languages are a consumer decision; examples include both.

Real secrets are not included, existing projects are not overwritten, and an approved release is not modified. Caches, builds, captures, and trials remain separate from source code. Evidence records command, environment, result, and limits; macOS/iOS/Linux support is not inferred from Windows, nor production readiness from a local build.
