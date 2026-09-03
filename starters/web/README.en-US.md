# Reusable Web Foundation

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical revision: `1.1.0-draft.1`  
Status: local technical candidate; not a new approval of the documentary foundation.  
Language: US English (`en-US`)  
[Español latinoamericano](README.es-419.md) · [Architecture](docs/architecture.en-US.md) · [Sources and verification](docs/verification.en-US.md)

This folder is a standalone executable template: copy it in full to your new project's location. It needs no files, packages, paths, or services from the original repository. The task list is a replaceable example, not a finished application or a promise that every future product has already been validated.

Original code is distributed under [MPL-2.0](LICENSE). Dependencies retain their own licenses and notices.

## Optional API Connection

The contract and HTTP adapters are implemented. Memory remains the default client mode; descriptions of data loss refer to that mode. See the [integration guide](api-integration.en-US.md) for connection setup and limitations. Production authentication is not included.

## Requirements and Setup

Reference environment: Node.js `24.16.0` and npm `11.17.0`. The manifest accepts Node `>=24.16.0 <25` and npm `>=11.17.0 <12`; that range states requirements, not tested support for every combination. Installation needs public npm registry access and write permission in your copy. No accounts, credentials, global installation, backend, or external services are required.

Node.js `24.16.0` shipped with npm `11.13.0`: installing that Node does not guarantee the required npm. If your npm does not meet the range, you can use npm `11.17.0` without replacing the global installation. From your copy, use these commands instead of their `npm` equivalents:

```sh
npx --yes npm@11.17.0 --version
npx --yes npm@11.17.0 ci
npx --yes npm@11.17.0 run check
npx --yes npm@11.17.0 run dev
```

`npx` may download that specific version into the local cache and runs it; it does not change global npm. Check that the first command returns `11.17.0`. The same prefix works for `test`, `audit`, or `run preview`.

If your Node and npm already meet the requirements, enter your standalone copy and run:

```sh
node --version
npm --version
npm ci
npm run check
npm run dev
```

Open [the local development address](http://127.0.0.1:5173). Stop the server with `Ctrl+C`. If that port is occupied, the command fails explicitly instead of silently choosing another. `npm ci` installs from `package-lock.json`, rejects manifest mismatches, and replaces an existing `node_modules` in this folder. Do not accidentally run it from another project.

The `check` command checks types, runs tests once, and produces `dist/`. You can also run each command separately:

```sh
npm run typecheck
npm test
npm run build
npm audit
npm run preview
```

The `dist/` preview uses [local port 4173](http://127.0.0.1:4173). It is not a production server and does not publish the project. To repeat tests while editing, use `npm run test:watch` and stop it with `Ctrl+C`. A clean audit does not certify security; retain its date and scope.

## What the Example Demonstrates

- Adding valid titles, completing tasks, and reopening them.
- Validating empty titles, input type, controls, and boundaries in the domain, not only in the interface.
- Displaying loading, empty, result, and explicit error states; retaining the draft when adding fails.
- Switching interface text between `es-419` and `en-US` without translating or losing user tasks.
- Testing rules, use cases, the memory adapter, and components with deterministic dependencies.

Titles are limited to 80 Unicode code points after trimming surrounding whitespace; this does not count visible graphemes. Data lives only in memory and disappears when the page is reloaded or closed. There is no authentication, remote authorization, persistence, synchronization, router, telemetry, or file deletion. Client validation would not serve as a future backend's security control.

## Configuration and Changes

The application works without `.env`. Optionally copy `.env.example` to `.env` to define `VITE_APP_NAME`, a visible, public name. Restart the server after changing variables. Never put secrets in `VITE_` variables: their values can be included in the client.

`src/domain` holds pure rules; `src/application` defines use cases and the repository contract; `src/adapters` implements memory and HTTP storage; `src/ui` contains React, translations, and styles. `src/main.tsx` connects those pieces. Reuse details and limitations are in [architecture](docs/architecture.en-US.md).

Direct versions are exact, and the lockfile records transitive resolution. Dependency changes require checking requirements and licenses, intentionally updating the lockfile, and repeating `npm ci`, `check`, and the audit in a clean copy. Do not use forced upgrades instead of reviewing incompatibility. TypeScript `5.9.3` is an explicit conservative choice, not a claim that it is the latest release.

This template's Markdown files have language counterparts. Update both when scope, instructions, or limitations change. No continuous integration is installed in this folder; checks run locally. Before delivering a real product, define and verify its browsers, accessibility, security, performance, data, and integrations for its scope. Copying the template does not automatically approve that product.
