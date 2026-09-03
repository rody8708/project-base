# Technical Candidate for Release 1.1.0

[Español (Latinoamérica)](candidate-1.1.0.es-419.md) · [Package](project-foundation-1.1.0-candidate.zip) · [Verification](project-foundation-1.1.0-candidate.verification.json)

Proposed version: `1.1.0`  
Preserved internal revision: `1.1.0-draft.1`  
Status: verified candidate; explicit approval pending.  
License: `MPL-2.0`

## Exact Identity

- File: `project-foundation-1.1.0-candidate.zip`.
- SHA-256: `85fbb1ccaaad6a987b68e09c0767bf3d3ff25cc0ec6635d2f4fd1ea5c53ea848`.
- Size: 1,390,677 bytes.
- Recorded contents: 494 source files and 3,363,402 uncompressed source bytes, plus the internal manifest.
- Local guard: file marked read-only against accidental changes.

## Proposed Scope

The candidate combines the approved documentary core, six exportable technical foundations, shared API contract, reference authentication and authorization, persistence adapters, maintenance and export tools, bilingual documentation, and MPL-2.0. Technical results remain bounded by their records; a stable foundation does not automatically make a consuming project production-ready.

macOS/iOS remain `unverified` until a Mac is available. Linux desktop, physical devices, and each project's production services are not inferred from existing trials either. These exceptions are declared and do not block publication for the scope that was actually verified.

## Verification and Approval

The package was opened, compared with its manifest, recovered into a new directory, and subjected again to a clean maintenance installation, repository check, and 49 tests. The file contains no installed dependencies, builds, runtime state, or recognized secrets.

This document grants no approval. Under governance, the owner must expressly accept this version, complete SHA-256, scope, MPL-2.0, and the exceptions. Approval will create an external receipt without changing the ZIP; any requested change will produce another candidate with a different identity.
