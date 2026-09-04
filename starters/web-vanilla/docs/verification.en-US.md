# Framework-free web foundation verification

Technical version: `1.1.0-draft.2`. Status: unapproved technical proposal; an execution result does not constitute consumer approval.

[Español (Latinoamérica)](verification.es-419.md) · [Home](../README.en-US.md) · [Architecture](architecture.en-US.md)

## Focused follow-up — 2026-09-04

Revision 2 passed the source checker and all 86 tests. Microsoft Edge was driven at 390×844 with an explicit dark preference; computed root/workspace colors were `rgb(16, 23, 20)` and `rgb(23, 33, 29)`, with no console errors. The broader baseline below belongs to revision 1 and remains historical evidence.

## Execution record

Local source record: `2026-09-03`, Windows, Node.js `24.16.0` and npm `11.17.0`. `npm run check` exited `0`: 15 JavaScript files checked, 52 keys per locale, 74 passing tests, and none failed, canceled, or skipped.

| Check | Observed result |
| --- | --- |
| `npm ci --ignore-scripts` | Passed; one root package and no third-party dependencies. |
| Syntax, HTML shell, and locale parity | 15 files; agreed resources; 52 matching keys per locale. |
| Domain, service, and repository | 18 passing tests. |
| Controller and locales | 14 passing tests. |
| HTTP server and CLI | 32 passing tests with owned local fixtures. |
| Source checker | 10 passing tests, including cases that must fail. |
| `npm audit --json` | Zero advisories in the recorded query; not a certification of vulnerability absence. |

There is no build step or compiled bundle to declare passed. The absence of third-party npm dependencies is checked in the manifest and lock, not through a supposed compilation.

The npm v3 lock contains only `packages[""]`. Its source SHA-256 is:

```text
aa09cc732f61b0927512577cb9bdd71d9213c590ae952fe6990f3e2391afe473
```

The exporter changes npm root names when preparing another project identity; therefore the exported lock's hash may differ without adding dependencies.

## Repetition and criterion

From a reviewed local copy:

```powershell
node --version
npm --version
npm run check
```

The process must exit `0` with no failed, canceled, or skipped tests. Record the date, operating system, versions, checked files, locale keys, and actual test total. A count without the version or execution context does not demonstrate another copy's state.

The server suite uses its own fixtures and ephemeral loopback ports. It checks resources/MIME, `HEAD`, headers, queries, private paths and traversal, encoding, methods, `Host`, `Origin`, snapshots, links, limits, occupied ports, and shutdown. HTTP port `80` authority/origin acceptance was checked with pure helpers: that port was not opened. These cases do not mean the server has been tested on the Internet or audited against every threat.

Domain/controller tests cover Unicode 80/81 boundaries, IDs and time, frozen snapshots, duplicates, dependency/storage errors, overlapping operations, and render callback failures. Synchronous-adapter interleavings do not demonstrate distributed concurrency.

## Observed browser

Local QA on `2026-09-03` used headless Microsoft Edge on Windows; the user agent reported `Edg/151.0.0.0`. That result is not extrapolated to other browsers, versions, or physical devices.

| Scenario | Recorded result |
| --- | --- |
| Empty list and validation | Empty state visible; empty title and 81 code points rejected; draft retained; 80 code points accepted. |
| Task actions | Added through Enter and button, completed and reopened through Space; focus retained on the checkbox. |
| Languages and literal text | ES/EN retained two tasks and the draft; HTML `lang` changed; a title containing `<b>` appeared literally without creating `b` elements. |
| List/page reload | Reloading the list retained three tasks; completely reloading the page discarded them. |
| Source after finalization | Server restarted to snapshot frozen source, page reloaded, and adding through Enter passed. |
| Reviewed sizes | `1280×900`, `390×844`, and `320×800`; `scrollWidth` matched viewport width, with no observed horizontal overflow. |
| Screenshots | Desktop, mobile, and JavaScript-disabled views inspected visually with satisfactory results for this example. |
| Resources and console | Two-load session: 22 local static requests returned `200`, 11 per load; zero recorded console errors and warnings. |
| JavaScript disabled | Separate `390×844` session: HTML content and `noscript` notice visible, controls disabled. |

Screenshots check those particular presentations, not every possible state. Keyboard testing and labels do not constitute a WCAG audit, screen-reader evaluation, or accessibility certification. The resource count belongs to that session and is not a benchmark.

## Checking a copy

This record applies to the source and QA described above. The exported copy must retain both languages, required modules, and scripts without relying on paths in the original repository. Its checks, lock identity, adoption receipt, and HTTP result are recorded separately to avoid a self-referencing inventory. These results are not automatically attributed to another copy. A successful export is not technical approval and does not waive MPL-2.0 compliance.

## Permanent limits

The candidate does not demonstrate authentication, a backend, persistence after closing the page, cross-tab synchronization, distributed concurrency, deployment, performance under load, data restoration, or comprehensive security. Controller tests without a DOM do not replace real browser interaction; a visual review also does not replace a complete accessibility assessment. Architecture documentation describes this example's decisions, not an exhaustive web-development standard.
