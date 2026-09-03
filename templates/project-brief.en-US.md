# Project Brief Template

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](project-brief.es-419.md) · [Home](../README.en-US.md)

## Instructions for Use

This template is proposed for consuming projects created in a location separate from this foundation. No approved stable release exists yet: do not adopt this draft as though it were one or invent its identity. Its structure and fields remain pending approval according to [foundation governance](../docs/foundation-governance.en-US.md); supporting basis and limits are recorded in [traceability](../docs/traceability.en-US.md).

When an approved stable release exists, copy that release's template and its counterpart into the consuming project, retaining the language suffixes. Adjust links to the destination and chosen names, and explicitly copy or reference the adopted normative set through an immutable reference and its verification, not just a version name. Replace the bracketed fields in both files; they may remain pending during planning, but must not be declared approved or verified without evidence. An incomplete template is not an approved brief. Record decisions that are still unknown with an owner and a resolution deadline; details must be resolved before the stage that depends on them.

## BRIEF-001 — Identity and Purpose

- Name: [project name].
- External location of the consuming project: [directory or repository separate from this foundation].
- Decision owner: [person or role].
- Problem and audience: [specific need and people who will use the outcome].
- Expected outcome: [observable behavior].
- Approved stable release to adopt: [pending; state a version only when it exists and has been approved].
- Verifiable release identity: [immutable reference to the normative set and file manifest or equivalent; pending].
- Integrity verification: [digest, algorithm, trusted origin for comparison, date, and check result; pending].
- Adoption approval: [owner, date, and exact release; pending until verification is complete].

## BRIEF-002 — Scope and Acceptance

- Includes: [features and boundaries of the first delivery].
- Excludes: [explicit exclusions].
- Acceptance criteria: [verifiable conditions for each outcome].
- Assumptions: [assumption, impact, and how it will be confirmed].

## BRIEF-003 — Platforms and Languages

- Profile: [web, desktop, mobile, or a justified combination].
- Planned platforms and versions: [systems, browsers, devices, or architectures].
- Verified platforms: [none until evidence is available; then state the environment and result].
- Documentation languages: Latin American Spanish (`es-419`) and US English (`en-US`), in separate files.
- Interface languages and regional formats: [define according to users; not applicable if there is no interface].

## BRIEF-004 — Design and Tools

- Languages and tools: [choices and required versions].
- Components and responsibilities: [minimum necessary structure].
- Contracts: [relevant inputs, outputs, errors, and integrations].
- Dependencies: [benefit, provenance, license, version control, and installation verification; do not assume binary reproducibility].
- Code conventions: [naming, formatting, and chosen checks].
- Important decisions: [decision, alternatives, rationale, and consequences].

## BRIEF-005 — Data, Security, and Recovery

- Data used and sensitivity: [what data is needed and why].
- Storage, retention, and deletion: [location, duration, and handling].
- Trust boundaries and validation: [untrusted sources and controls].
- Protected operations and authorization: [permissions, where they are checked, and tests].
- Configuration and secrets: [secure mechanism and variable names; never real values].
- Risks of loss and recovery: [operations, authorization, and verified strategy when applicable].

## BRIEF-006 — Quality Targets and Verification

- Tests: [behaviors, boundaries, and critical flows to verify].
- Accessibility: [targets and checks, or justification for non-applicability].
- Performance: [measurable targets and measurement conditions].
- Compatibility: [matrix and planned checks].
- Security and dependency reviews: [method and scope].
- Rule evidence: [rule identifier from the adopted release, evidence obtained, or justified non-applicability condition; separate planned checks from performed checks].
- Definition of done: [how the development workflow checklist applies].

## BRIEF-007 — Setup, Delivery, and Operations

- Setup from a clean environment: [requirements and verified steps].
- Actual commands: [install, run, analyze, test, and build as applicable].
- Example configuration: [location and explanation of dummy values].
- Distribution: [channel, artifacts, and verified platforms].
- Diagnostics and maintenance: [logs without sensitive data, updates, and owner].
- Delivery transition or recovery: [procedure and verification according to the risk].

## BRIEF-008 — Pending Items and Approval

- Pending decisions: [question, owner, and the stage before which it must be resolved].
- Known risks: [risk, impact, and planned measure].
- Consuming project status: [draft, ready to implement, verified, or partial; state the evidence; this is not the foundation's approval status].
- Approval: [responsible person, date, and approved scope].
- Bilingual review: [confirmation of equivalence with the Spanish file].
