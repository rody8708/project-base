# How to Create an Application With This Foundation

Working revision: `1.1.0-draft.2`  
Language: US English (`en-US`)  
[Español (Latinoamérica)](getting-started.es-419.md) · [Home](../README.en-US.md)

## What It Is For

This repository is not the final application. It is a controlled source of fundamentals, architectural decisions, executable templates, and reusable verification. Its purpose is to prevent every product from starting with improvised boundaries: select a known revision, export only the required components, and develop the product in separate locations.

The recommended structure preserves these dependencies:

```text
project foundation ──exports──> consumer project

web / mobile / desktop ──HTTPS + API contract──> backend
backend ──persistence port + adapter──> SQLite, PostgreSQL, or MySQL
```

Clients do not access the database or import internal backend code. The API contract is the only shared boundary. A framework can help, but it is not mandatory; preserving contracts, separation, tests, and evidence is mandatory.

## If You Do Not Know How to Program Yet

The foundation can guide you and prevent improvised decisions, but it does not replace learning, development, or human review. You will need a developer or coding assistant to run commands, adapt the code, and build your product's specific features.

Before selecting technologies, write down in plain language:

- What problem the application solves.
- Who will use it.
- The three essential features of its first version.
- Which devices it must support.
- What information it will store and who may see or modify it.

With those answers, a developer or assistant can use the following sections to select components. If a decision is not understood yet, record it as pending; do not invent an answer or claim it is ready.

## 1. Select Components

Choose only what the product needs:

| Need | Available foundation |
| --- | --- |
| Web with React, TypeScript, and Vite | [Web](../starters/web/README.en-US.md) |
| Web with HTML, CSS, and JavaScript, without a framework | [Native web](../starters/web-vanilla/README.en-US.md) |
| Shared mobile and desktop client | [Flutter](../starters/flutter/README.en-US.md) |
| Native Android or features Flutter does not cover adequately | [Kotlin Android](../starters/kotlin-android/README.en-US.md) |
| PHP backend with Laravel and three SQL engines | [PHP backend](../starters/backend-php/README.en-US.md) |
| Custom TypeScript/Node backend without an application framework | [Node backend](../starters/backend-node/README.en-US.md) |

Using multiple clients, choosing either backend, creating another backend from scratch, or replacing any adapter is valid. Do not copy every starter by default.

## 2. Select a Verifiable Revision

- For maximum reproducibility, adopt frozen technical release `v1.1.0`, its package, and its integrity receipts.
- To include later maintenance, adopt an exact commit from `main`, rerun the checks, and record that it is not automatically another stable release.
- In either case, approval of the foundation does not approve the new product. Its adoption, identity, risks, and deployment require their own evidence.

First define the product with the [project brief template](../templates/project-brief.en-US.md). Record scope, owners, clients, backend, storage, contract, threats, data, platforms, and acceptance criteria before turning provisional choices into architecture.

## 3. Export to New Locations

### Recommended simple path

From the Project Base root, run:

```powershell
npm run create-app
```

The assistant asks in ordinary language what to create, the preferred backend when needed, a name, and an existing folder in which to save it. It generates one solution with `app/` and/or `api/`, a `project-base.json` manifest, and `START-HERE.es-419.md` and `START-HERE.en-US.md` files. Open the indicated `START-HERE` file and run its blocks; manual template selection is unnecessary.

The assistant does not install dependencies, use credentials, publish, or overwrite folders. If preparation remains incomplete, it retains the identified folder for inspection and does not present it as completed.

### Advanced path

The tool creates a destination that does not yet exist. Each command produces an independent project, so a solution with an API and web client can use sibling folders or separate repositories:

```powershell
node tools/create-project.mjs --template backend-php --name example-api --destination "D:\products\example-api"
node tools/create-project.mjs --template web --name example-web --destination "D:\products\example-web"
```

You can replace `backend-php` with `backend-node`, or the client with `web-vanilla`, `flutter`, or `kotlin-android`. The complete option, restriction, and excluded-file reference is in the [exporter instructions](../tools/README.en-US.md).

After each export:

1. Review `foundation/adoption.json`, the receipt, and hashes; do not change their meaning to imply approval.
2. Complete both `foundation/capability-profile` language files. Mark each profile not applicable, planned, or enabled; never call it enabled without implementation and evidence.
3. Initialize version control for the consumer project.
4. Replace visible names, domains, package names, bundle/application IDs, namespaces, and example configuration. Retain notices required by the license.
5. Install dependencies and run the tests specified by the exported README before adding features.

## 4. Fix the Contract Before Connecting Clients

The [API boundary](technical/api-boundary.en-US.md) defines responsibilities, authentication, errors, compatibility, and the prohibition on direct persistence access. The [executable integration](technical/api-integration.en-US.md) demonstrates the pattern exercised by the starters.

For the consumer product, maintain a canonical, versioned OpenAPI specification. The backend implements it; each client generates or implements its HTTP adapter against it. Screen models and SQL models remain internal. An incompatible change requires a new version or an explicit migration, not a silent modification.

## 5. Keep Persistence Replaceable

Application logic depends on a repository interface or port. SQLite, PostgreSQL, and MySQL connect through adapters that implement that port. Changing engines requires configuration, migrations, and adapter tests, but it must not change the public API contract or force client modifications. Read the [technology and data selection](technical/technology-choices.en-US.md) criteria.

Abstraction alone does not guarantee compatibility. Test constraints, transactions, Unicode, migrations, concurrency, backups, and restoration on every engine the product claims to support.

## 6. Complete Identity, Authentication, and Authorization

The starters demonstrate provisioned tokens, permissions, and resource ownership. A real application must also decide user registration or provisioning, secure password storage when applicable, sessions or token renewal, revocation, recovery, MFA when risk requires it, roles, auditing, attempt limits, and secret handling.

Implement these decisions behind the API boundary. No client should receive server secrets or decide by itself an authorization that protects data.

## 7. Build in Vertical Slices

Add one capability at a time: contract, domain rule, persistence, endpoint, client adapter, interface, and tests. The [development workflow](development-workflow.en-US.md) defines review, small changes, traceability, and completion criteria.

A common layout can be:

```text
product/
├── api/                 # independent backend
├── clients/
│   ├── web/             # optional client
│   ├── mobile/          # optional client
│   └── desktop/         # optional client
├── contracts/openapi/   # canonical API contract
├── docs/                # product decisions and operations
└── foundation/          # adopted revision, receipts, and evidence
```

A monorepo is not required. In separate repositories, publish or pin the contract with an immutable version and require every consumer to verify it.

## 8. Validate Before Calling the Product Stable

Run unit, contract, integration, migration, and end-to-end tests in isolated environments. Then complete the [security and production](technical/security-production.en-US.md) controls and record the result without expanding what the evidence proves. This foundation's [stability status](technical/stability-status.en-US.md) is a reference for distinguishing approved, pending, and unverified work.

Local simulation can prepare TLS, secrets, services, databases, failures, load, backup, and restoration. Final product validation must also check its real infrastructure, monitoring, domain, certificates, provider, supported devices, and recovery process. macOS/iOS remains pending until a suitable Mac is available; do not hide that limitation or let it block products that do not claim those platforms.

## When Adoption Is Ready

The foundation is correctly adopted when the consumer project identifies an exact revision, retains its receipts, has its own identity, uses the API as the only client-server link, isolates persistence through adapters, implements its real security model, passes tests for its declared platforms and engines, and documents owners and pending work. Product construction starts from there; application code is not stored by modifying this foundation.
