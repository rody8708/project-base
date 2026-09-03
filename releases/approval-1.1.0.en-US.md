# Approval of Technical Release 1.1.0

Release version: `1.1.0`  
Preserved internal revision: `1.1.0-draft.1`  
Status: approved for the described technical scope and exceptions.  
License: `MPL-2.0`  
Language: US English (`en-US`)  
[Español (Latinoamérica)](approval-1.1.0.es-419.md)

## Approval Authority and Reference

Approver: the user who owns and is responsible for this project. Registration date: 2026-09-03. Recorded by the assistant from the user's explicit response, not by the assistant's own decision or through a digital signature.

In this Codex task, the assistant presented the proposed version, complete SHA-256, MPL-2.0, scope, and exceptions, then asked: “Do you approve this exact package and SHA-256 as stable release `1.1.0`, accepting its scope, the MPL-2.0 license, and the declared exceptions?” The user's immediate response was: “si lo apruebo” (“yes, I approve it”). This response satisfies the local explicit-approval requirement.

## Exact Identity

- File: [project-foundation-1.1.0-candidate.zip](project-foundation-1.1.0-candidate.zip).
- Approved SHA-256: `85fbb1ccaaad6a987b68e09c0767bf3d3ff25cc0ec6635d2f4fd1ea5c53ea848`.
- Size: 1,390,677 bytes.
- Contents: 494 source files, 3,363,402 uncompressed source bytes, and an internal manifest.
- Evidence: [candidate verification](project-foundation-1.1.0-candidate.verification.json) and [bilingual summary](candidate-1.1.0.en-US.md).
- Integrity at approval registration: checked again; the file remained read-only and unchanged.

The physical filename retains `candidate` because it identifies the bytes created before approval. This external receipt assigns stable release `1.1.0` to those bytes; the ZIP is neither renamed nor rewritten, preventing an identity change.

## Accepted Scope and Obligations

Approval covers a reusable foundation consisting of the documentary core; six exportable technical starters—React, native web, Flutter, Kotlin/Android, PHP/Laravel, and application-framework-free TypeScript/Node; a shared API contract; reference authentication and authorization; persistence adapters; export and maintenance tools; `es-419`/`en-US` documentation; and MPL-2.0 licensing.

Approval accepts MPL-2.0 obligations and the recorded limitations. It does not turn the foundation into certification, an independent audit, or production approval for future applications. Each consumer must decide its domain, providers, secrets, deployment, monitoring, load, recovery, and operational controls and verify the actual product.

macOS and iOS remain `unverified` because no Mac is available. Executed Linux desktop or physical-device support is not inferred from available evidence either. Node remains an optional profile with narrower coverage than PHP; the stable release does not declare them equivalent.

## Preservation

This receipt remains outside the ZIP and does not modify its preapproval manifest. The package, this bilingual receipt, and verification record must be preserved together in a trusted location. SHA-256 detects changes from the approved identity but does not authenticate the approver by itself.

Later changes belong to another revision and do not automatically inherit this approval. Adoption by an external project requires checking this hash and recording its own decision.
