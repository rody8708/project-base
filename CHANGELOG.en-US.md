# Project Base changes

[Español (Latinoamérica)](CHANGELOG.es-419.md) · [Home](README.en-US.md)

This file records changes after the frozen technical release `1.1.0`. It does not rewrite or extend that release's approval.

## 1.1.0-draft.2 — 2026-09-04

### Added

- Applicable MUST/SHOULD/NICE engineering standards and an automated architecture ratchet.
- System light/dark appearance, regression checks, and bilingual changelogs for all visual starters.
- A bilingual consumer capability profile for identity, SaaS/privacy, payments/licensing, secure mobile, offline/sync, operations, and distribution.
- Automatic export of the capability profile with SHA-256 inventory in the adoption receipt.
- Safe request correlation and structured operational failure logs in both executable backend starters.
- A bilingual `npm run create-app` assistant that generates complete solutions with `app/`, `api/`, and a specific `START-HERE` guide.

### Changed

- Export receipts identify the exact revision of each selected technical template instead of assigning one revision to every platform.
- The project brief and adoption guide now require an explicit capability selection backed by implementation and evidence.
- PHP and Node backend revisions advance to `1.1.0-draft.2`; exported receipts report that exact revision.
