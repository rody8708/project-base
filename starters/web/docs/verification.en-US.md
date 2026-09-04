# Web Foundation Sources and Verification

Technical revision: `1.1.0-draft.2`  
Status: local technical candidate.  
Language: US English (`en-US`)  
[Español latinoamericano](verification.es-419.md) · [Home](../README.en-US.md)

## Focused follow-up — 2026-09-04

The revision 2 theme change passed type checking, 45 automated tests, and a production build. Microsoft Edge was driven at 390×844 with explicit light and dark preferences: computed root/panel colors changed from `rgb(244, 246, 245)` / `rgb(255, 255, 255)` to `rgb(16, 23, 21)` / `rgb(23, 33, 30)`, with no console errors. The broader baseline below belongs to revision 1 and was not relabeled as a new full audit.

## Tool Selection

Access date: `2026-09-02`. Versions and constraints were checked using `npm view <package>@<version> version engines peerDependencies license --json` and the primary sources below. Publisher-declared compatibility does not replace installing and checking the combination. No canary, beta, or release candidate versions were selected.

| Direct Dependencies | Pinned Version | Declared License |
| --- | --- | --- |
| `react`, `react-dom` | `19.2.8` | MIT |
| `typescript` | `5.9.3` | Apache-2.0 |
| `vite` | `8.2.2` | MIT |
| `@vitejs/plugin-react` | `6.1.1` | MIT |
| `vitest` | `4.1.11` | MIT |
| `@testing-library/react` | `16.3.3` | MIT |
| `@testing-library/dom` | `10.4.1` | MIT |
| `@testing-library/user-event` | `14.6.7` | MIT |
| `@testing-library/jest-dom` | `7.0.1` | MIT |
| `jsdom` | `30.0.1` | MIT |
| `@types/node` | `24.13.3` | MIT |
| `@types/react` | `19.2.18` | MIT |
| `@types/react-dom` | `19.2.5` | MIT |

There are 14 direct packages. This metadata inventory does not replace preserving third-party notices or reviewing transitive dependencies when redistributing. Their licenses do not alter the MPL-2.0 assigned to original code.

TypeScript `7.0.2` was already listed as stable when npm was queried, but this first template pins `5.9.3` as a conservative decision and checks that exact version. Vite `8.2.2` and its React plugin `6.1.1` accept Node `^20.19.0 || >=22.12.0`; Vitest `4.1.11` accepts Vite 8 and Node 24; `jsdom` `30.0.1` accepts Node `^24.15.0`. The reference Node satisfies those requirements. The plugin's React Compiler/Babel peers are optional and are not added without need.

## Primary Sources and Limits

- [Node.js 24.16.0 LTS](https://nodejs.org/en/blog/release/v24.16.0): release dated `2026-05-21`; identifies the reference version as LTS. It does not establish that every later patch was tested here.
- [React: building from scratch](https://react.dev/learn/build-a-react-app-from-scratch): build-tool and pattern sections; supports Vite as an option and warns about extra work if a framework is needed. It does not require a router, backend, or SSR for this example.
- [React: versioning policy](https://react.dev/community/versioning-policy): stable `latest` channel; this template retains exact versions, not a moving alias.
- [TypeScript: installation](https://www.typescriptlang.org/download/) and [strict](https://www.typescriptlang.org/tsconfig/strict.html): per-project installation and strict checks. The selected version remains a local decision.
- [Vite: getting started](https://vite.dev/guide/) and [TypeScript](https://vite.dev/guide/features#typescript): requirements and separation of transpilation from type checking. `build` does not replace `typecheck`.
- [Vitest: getting started](https://vitest.dev/guide/) and [environments](https://vitest.dev/guide/environment.html): noninteractive execution and distinction between Node, emulated DOM, and real browsers.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): DOM peer installation and checks based on observable controls rather than private component details.
- [npm ci, CLI 11](https://docs.npmjs.com/cli/v11/commands/npm-ci/): installation from an existing lockfile and rejection of mismatches; it does not promise security or identical binaries.
- [Vite environment variables](https://vite.dev/guide/env-and-mode): client exposure of `VITE_` variables; do not store secrets there.

Documentation pages may change. The date, consulted section, and exact selection in the manifest/lockfile are retained; there is no claim to freeze external sites or attribute the entire architecture to those sources.

## Execution Record

Date: `2026-09-02`. Reviewer: development assistant; not user approval or an independent audit. Observed environment: Windows `win32 x64`, Node.js `24.16.0`, npm `11.17.0`. Results apply to this template, not future implementations.

| Command or Check | Observed Result |
| --- | --- |
| `npm install` | Initial installation and creation of `package-lock.json` passed. |
| `npm ci` | Reinstallation from the lockfile passed; 115 packages installed in this environment. |
| `npm run typecheck` through `npm run check` | Passed, without disabling library type checking. |
| `npm test` through `npm run check` | 41 tests passed in three files: 24 domain, nine application/adapter, and eight component tests. |
| `npm run build` through `npm run check` | Build passed, with local `dist/` output; no deployment. |
| `npm audit --json` | Zero vulnerabilities reported in that query, including development dependencies. |
| `npm ls --depth=0` and installed metadata | All 14 direct packages match the table's exact versions and licenses. |
| `npx --yes npm@11.17.0 --version` | Returns `11.17.0` without replacing global npm; the alternative version selector was checked. |

The complete check was repeated after `npm ci`. Simulated failures include repository rejection, duplicate identity, and rejected initial loading; component checks cover adding, completing, reopening, boundaries, language, and displaying text without interpreting HTML. Task titles do not execute supplied code or HTML handlers.

Interactive validation in a real browser and standalone copying/export are recorded separately by whoever performs them. This type, test, and build record does not presume they occurred or establish operating-system equivalence.

There are no backend, account, database, synchronization, native-platform, or deployment tests: those components do not exist in this template. Component tests with `jsdom` do not certify comprehensive accessibility or compatibility with every browser.
