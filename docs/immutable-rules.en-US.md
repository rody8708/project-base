# Immutable Rules

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](immutable-rules.es-419.md) · [Home](../README.en-US.md)

## Proposed Status and Intended Force

These rules are proposals for review; they are neither approved obligations nor a universal programming standard. “Must,” “must not,” and “obligation” express their intended force only after approval and inclusion in a future stable release adopted by a consuming project. Each rule has a stable identifier, an applicability condition, and proposed minimum compliance evidence. Evidence may be brief and must be proportionate to the risk; it does not require a specific tool or provider. Specifying evidence does not establish that it has already been obtained.

The supporting basis, its limits, and pending decisions for each rule are recorded in [traceability](traceability.en-US.md). Approval, release identity, and changes are governed by [foundation governance](foundation-governance.en-US.md). The name “immutable” describes the intended commitment to the contents of an identifiable stable release; it does not make this draft unquestionable.

For future stable adoption, the proposal is to disallow informal exceptions: a “not applicable” condition requires justification within the rule's approved scope, not a silent waiver. Security rules would also cover prototypes and examples that can be run or shared.

## RULE-001 — Explicit Scope and Outcome

**Obligation:** Before implementing a change, the problem, expected outcome, acceptance criteria, and work boundaries must be defined. An assumption must not be presented as a confirmed requirement, and the scope must not be materially expanded without authorization from the person responsible for the project.

**Applicability:** Every change. A small correction may be described in a few lines.

**Evidence:** A description of the change, verifiable criteria, and a record of assumptions or pending decisions.

## RULE-002 — Contracts and Validation at Boundaries

**Obligation:** Inputs, outputs, and errors at boundaries between modules or systems must have explicit contracts through types, interfaces, schemas, or documentation. Untrusted data must be validated when it enters a trust boundary; visual validation does not replace validation in the layer that protects the operation or data.

**Applicability:** Code with inputs, outputs, or communication between components. This includes files, networks, storage, external links, and operating system messages.

**Evidence:** Identifiable contracts and checks for valid inputs, invalid inputs, and relevant boundary cases.

## RULE-003 — Secrets, Permissions, and Sensitive Data

**Obligation:** Real secrets must not be included in code, documentation, examples, version-controlled files, or logs. Secure configuration mechanisms and the minimum necessary permissions must be used. Each protected operation must check authorization in a trusted layer; hiding an option in the interface is not access control. Unnecessary sensitive data must not be exposed in errors or logs. Client applications must not distribute shared service secrets; those secrets must remain in a trusted environment.

**Applicability:** Every project. Authorization checks apply when protected operations exist; their absence must be explicitly recorded.

**Evidence:** A review of secrets and permissions, examples with dummy values, a review of logs, and tests of allowed and denied access when applicable.

## RULE-004 — Data Protection and Destructive Actions

**Obligation:** Before an operation that may irreversibly delete or transform data, the exact target, scope, and authorization must be confirmed. Authorization may come from a preapproved, verifiable policy covering the operation and its boundaries; a new human dialogue is not required for every deletion. When data must be preserved, an appropriate recovery path must be prepared and verified. Other people's changes must not be overwritten, and a destructive operation with ambiguous scope must not be performed.

**Applicability:** Deletions, migrations, resets, overwrites, and other actions that risk loss, both during development and in the product.

**Evidence:** Approved scope and, when applicable, a backup and restore verification, a reversible migration, or another verified recovery strategy. For temporary data or required permanent deletions, the disposable nature of the data or the authorized deletion and its boundaries are documented.

## RULE-005 — Visible Errors and Consistent State

**Obligation:** A relevant failure must not be hidden or reported as a success. Errors must be explicitly handled or propagated, a consistent state must be maintained, and resources used must be released. Retries must not introduce uncontrolled duplicate effects.

**Applicability:** Operations that may fail or affect resources, state, or external systems.

**Evidence:** Checks of representative failures, resource cleanup, and recovery or retry behavior when applicable. Expected errors may be handled without user-facing messages if the outcome remains correct and the handling is defined.

## RULE-006 — Honest Verification and Reporting

**Obligation:** Every change must be verified against its acceptance criteria and affected behaviors. Executable code must include automated tests proportionate to the risk. A fix for a reproducible defect must add or update a regression test. Valid checks must not be disabled to hide failures, and a test must not be claimed to have passed when it was not run.

**Applicability:** Every change. For documentation, verification covers content, links, and language equivalence. If a necessary check cannot be run, the work is not declared complete: what is missing, why, and its impact are reported.

**Evidence:** Checks performed with results, regression tests when applicable, and explicit limitations. Manual checks complement automated checks when the platform or interaction requires them.

**Defined local decision:** Automation and regression are internal requirements, not universal mandates attributed to NIST. They also apply to maintenance tools and executable examples: automated deterministic cases for contracts and reproducible defects, complemented by manual review for interactions or meaning. Proportionality adjusts depth and cases; it does not remove the requirement where code exists. Documentation-only changes check content, links, and parity without requiring a nonexistent application to compile. A blocked necessary check is reported as pending, not treated as an implicit exception. This policy is scoped and evaluated, but requires release approval.

## RULE-007 — Verifiable Setup and Dependency Control

