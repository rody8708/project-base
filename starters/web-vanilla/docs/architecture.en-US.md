# Framework-free web foundation architecture

Technical version: `1.1.0-draft.1`. Status: unapproved technical proposal.

[Español (Latinoamérica)](architecture.es-419.md) · [Home](../README.en-US.md) · [Verification](verification.en-US.md)

## Boundaries and responsibilities

```text
main.js: explicit composition
  DOM view <-> task-controller -> task-service -> repository
                                 |                |
                                 v                v
                             domain/task <--- memory Map
```

| Module | Responsibility and boundary |
| --- | --- |
| `src/domain/task.js` | Validates title, ID, time, and state; creates frozen values and lists. No DOM, global clock, network, or storage. |
| `src/application/task-service.js` | `list`, `add`, `toggle` use cases; receives repository, `nextId`, and `now`. Returns explicit results. |
| `src/adapters/memory-task-repository.js` | Implements `list`, `add`, `update`; hides the `Map`, rejects duplicate IDs, and returns valid snapshots. |
| `src/ui/task-controller.js` | Tasks, draft, language, errors, notices, and in-flight operation state; explicit render callback. |
| `src/ui/dom-view.js` | Translates state into nodes and events for this specific UI; does not implement a general component engine. |
| `src/main.js` | Connects adapters, service, controller, and view; does not duplicate domain rules. |
| `src/i18n/` | One message object per language; stable machine keys and matching placeholders. |
| `scripts/` | Local checking and server tools; not part of the domain or a backend. |

Port contracts use functions and runtime validation; there are no TypeScript interfaces or dependency-injection container. Imports are ES modules. Node supports this module organization; the candidate's particular profile is declared in its manifest. [Node.js 24.16.0: ECMAScript modules](https://nodejs.org/download/release/v24.16.0/docs/api/esm.html).

## Data and errors

A task contains only `id`, `title`, `completed`, and `createdAtMs`. Exact limits are in the [README contract](../README.en-US.md). Freezing is sufficient for these flat values with primitive fields; no general deep-immutability system is offered.

The service distinguishes success (`ok: true`, `value`) from failure (`ok: false`, `error`). Contract and storage codes remain separate from their translations. Unknown repository exceptions become `STORAGE_FAILURE`; unexpected dependency failures become generic codes. Arbitrary exception messages are not presented as UI text.

The controller incorporates only confirmed results and also validates the value received from the service. A failure retains previously confirmed tasks; the draft is cleared only after a successful addition. Writes are not automatically retried: a future remote adapter could commit a change before losing its response. Such an adapter would need its own idempotency and conflict-resolution contract.

A render callback failure is a fatal defect in this mounted UI, not a storage failure to retry. The controller releases `busy`, retains already-confirmed changes, and propagates the exception; the view handles that failure by disabling controls and showing a generic message. Normal continuation after broken rendering or undoing an already-confirmed operation is not promised.

The memory repository's `update` performs a synchronous transform and commit in the same JavaScript context. This does not demonstrate atomicity for a remote database, cross-tab coordination, multiple processes, or distributed concurrency. Copying this class does not transfer that assumption to a backend.

## UI, language, and content

The view operates on this screen's DOM. User titles are assigned as literal text; expressions are not evaluated and entered markup is not interpreted. This choice protects this particular rendering point, not every future extension against XSS.

The controller separates language from data: changing es-419/en-US does not alter titles, IDs, or states. Automatic parity compares keys and placeholder names, not translation quality, design, accessibility, or the cultural correctness of every phrase.

The HTML includes initial content and a notice without JavaScript; subsequent interaction requires JavaScript modules. CSS and the view belong to this example: they are not presented as a complete design system, component library, or certified device support.

## Tools and growth

The server delivers a bounded public snapshot and does not open files from HTTP-supplied paths. HTML checks use narrow rules for the agreed shell; they do not replace a standard parser. The checking command imports locale modules and executes local tests, so use it only with reviewed code. Trusted-directory and development-server limits are in the [README](../README.en-US.md).

Before adding a feature, locate its responsibility and define inputs, results, and failures. For persistence or an API, create an adapter with contract tests and decide authentication, permissions, schemas, migrations, retries, and conflicts. For new screens, evaluate the cost of retaining this simple view or adopting a tool; this delivery does not claim a framework is mandatory or never necessary.

Other web, Flutter, Kotlin, or PHP foundations are not automatically modified or connected here. The consumer chooses a combination and verifies its environment. Having no npm dependencies reduces dependencies to maintain in this example, but does not eliminate maintenance of the code, Node, npm, or browsers.
