# Status of the Stable Release

[Español (Latinoamérica)](stability-status.es-419.md) · [Home](../../README.en-US.md) · [Backend architecture](backend-architecture.en-US.md)

Evaluated revision: `1.1.0-draft.1`. Effective release: [`1.1.0`](../../releases/approval-1.1.0.en-US.md). A stable version describes verified scope; it does not mean every possible operating system, provider, or language combination has been executed.

| Condition | Classification | Effect on Stability |
| --- | --- | --- |
| macOS/iOS without an available Mac | Known explicit pending item | Does not block a stable release for verified targets. Those two targets retain `unverified` status; executed support is not promised. |
| Integral review and testing | Completed with declared exceptions | [Technical review](stability-review.en-US.md) passed; the exact identity was frozen, recovered, and approved. |
| Original-code license | MPL-2.0 adopted | No longer blocks publication. The official text, bilingual scope, and a copy in each exportable starter are included. |
| GitHub repository and branch protection | Later publication step | Does not change content quality; it must be configured before public collaboration. A protected branch controls the official repository, not third-party copies. |
| Per-product cloud, KMS, remote backup, alerts, and accounts | Consumer responsibility | Does not block the foundation. The foundation defines contracts and controls; each product selects and verifies providers and credentials. |

## Backend Levels

PHP/Laravel is the broad-coverage executable reference and is not mandatory. TypeScript/Node is a second executable, exportable, application-framework-free base; it is currently a candidate because it lacks PHP's complete matrix. Python, .NET, Go, and JVM are documented options, not falsely claimed implementations.

A stable release may contain optional profiles marked `candidate` when the stable path does not depend on them and their limits are visible. It cannot call them equivalent or transfer evidence. Promoting Node requires closing its pending items or explicitly approving a narrower scope.

## Current Decision

Licensing is resolved under MPL-2.0. macOS/iOS is accepted as a nonblocking pending item because hardware is unavailable. Review, freeze, recovery, and explicit approval of the `1.1.0` identity are complete. The next independent step is publishing those bytes and receipts on GitHub and configuring protection for the official branch.
