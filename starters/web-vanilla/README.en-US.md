# Web foundation: HTML, CSS, and JavaScript

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical version: `1.1.0-draft.2`. Status: unapproved technical proposal for evaluation; not a finished product.

[Español (Latinoamérica)](README.es-419.md) · [Architecture](docs/architecture.en-US.md) · [Changes](CHANGELOG.en-US.md) · [Verification](docs/verification.en-US.md)

A standalone foundation using HTML, CSS, and native JavaScript modules. It uses no React, TypeScript, Vite, bundler, or third-party npm packages. The task list is a replaceable example: add tasks, complete them, reopen them, reload the in-memory list, and follow the system's light/dark appearance. It includes no backend server or local persistence; HTTP mode delegates persistence to the server. Authentication, offline synchronization, deployment, and certified browser support are not included.

Original code is distributed under [MPL-2.0](LICENSE). External dependencies or materials retain their own licenses.

## Optional API Connection

The contract and HTTP adapters are implemented. Memory remains the default client mode; descriptions of data loss refer to that mode. See the [integration guide](api-integration.en-US.md) for connection setup and limitations. Production authentication is not included.

## Run a local copy

Declared profile: Node.js `>=24.16.0 <25`; reference tools Node.js `24.16.0` and npm `11.17.0`. There is no global framework installation or build step. [package.json](package.json) declares the commands and [package-lock.json](package-lock.json) retains npm identity without third-party dependencies.

From a freshly exported copy's directory:

```powershell
node --version
npm --version
npm run check
npm start -- --port 5180
```

Open `http://127.0.0.1:5180/`, not the HTML file through `file://`. JavaScript is required for interactive actions; the initial Spanish HTML includes a visible `noscript` notice when scripting is disabled and leaves its controls inactive. `noscript` does not replace the application or implement an interactive JavaScript-free mode. [HTML: noscript](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element).

Optionally check npm installation in that new copy before running `check`:

```powershell
npm ci --ignore-scripts
```

The command uses the lock and skips installation scripts; the candidate has no third-party packages to install. `npm ci` may remove an existing `node_modules`: use it in the new copy, not over someone else's material. `--ignore-scripts` does not make `npm run check` code-execution-free; that command intentionally executes reviewed local scripts. [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

Stop the server with `Ctrl+C`. It snapshots public files at startup: restart it after HTML, CSS, or JavaScript changes, then reload the browser. There is no automatic refresh, generated `dist`, or `npm run build`.

## Example contract

| Data or operation | Contract |
| --- | --- |
| Title | String trimmed at its edges; 1–80 Unicode code points. |
| Title content | No internal C0/C1 controls, isolated Unicode surrogates, or U+2028/U+2029 separators; this is not a visual-grapheme limit. |
| ID | 1–100 ASCII characters: letters, digits, `_`, or `-`. The domain does not require a UUID. |
| Creation | `createdAtMs`: safe integer from `0` through `8640000000000000`, inclusive. Not a logical clock or an ordering guarantee across devices. |
| State | `completed` is boolean; completing/reopening creates a new value. |
| Repository | Memory of this page instance, with unique IDs and insertion order. |

Edge trimming occurs before validating the remaining content: for example, a newline only at the edge may disappear during trimming. Text is not normalized to NFC. Titles are rendered as literal text, not interpreted as HTML. Task and list snapshots are frozen and do not expose the internal `Map`.

“Reload list” queries the current repository and retains tasks. Reloading or closing the page destroys that memory; another tab holds another instance. No `localStorage`, IndexedDB, or SQL database is used. The foundation does not implement title editing or task deletion.

The service receives an explicit repository, ID generator, and clock; local composition uses `crypto.randomUUID()` and `Date.now()`. Creation time is retained as data, but this UI does not display dates. An invalid dependency or failed operation returns a stable code; UI messages are translated separately. There are no automatic retries or optimistic change confirmations. The controller prevents another data operation while busy and retains already-confirmed state on failure.

## Languages and structure

Text is separated into [es-419](src/i18n/es-419.js) and [en-US](src/i18n/en-US.js), one file per language. The selector changes UI messages; error codes and entered titles are not translated. The HTML's initial language is deterministically Latin American Spanish; a browser preference is neither detected nor persisted. Reloading the page resets es-419. Language selection does not imply certified support for other regions.

The organization is intentionally small: domain, service, in-memory repository, controller, and DOM view. It is not a general component framework or universal state system. Read [architecture](docs/architecture.en-US.md) before replacing the domain or adding persistence.

## Local server and limits

[scripts/serve.mjs](scripts/serve.mjs) uses [scripts/server.mjs](scripts/server.mjs), built-in Node.js modules, and exclusively `127.0.0.1`. The default port is `5180`; an occupied port causes an error without stopping its owner or silently selecting another.

Only `/` or `/index.html`, `/styles.css`, `/favicon.svg`, and allowed `.js` modules under `/src/`, including locales, are served. `scripts`, `tests`, `docs`, npm manifests, `.env`, and `foundation/` are not served; neither are directory listings or application-route fallbacks. Do not place secrets in public files even when the server is local.

The server limits its snapshot to 512 files, 1 MiB per file, and 8 MiB total. It rejects detected links, encoded/ambiguous paths, and requests with unsupported `Host` or origin; only `GET` and `HEAD` are allowed. Its development headers restrict inline code and page connections. They are not authentication, TLS, or a sandbox against malicious processes changing the filesystem. Use only a trusted local directory without concurrent changes during startup.

Do not expose this server to a public network, use it for production hosting, or present its tests as a comprehensive security audit. Adding an API requires reviewing connection policy, contracts, credentials, and authentication; removing a header is not sufficient.

## Verification and adoption

`npm run check` checks syntax, agreed HTML resources, locale-key/placeholder parity, and runs local tests. It is a bounded example checker, not a complete HTML parser, compiler, accessibility audit, or test of every browser. Tests may create and remove their own temporary fixtures and open ephemeral loopback ports.

Actually observed results, versions, and limits are in [verification](docs/verification.en-US.md). When exported from the foundation repository, `foundation/adoption.json` keeps consumer adoption pending and the technical template unapproved. Approved documentation `1.0.0`, when attached, retains an independent documentary scope. This foundation works without importing documents from outside its directory.
