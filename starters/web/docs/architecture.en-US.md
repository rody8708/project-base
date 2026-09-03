# Web Template Architecture

Technical revision: `1.1.0-draft.1`  
Status: local technical candidate.  
Language: US English (`en-US`)  
[Español latinoamericano](architecture.es-419.md) · [Home](../README.en-US.md)

## Dependency Direction

```text
main.tsx (composition)
  ├─ ui → application → domain
  └─ adapters → application contract + domain
```

This separation is a small local decision, not a universal architecture. There are no injection containers, base classes, buses, generic repositories, or layers without their own work.

| Piece | Responsibility | What It Does Not Know |
| --- | --- | --- |
| `domain/task.ts` | Validates values, creates tasks, and changes state without modifying the previous task. | React, DOM, network, the real clock, and storage. |
| `application/task-service.ts` | Coordinates adding, listing, and toggling; receives a repository, ID source, and clock. | Concrete storage and interface controls. |
| `adapters/memory-task-repository.ts` | Stores tasks in a private `Map` and returns immutable copies. | React and translations. |
| `ui/App.tsx` and `ui/locales` | Present state and typed errors; translate labels, not user data. | The internal `Map` structure. |
| `main.tsx` | Builds dependencies and starts React. | It does not invent additional domain rules. |

## Example Contracts

A title must be nonempty text after trimming surrounding whitespace, contain no internal C0/C1 controls, and have at most 80 Unicode code points. No cultural normalization, correction, or automatic translation is applied. Identifiers contain 1 to 100 ASCII alphanumeric, hyphen, or underscore characters. Creation time is a safe integer of milliseconds since the Unix epoch from `0` through `8640000000000000`; it is example data, not an elapsed-time clock.

Errors return as `Result<T>` with `ok: false` and a known code. The service checks the title before consuming an ID or consulting the clock. Unexpected repository exceptions become `STORAGE_UNAVAILABLE`, without private details or automatic retries. An uncertain result does not necessarily mean a remote adapter did not apply an operation.

The `update` contract applies a pure transformation atomically to the current task or fails unchanged. The memory adapter does not `await` between reading and replacing. This prevents losing two concurrent changes within that instance and process; it does not establish distributed transactions or cross-process safety. Identity cannot change, and adding a duplicate identity does not overwrite data. A future adapter must preserve that contract with its own controls and tests.

React keeps a draft and a result list; it blocks simultaneous interface actions while an operation completes. If adding fails, it neither discards the draft nor invents success. If refreshing after a write fails, it reports that the result could not be confirmed and allows another listing before repeating the action. The list can grow without persistence or a quantity limit: it is not presented as production storage.

## What Is Shared and What Is Adapted

Pure rules and use cases can be reused when the new product retains their contracts. The repository, text, styles, and interface are replaceable adapters. Copying the domain into a mobile or desktop product does not validate its permissions, storage, accessibility, or lifecycle.

In a product with a backend, validation and authorization must also exist in the trusted environment protecting the data. This template does not include that environment. It does not select authentication, persistence, routing, SSR, deployment, or providers either: adding them requires explicit scope and corresponding tests.

## Verification and Maintenance

Domain tests cover normal inputs, emptiness, wrong types, controls, and Unicode, ID, and time boundaries. Application tests check injected dependencies, errors, duplicates, instance isolation, and concurrent memory updates. Components are checked through labels and roles in `jsdom`; private React state is not inspected.

A build does not replace type checking, and `jsdom` does not replace a real browser or an accessibility review. The [record](verification.en-US.md) separates observed results from those limits. When replacing the example, retain tests that detect its new contracts, not merely test files that keep passing without representing the product.
