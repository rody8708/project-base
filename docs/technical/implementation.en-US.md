# Reusable Technical Bases

Technical revision: `1.1.0-draft.1`  
Status: implementation under evaluation; does not replace the approved documentary release.  
Language: US English (`en-US`)  
[Latin American Spanish version](implementation.es-419.md) · [Home](../../README.en-US.md)

## Authorized Scope

The user authorized executable bases and expanded the scope with Kotlin, backend, databases, and a framework-free HTML/CSS/JavaScript base. Final applications will be created outside this project. Six independent templates are maintained: [React web](../../starters/web/README.en-US.md), [native web](../../starters/web-vanilla/README.en-US.md), [Flutter for desktop and mobile](../../starters/flutter/README.en-US.md), [native Android Kotlin](../../starters/kotlin-android/README.en-US.md), [PHP/Laravel API](../../starters/backend-php/README.en-US.md), and [TypeScript/Node API](../../starters/backend-node/README.en-US.md). They are not final products or a requirement to use these technologies in every project. The [option comparison](technology-choices.en-US.md) explains the selection.

Documentary release `1.0.0`, its ZIP, and its receipts remain unchanged in `releases`. Adding code does not change its identity. Historical documents describe the preapproval snapshot; the [receipt](../../releases/approval-1.0.0.en-US.md) establishes that release's status. Older checks run against its recovered package rather than imposing its fixed 32-file inventory on this extension.

## Architecture Decisions

- Domain: data, invariants, and pure operations, without importing visual components.
- Application: coordinates use cases against repository contracts; dependencies can be replaced to test failures.
- Adapters: in-memory repository and visual interface; boundaries with future storage or services remain explicit.
- Composition: the entry point connects the pieces. The task example is replaceable, not a business requirement for consumers.

These responsibilities do not prescribe a framework. An implementation may use an existing framework or an architecture built from scratch by the team, provided that it preserves verifiable boundaries and evidence proportional to risk. A new architecture starts as a candidate: describing known patterns does not give it inherited maturity, and it becomes consolidated only after its decisions are implemented, tested, and reviewed. Building a custom architecture also does not require reimplementing every protocol, driver, or sensitive primitive; those dependencies are selected and isolated explicitly.

The separation is local and proportionate. Clients lose their in-memory data when their instance ends; on the web, a full page reload also discards it. Reading the in-memory repository again does not delete its data. The backends add persistence, tokens, and authorization; PHP has the broad SQLite/PostgreSQL/MySQL matrix while Node retains documented limits. Payments and external services were not added.

The [API boundary between clients and backend](api-boundary.en-US.md) has been adopted: when a remote backend exists, the API will be the sole communication boundary and no interface will directly access its database or implementation. This decision decouples internal technologies; it does not remove the shared contract. The [HTTP integration](api-integration.en-US.md) now implements a common contract and client adapters with local tests. Production security and operations remain product-specific work.

The official [Flutter architecture guide](https://docs.flutter.dev/app-architecture/guide) describes separation of responsibilities; this specific layout is a project choice, not certification or the only correct architecture.

## Technologies and Versions

Both web bases use HTML for structure and semantics, CSS for presentation and responsive layout, and JavaScript for behavior. In `starters/web`, the interface produces HTML elements from `src/ui/App.tsx` and uses its own CSS in `src/ui/styles.css`. Behavior is authored in TypeScript/TSX and transformed into JavaScript, with React, Vite, and Node `24.16.0` as the selected tools. Direct versions are pinned and `package-lock.json` is present; the README identifies versions and procedures actually checked. The TypeScript compiler is selected conservatively and is not presented as the newest version.

`starters/web-vanilla` is the implemented framework-free alternative: `index.html`, `styles.css`, and JavaScript modules in `src/`. It has no third-party npm dependencies and no build step. Node `24.16.0` is the reference environment for tests and the development server; the browser uses the files directly over HTTP. Its local server is not a business backend or production configuration. HTML retains visible information without JavaScript, but the interactive list requires it. Contracts and tests are its own; React evidence does not automatically transfer to this variant.

Desktop/mobile uses the existing Flutter SDK `3.35.1`, revision `20f8274939`, and Dart `3.9.0`, with `pubspec.lock`. The global SDK was not upgraded and licenses or accounts were not changed. Pinning identifies the tested environment; it does not claim the newest version or indefinite maintenance. Future upgrades must review dependencies, platform requirements, and rerun checks for affected targets.

Choosing Flutter allows shared rules and interface code with separate host projects. Official documentation describes [desktop compilation](https://docs.flutter.dev/platform-integration/desktop); a Windows result is not evidence for macOS or Linux. [Building iOS requires macOS and Xcode](https://docs.flutter.dev/deployment/ios). Pages consulted on 2026-09-02 describe newer SDK versions; this delivery's commands are judged by their recorded executions, without attributing universal compatibility to them.

## External Setup and Adoption

Kotlin and Laravel maintain their own versions and locks without forcing them to match Flutter or web dependencies. Exact tools and matrices appear in each README. PHP uses SQLite to start without a separate database server; PostgreSQL and MySQL have separate profiles and tests. Evidence for one engine does not transfer to another through use of the same framework.

The [exporter](../../tools/README.en-US.md) creates a new destination outside the repository and copies source code, lockfiles, and instructions. It excludes caches, installed dependencies, and known secret or local configuration files by name. It is not a detector for secrets embedded in arbitrary files: source code still requires review. It includes the approved documentary release and a provenance record; it does not automatically approve consumer adoption.

Each export works without importing files from this foundation. Installation, tests, and, where applicable, builds are repeated from the copy to detect hidden dependencies; `web-vanilla` has no build step. Application identifiers, publisher names, signing, and distribution channels are examples or consumer decisions still to make; packages are not published under someone else's identity, and debug signatures are not presented as production distribution.

## Maintenance Checks

From the root, with Node available:

```text
npm ci --ignore-scripts
npm test
npm run check
```

`npm run check` checks Markdown pairs in both directions, local links, and the approved ZIP's hash; it does not replace semantic review or application tests. `npm test` tests the checks and exporter with positive and negative cases. Platform details and results are in [technical verification](verification.en-US.md).

The [CI configuration](../../.github/workflows/technical-bases.yml) is manual and has not run on GitHub. It defines web/maintenance jobs, Flutter jobs per system, Kotlin Android, and PHP with SQLite. The web job checks both `web` and `web-vanilla`. MySQL/PostgreSQL and native instrumentation have separate local procedures; the YAML does not claim to run them. No remote repository, publication, or accounts have been created. Actions are pinned to full revisions following [GitHub security recommendations](https://docs.github.com/en/actions/reference/security/secure-use), with read permissions and no persisted checkout credentials.

`actions/checkout` v7.0.1, `actions/setup-node` v7.0.0, `actions/setup-java` v6.0.0, `subosito/flutter-action` v2.23.0, and [setup-php](https://github.com/shivammathur/setup-php) 2.37.2 were checked in their original repositories. CI explicitly pins npm 11.17.0: Node 24.16.0 does not bundle that npm version by default. Android packages are prepared only on the ephemeral runner; this machine's global SDKs were not changed. Java 21 in CI is a declared line whose resolved revision is recorded with the environment; runner system libraries are not a bit-for-bit frozen image. Having the YAML does not mean those builds have passed.
