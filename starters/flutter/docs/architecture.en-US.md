# Flutter foundation architecture

Technical revision: `1.1.0-draft.1`  
Status: local technical candidate; not a new approval of the documentation foundation.  
Language: US English (`en-US`)  
[Español latinoamericano](architecture.es-419.md) · [Start](../README.en-US.md) · [Verification](verification.en-US.md)

## Responsibilities and dependency direction

| Location | Responsibility | Deliberate boundary |
| --- | --- | --- |
| `lib/domain/task.dart` | Valid title and immutable task | Pure Dart; no Flutter, storage, or translated messages |
| `lib/application/task_repository.dart` | Read, create, and completion-state contract | Pure Dart; does not assume a database |
| `lib/application/task_controller.dart` | Application state, validation, errors, and reentry exclusion | Uses Flutter's `ChangeNotifier`; not presented as framework-independent domain |
| `lib/infrastructure/memory_task_repository.dart` | Local implementation of the contract | One instance's memory, in a single isolate |
| `lib/presentation/task_app.dart` | Composition, interaction, and presentation | Injects the repository; replaceable with another interface |
| `lib/l10n/strings_es_419.dart` / `strings_en_us.dart` | Messages per language | Session selector, without preference persistence |
| Native runners | Host the Flutter engine | Generation does not test every operating system |

The UI depends on the controller; the controller depends on the contract and domain. The adapter implements the contract. `TaskApp` is the composition point that selects the memory adapter by default and accepts an injected adapter for testing. This separation is a local template decision, not a universal architecture or an obligation to create empty layers in every project.

## Observable contracts

`TaskTitle` trims surrounding whitespace with `trim`, rejects an empty result, controls U+0000–U+001F and U+007F–U+009F and line separators U+2028/U+2029 within that result, and limits the title to 120 Unicode code points. It does not normalize to NFC, measure graphemes, or require unique titles. An emoji outside the basic plane counts as one point; a letter and its combining mark count as two. This is an example policy for the consuming project to reconsider, not a programming standard.

The repository assigns IDs that are unique within its instance and returns immutable lists and items. Two equal titles can create two tasks. `setCompleted(id, true)` expresses a desired state, so repeating it preserves the local result; it does not demonstrate exactly-once delivery or distributed idempotency. An unknown ID produces `notFound` without creating data. The adapter does not suspend its internal mutation with `await`; no thread, isolate, or process safety is claimed.

The controller allows one pending operation per instance. A second action returns `false` without calling the repository; it is neither queued nor retried. Starting an operation clears the previous error; failure preserves the known list and is represented by an error code. `false` can also mean rejected reentry or completion after controller disposal: it is not proof that a remote write did not happen. The UI is disabled during the operation.

After a successful write, the returned item is used without another read that could fail after commit. For this adapter, the outcome is known locally. A future remote API needs an extended contract for deadlines, cancellation, unknown remote outcomes, reconciliation, authentication, and authorization; it must not interpret every exception as absence of effects or add automatic retries to `add`.

## Errors, lifecycle, and data

Validation and repository errors are translated for the person; internal details are not displayed. The controller offers an optional diagnostic callback for unexpected errors. If diagnostics themselves fail, the operation's error is preserved and the secondary exception is not propagated. The example UI does not configure a telemetry service or send data; a consumer adding that callback must define observability and sensitive-information redaction.

The view owns `TextEditingController` and `TaskController` and releases them in `dispose`. A late operation does not update the list or notify a disposed view. This does not cancel a repository effect already started. There are no external subscriptions, files opened by the application, networking, authentication, database, backups, or migrations. Data is lost when the instance ends; the warning is visible. Do not use this implementation for data that must be retained.

## Replacing the example

First define the new product's domain, trust boundaries, and data-retention requirements. Then replace `TaskItem` and its rules; adapt the contract and its tests; implement durable storage or networking with explicit contracts; finally change the UI, text, package IDs, native names, and icons. Revalidate every platform and build mode you intend to deliver. Do not mix storage logic into widgets or assume that an in-memory test demonstrates durable recovery.

Messages are maintained in separate `es-419` and `en-US` files; SDK delegates cover Material controls. The selector does not change the system language or all runner metadata. Controls have labels, the error uses a live semantic region, and the page supports scrolling with the keyboard open. Widget tests cover one specific small size; they are not an accessibility audit, screen-reader test, or coverage of every text scale and device.

[Verification](verification.en-US.md) separates analysis, unit models, widgets, native execution, and artifacts. A passing build does not imply certification for security, accessibility, stores, or availability.