**Obligation:** The requirements and steps needed to set up, run, and verify the project from a clean environment must be documented. When dependencies are used, their versions must be controlled through the ecosystem's mechanisms, including lockfiles when available, and installation must be verified in the declared environment. Required access and permissions, including how to obtain and configure credentials, must be documented without revealing secrets. Each person must use their own authorized credentials when applicable. The project must not depend on undocumented local paths or implicit configuration.

**Applicability:** Every project; execution and dependency instructions apply when executable code or tools exist. A documentation-only project must declare that status.

**Evidence:** Verified instructions, required versions, secret-free example configuration, and applicable manifests or lockfiles.

**Limit:** A lockfile alone does not demonstrate a working installation or that a build produces identical binaries. Binary reproducibility, if required by a consuming project, needs its own scope, controls, and evidence, separate from verifiable setup and installation.

**Defined local decision:** Identify each dependency's origin, version, and license; use the ecosystem's lock mechanism when available and record exact identity or resolved constraints otherwise. Verify setup in the declared environment without attributing an unexecuted installation to a lockfile. Record preinstalled tools, required access, and unverified steps. Do not select future consumers' dependencies here. Maintenance of this foundation declares and checks its own environment separately.

## RULE-008 — Compatibility and Contract Changes

**Obligation:** Contracts and platforms declared as supported must be respected. A breaking change must be identified, approved, and accompanied by a transition strategy before delivery. Support for a platform or version must not be claimed without verification.

**Applicability:** Interfaces between components, persisted formats, integrations, and declared platform versions. A new project must define its compatibility scope before its first executable delivery.

**Evidence:** A compatibility matrix, relevant checks, and, when applicable, a change note and migration plan.

**Defined local decision:** Distinguish planned, verified, and unsupported targets, including version and environment. Before delivering a breaking change, identify affected consumers, approve it, and check the applicable transition (migration, coexistence, or communicated retirement). A cross-platform library does not validate its adapters or operating systems; a local installation does not validate every version. A first delivery with no previous contracts declares that limit rather than inventing a migration.

## RULE-009 — Change Traceability and Review

**Obligation:** Before delivery, the complete change must be reviewed, its purpose and impact explained, and affected documentation updated. Modifications outside the scope must be separated or explicitly authorized. Decisions that shape future maintenance must retain their rationale and consequences.

**Applicability:** Every change. The review may be a self-review or a review by another person, depending on the risk; the foundation does not require a minimum team size.

**Evidence:** A change summary, a recorded review, and documented significant decisions. If version control is used, each delivery must be traceable to the reviewed changes.

## RULE-010 — Documentation Parity Between Languages

**Obligation:** Each Markdown document maintained by the project must exist in separate files for `es-419` and `en-US`, with the same scope, obligations, identifiers, version, and status. Every modification must update both versions in the same delivery. A contradiction must not be resolved by silently treating one language as superior.

**Applicability:** Documentation and templates maintained by the project. Original third-party files that must be preserved intact, such as licenses, are kept unaltered and identified as external material; they do not replace the project's own documentation.

**Evidence:** Complete file pairs, working links, and a semantic equivalence review. Comparing names or headings is not enough to establish that a translation is correct.

## Rationale for the Proposed Obligations

These reasons are local design decisions, not mandates attributed to an external source. They explain the risk being reduced; they do not replace the obligation or expand its scope. The [documentary scenarios](core-verification.en-US.md) check specific interpretations. Approval of the policies, including automated testing, remains pending.

| Rule | Policy rationale | Boundary to retain |
| --- | --- | --- |
| RULE-001 | Avoid implementing the wrong expectation or expanding work without authorization. | A small change allows a small record; uniform bureaucracy is not required. |
| RULE-002 | Avoid incompatible assumptions and untrusted inputs that bypass controls. | A contract may be a type or brief documentation; formal tooling is not required. |
| RULE-003 | Reduce secret exposure and unauthorized access. | Authorize operations where they exist; do not invent an account system when unnecessary. |
| RULE-004 | Avoid unauthorized loss and merely assumed recovery. | Distinguish data to preserve from disposable data or required permanent deletion. |
| RULE-005 | Avoid false success, leaks, and uncontrolled repeated effects. | Handling an expected error does not always require displaying a message; it must respect the result. |
| RULE-006 | Detect repeatable defects and retain honest change evidence. | Depth depends on risk; documentation checks content and parity, not nonexistent applications. |
| RULE-007 | Avoid project setup depending on one person's hidden knowledge. | Controlling versions does not guarantee successful installation or identical binaries. |
| RULE-008 | Avoid consumers relying on unverified compatibility promises. | Covers only declared contracts and platforms; supporting every platform is not required. |
| RULE-009 | Make changes, rationale, and maintenance consequences understandable. | Self-review or shared review according to risk; no team size or Git requirement. |
| RULE-010 | Avoid language-dependent obligations or outdated instructions. | Applies to maintained documentation; external originals that must be preserved are not rewritten. |

The conditions of all ten rules and their applicable and non-applicable cases are evaluated in [applicability](applicability.en-US.md). Each future consumer's concrete choices belong to that project and are not technical tasks left open in this documentary delivery. What remains here is approval of the exact package's scope and obligations.
