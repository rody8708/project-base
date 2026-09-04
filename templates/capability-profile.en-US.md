# Consumer Capability Profile

Profile revision: `0.1.0-draft.1`  
Status: selection and acceptance template; it does not implement or approve a capability.  
Language: US English (`en-US`)  
[Español (Latinoamérica)](capability-profile.es-419.md) · [Consumer project home](../README.en-US.md)

## How to use this file

For every profile, select exactly one state: `not applicable`, `planned`, or `enabled`. Record the owner and reason. `Enabled` is valid only when the listed guarantees have implementation and test evidence in the consumer project. Remove guarantees that truly do not apply only with a documented threat/risk decision; do not mark an unbuilt feature as complete.

## Universal delivery profile

- State: [planned until the project is verified].
- Owner: [person or role].
- Evidence: [tests, environment, revision, observable results, cleanup].
- Acceptance: validated boundaries; safe public errors; private diagnostics; isolated synthetic tests; versioned migrations when schema exists; TLS and secret management when deployed; backup and restore exercise when data must survive; request identifiers and actionable monitoring; dependency and license review; bilingual documentation kept in sync.

## Human identity

- State: [not applicable | planned | enabled].
- Owner and reason: [owner; why accounts are or are not needed].
- Acceptance when enabled: backend authentication and separate authorization; registration or controlled provisioning; activation when needed; passwordless or reviewed password hashing; recovery; MFA decision based on risk; rate limits; session/token expiry and revocation; secure client storage; logout cleanup; generic errors; audit events; automated success, denial, expiry, replay, and recovery tests.

Provisioned machine tokens alone do not satisfy a human login profile.

## Multitenant SaaS and privacy

- State: [not applicable | planned | enabled].
- Owner and applicable jurisdiction decision: [owner; reviewed obligations].
- Acceptance when enabled: server-derived or server-validated tenant context on every read/write; no client-authoritative tenant, role, plan, or permission; cross-tenant denial tests; ownership-transfer/deletion rules; documented retention; export, correction, and erasure/anonymization behavior appropriate to the product; module/data-source inventory; auditable sensitive operations; legal documents owned outside source-code claims where required.

Do not copy fixed privacy endpoints or grace periods from another product without a product and legal decision.

## Payments, subscriptions, and licensing

- State: [not applicable | planned | enabled].
- Owner and provider decision: [owner; provider and supported countries/currencies].
- Acceptance when enabled: provider behind an application port; secrets only in backend configuration; server authority for prices, plans, entitlements, and limits; idempotent creation/change operations; verified and replay-safe webhooks; stable internal states; reconciliation and retry policy; refunds/disputes/tax responsibility defined; synthetic or sandbox tests for success, duplicate, delayed, invalid-signature, and uncertain outcomes.

No specific payment provider or framework is mandatory. The adapter owns its wire protocol.

## Secure mobile client

- State: [not applicable | planned | enabled].
- Owner and target platforms: [owner; Android/iOS/desktop targets].
- Acceptance when enabled: API is the only backend boundary; no direct production database connection; tokens stored in platform secure storage; protected navigation revalidates backend state; logout, user change, tenant change, and revocation clear or rescope sensitive state; backend remains authoritative for permissions and entitlements; denied/offline/error states are localized and tested; device permissions are minimal and documented.

## Offline cache and synchronization

- State: [not applicable | planned | enabled].
- Owner and offline scope: [owner; operations allowed offline].
- Acceptance when enabled: cache matrix documents data, scope, expiry, invalidation, and encryption; pending/syncing/failed/conflict/synced states are visible; writes have stable client identities or idempotency keys; conflicts follow an explicit product rule rather than silent overwrite; retries do not duplicate uncertain writes; synchronization is tested across restart, expiry, conflict, partial failure, identity change, and tenant change.

A read-only cache does not need to pretend it supports offline editing.

## Release and distribution

- State: [planned until distribution is verified].
- Owner and channels: [owner; web hosting, stores, installers, packages, or internal delivery].
- Acceptance: semantic version and build identity are consistent; technical changelog exists; user-visible releases have `en-US` and `es-419` notes when those audiences are supported; signing keys and store credentials never enter Git; rollback or recovery is defined; artifacts are tied to the tested revision; unsupported platforms remain explicitly pending.

## Approval

- Selected profiles reviewed by: [person or role].
- Revision and date: [immutable revision; date].
- Remaining blockers: [item, owner, and required evidence].
- Status: [draft | ready to implement | partially verified | verified for stated scope].
