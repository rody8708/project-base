# Kotlin Android starter architecture

Technical revision: `1.1.0-draft.1`. Status: candidate, without product approval.

[Español (Latinoamérica)](architecture.es-419.md) · [Home](../README.en-US.md) · [Verification](verification.en-US.md)

## Layer boundaries

```text
app: MainActivity -> TaskViewModel -> TaskService
                                      |      |
                                      |      +--> pure domain
                                      +---------> TaskRepository
                                                     ^
                                                     |
                                            MemoryTaskRepository
```

`core` is a Kotlin/JVM module without Android or Compose. The domain validates and transforms values; it does not access clocks, disks, UI, or networks. `TaskService` coordinates use cases through `TaskRepository` and injected ID/time functions. `MemoryTaskRepository` is a replaceable adapter. `app` depends on `core`; `core` does not depend on `app`. `MainActivity` wires dependencies, and `TaskViewModel` manages observable state for `TaskScreen`.

The repository interface is synchronous because this example only operates on a small in-memory collection. Do not connect a database, network, or expensive work directly to these calls on the UI thread. If the product needs I/O, redesign the asynchronous boundary, cancellation, loading states, and consistency, and verify them before replacing the adapter.

## Example contracts

| Input or action | Observable result |
| --- | --- |
| Title `"  Review  "` | `"Review"`, pending task |
| `null`, number, empty, whitespace only, internal control or line separator | `INVALID_TITLE`; neither generates an ID nor queries the clock |
| 80 code points / 81 | Acceptance / `TITLE_TOO_LONG` |
| ID with 1–100 characters `[A-Za-z0-9_-]` | Accepted; whitespace or empty ID produces `INVALID_ID` |
| Epoch milliseconds between 0 and 8640000000000000, inclusive | Accepted; out of range produces `INVALID_TIME` |
| Duplicate ID when adding | `DUPLICATE_ID`; does not overwrite |
| Toggle an absent ID | `NOT_FOUND`; does not create a task |
| Toggle the same task twice | Returns to the original state |

The time limit is an example policy, not an Android standard or a total-order guarantee. The civil clock records creation here; it does not measure duration. Counts refer to code points, not visible graphemes or bytes; a letter with combining marks may count as more than one. Edges are trimmed before validation; NFC and case conversion are not applied. The domain does not claim to validate people's names or secrets.

`Task` values are immutable. The constructor and `copy` check ID, time, and an already-trimmed title; invalid internal construction throws `IllegalArgumentException`. For external input, `createTask` returns typed errors instead of requiring callers to handle that exception. Unpaired UTF-16 surrogates are also rejected. The repository returns a list separate from its collection and preserves insertion order. `update` applies a pure transformation under the same JVM monitor; success or no modification is the contract. Changing the ID is rejected. The concurrency test covers this memory instance, not database transactions, multiple processes, or a distributed guarantee.

`TaskResult.Success` and `TaskResult.Failure(TaskError)` separate success from failure. Known failures retain their code; dependency exceptions become generic errors without private details. Fatal virtual machine errors are not caught. There are no automatic retries: a future adapter might have applied an effect before failing. The UI preserves the draft on failure, displays a message, and offers reload for non-title errors; reload does not promise recovery from a nonexistent backend.

A confirmed write updates the local list with the `Task` returned by the service, retaining the order of other tasks. Displaying success does not depend on a second read: adding clears the draft after confirmation, and toggling reflects the confirmed state. Reload is a separate operation; if it fails, it displays its error without erasing already-confirmed tasks or changes. This local state does not claim to be a complete snapshot of an external server.

## State, language, and access

A retained ViewModel maintains tasks, draft, error, and language during activity recreation. There is no `SavedStateHandle` or persistence. A suspended app may retain memory or lose it when Android ends its process; returning to the foreground does not promise durable data. The app declares no Internet or storage permissions. Backup rules do not turn memory into storage or certify every device transfer mechanism.

Complete US English resources are the Android fallback; `values-b+es+419` contains only Spanish text. The selector uses localized resources without changing the device's global language. The app does not split resources by language when producing bundles, avoiding dependence on language downloads. Bundle distribution was not tested. `localeConfig` is interpreted starting with API 33; on API 26–32 the internal selector remains available. The lint annotation `tools:targetApi="33"` documents those manifest attributes ignored by older systems; it does not raise the minimum runtime API.

Tasks are native text, not HTML. A labeled field, keyboard action, toggleable row with checkbox role, heading, and live regions provide accessibility semantics. This does not equal an audit with TalkBack, maximum font size, or every assistive technology. The layout uses scrolling and system/keyboard insets; each product must verify its real devices and content.

## What to retain and replace

Retain explicit contracts, layers without reverse dependencies, typed errors, injection, language-specific resources, and verifiable checks. Replace the task domain, limits, ID strategy, clock, storage, appearance, and identity as needed. Separation is conceptual and checked through module dependencies; it does not mandate one architecture for every project.

Before production, decide recovery/persistence, threats, privileges, accessibility, actual minimum support, secure signing, licenses, dependency updates, and release tests. The whole folder can be copied without parent-repository references. Machines, caches, SDK, generated results, and keys are not part of the portable foundation. Copying neither adopts rules on another team's behalf nor approves the resulting product.
