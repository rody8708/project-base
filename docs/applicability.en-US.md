# Applicability and Initial-Scope Decisions

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](applicability.es-419.md) · [Home](../README.en-US.md) · [Governance](foundation-governance.en-US.md) · [Traceability](traceability.en-US.md)

## Scope of This Evaluation

The proposed first delivery is a common documentary foundation: fundamentals and extensions, quality policies, an advisory workflow, a template, and limited evidence about those documents. It includes four advisory checklists: web; desktop, including macOS; mobile; and cross-platform shared code. It is not an exhaustive programming standard, a selected technology stack, a starter application, or certified technical support for those platforms. Consuming projects are created separately.

This evaluation resolves the documentary applicability of the 39 existing elements through one normal case and one boundary or non-applicable case per element. It examines whether the text and local decisions distinguish an appropriate interpretation from an incorrect one. It does not run the hypothetical cases in products or establish every property mentioned. Sources retain the partial scope recorded in traceability; this matrix adds no external support.

The paired [rules](immutable-rules.en-US.md), [fundamentals](programming-fundamentals.en-US.md), [workflow](development-workflow.en-US.md), [profiles](platform-guidelines.en-US.md), and [template](../templates/project-brief.en-US.md) were reviewed. The input text was revision 0.1.0-draft.3; the scope decisions recorded here form part of proposal 0.1.0-draft.4. Their interpretation does not constitute user approval.

## Local Decisions Resolved for This Proposal

### Automation and Regression

For RULE-006, automated tests remain required wherever executable code is added or modified, including executable examples, with identified contracts, environment, and scope. Proportionality adjusts cases, levels, and depth to risk; it does not authorize indiscriminately removing automation because the work is a prototype, a small project, or a difficult test. A fix for a reproducible defect in that code adds or updates a regression test that distinguishes the defect from the correction. Manual checks complement automated checks when needed for the actual behavior.

A purely documentary change is checked for content, links, and equivalence between languages; it does not require building a nonexistent application. If the document contains affected executable code, that code is also checked within its declared scope. An isolated model does not establish a real integration or device. If a necessary check cannot be run, it remains pending and the scope depending on it is not declared complete. The decision reduces repeatable regressions and unverifiable reporting; it is local policy, not a universal mandate from an external source. Approval remains a separate decision.

### Setup and Dependencies

For RULE-007, local policy is to document necessary tools and versions, setup steps, authorized access, and explicit configuration. When dependencies exist, their identity, provenance, and declared and resolved versions are recorded using the ecosystem's mechanisms, including a lockfile when available. If the ecosystem does not provide one, the equivalent control and resolution mechanism is documented; no mandatory format is invented.

Setup is checked from a declared clean environment: without undocumented project installations or configuration, although it may start from explicitly listed prerequisite tools. The record identifies the environment, steps, outcome, and limitations. A lockfile, command list, or prior demonstration does not replace that execution. Revealing credentials or testing unauthorized access is not required. If there are no dependencies or installation, that condition is stated and the instructions that do exist are checked. The rationale is to remove hidden requirements and make setup differences diagnosable; binary reproducibility is not promised.

### Compatibility and Transition

For RULE-008, local policy is to separate planned, verified, and unsupported contracts and platforms. The declaration identifies relevant versions or conditions and its supporting evidence; a new project defines that scope before its first executable delivery. It does not need to commit to every platform in the checklists.

A breaking change identifies the affected contract, consumers or data, and consequences of the break; it requires authorization and a documented transition before delivery. That transition may include migration, temporary coexistence of versions, or explicit retirement of support according to the contract and authorization, without imposing a single mechanism or perpetual compatibility. Necessary transition checks must have recorded results; a plan alone does not establish that they work. A correction without a contract change does not need a fictitious migration. The policy seeks to prevent an unverified promise or silent break from reaching the consumer.

### Proportionate Workflow and Template

The following choices are justified as local advisory design, not as a universal lifecycle or native technical support:

- FLOW-001 records outcomes and boundaries before dependent work to reduce decisions based on assumptions. FLOW-002 anticipates failures, loss, and incompatibilities before costly or irreversible operations, without requiring additional architecture when it adds no value.
- FLOW-003 retains reviewable increments, associated tests, and language pairs so results can be attributed and omissions detected. It sets no file-count maximum and does not prohibit an atomic change spanning several components. FLOW-005 compares the complete outcome with acceptance to separate partial from completed delivery. The sequence allows iteration; it does not require isolated phases or a minimum team size.
- BRIEF-001 identifies purpose, a separate location, and the exact release to avoid ambiguous adoption. BRIEF-002 turns boundaries and expectations into observable acceptance. BRIEF-004 makes tools, contracts, and rationale visible without choosing them for the consumer.
- BRIEF-006 links targets to methods and evidence so a checked box cannot replace a check. BRIEF-007 records actual setup and operations to reduce hidden knowledge. BRIEF-008 identifies who decides and what is missing before a dependent stage, without equating completed fields with approval.
- PLAT-004 proposes sharing code only for an identifiable benefit while retaining evidence per adapter, so one shared test is not extrapolated to several platforms. Separate implementations are valid when sharing creates greater cost or coupling.

## Method and Meaning of the Result

Date: 2026-09-02. Reviewer: development assistant. Method: reading the proposed conditions and evidence, comparing each pair of cases against them, and reviewing equivalence of the bilingual record. The examples are hypothetical and contain no choices for an actual consumer.

The result column records the documentary decision reached by applying the criterion. It is not a functional test, human approval, independent audit, or automatic assignment of governance statuses. “Not applicable” means the element's condition is absent in that particular case, not a waiver of an applicable obligation. When an element always applies, its second case demonstrates proportionality or a boundary instead of an exemption.

## Rules Matrix

| ID | Applicability | Normal case | Boundary or non-applicable case | Review criterion | Evaluated documentary result |
| --- | --- | --- | --- | --- | --- |
| RULE-001 | Every change. | Fix a link with a defined expected destination. | Add user accounts to that correction without authorization. | Distinguish acceptance, assumption, and material expansion. | The correction fits a brief record; accounts remain outside the authorized scope. |
| RULE-002 | Code or system boundaries. | Import quantities with a defined range and errors. | Explanatory text with no importer; or an interface validates but its service does not. | Require a contract and validation where the trust boundary exists. | No importer is invented; visual validation alone does not satisfy the service case. |
| RULE-003 | Every project; authorization if protected operations exist. | An example uses dummy values and a protected read checks permission. | Public document without accounts. | Exclude secrets; do not invent permissions or omit existing controls. | Secret review still applies; authorization tests do not apply to a document without a protected operation. |
| RULE-004 | Operations risking loss. | Migration of records to preserve, with verified recovery. | Disposable cache under a verifiable, bounded deletion policy. | Separate authorization, exact target, and preservation from required deletion. | Recovery is required for preservation; no fictitious cache restoration or permission to delete other data. |
| RULE-005 | Possible failures, resources, or effects. | A write failure propagates without success and the acquired resource is released. | Expected error handled without a message; calculation without an acquired resource. | Respect the contract without inventing cleanup or success. | Defined silence may be correct; hiding a relevant failure is not. |
| RULE-006 | Every change; automation when code exists. | Fix a reproducible boundary defect and add regression coverage. | Text-only change; necessary test that cannot be run. | Apply the local automation decision and separate planned from performed checks. | Text receives documentary review; a blocked test neither passes nor permits its scope to be declared complete. |
| RULE-007 | Setup; dependencies when present. | Instructions enumerate tools, provenance, versions, and a clean execution. | Ecosystem without a lockfile; example without external dependencies. | Review equivalent control and evidence for applicable steps. | A nonexistent file is not required; successful installation is not inferred from a manifest. |
| RULE-008 | Declared contracts and platforms. | Format change identifies a break and an authorized, checked transition. | Platform only planned; correction that preserves the contract. | Separate support intent from evidence and require transition only for a break. | Planned is not labeled verified; no migration is invented for a compatible correction. |
| RULE-009 | Every delivery. | Summary and review cover every modified file. | Small change reviewed by its author. | Relate content, rationale, and scope without requiring another team member by default. | Recorded self-review is admissible; an unrelated unauthorized file remains a deviation. |
| RULE-010 | Project-maintained Markdown. | Obligation change updated in both languages. | Original third-party license that must be preserved. | Distinguish the project's translation from intact external material. | Equivalent project content is required; the license is neither rewritten nor used as a substitute. |

## Fundamentals Matrix

| ID | Applicability | Normal case | Boundary or non-applicable case | Review criterion | Evaluated documentary result |
| --- | --- | --- | --- | --- | --- |
| FUND-001 | Problem and contract definition. | Nine units at capacity four require three packages. | Zero units; zero capacity; user has not confirmed the need. | Specify outputs and rejections without presenting assumptions as requirements. | Zero packages, invalid input, and an unconfirmed need are distinguished. |
| FUND-002 | Represented data and states. | Integer interval from two to five. | Equal endpoints valid; interval from four to three invalid. | Relate representation, invariants, and declared boundaries. | Equality is not rejected; reversal is. The case does not establish a language's immutability. |
| FUND-003 | Control flow and progress. | Find the first negative in a finite sequence. | Empty sequence; intentionally continuous service. | Distinguish operation termination from service progress and shutdown. | Empty produces absence; spontaneous termination is not required of a continuous service. |
| FUND-004 | Responsibilities and contracts. | Add units without requiring optional labels. | Legitimate operation requiring several related results. | Justify separation through an actual need, not a fixed size. | A label does not block addition; multiple results do not inherently imply a lack of cohesion. |
| FUND-005 | Distinguishable calculation and effects. | Calculate remaining units without output; presentation propagates write error. | Operation whose contract requires a combined transactional effect. | Make effects explicit without imposing layers. | Separating calculation provides evidence; the criterion does not require splitting a coherent transaction. |
| FUND-006 | Shared state and acquired resources. | One owner completes a reservation before the next. | Function without shared state; resource never acquired due to an earlier failure. | Declare coordination and cleanup that are actually needed. | The double reservation without coordination is identified; releasing a nonexistent resource is not required. |
| FUND-007 | Relevant inputs, permissions, and failures. | Authorized owner receives a document after the check. | Another person knows its identifier; storage fails with an internal path. | Do not confuse knowing an identifier with permission or expose sensitive diagnostics. | Rejection and a controlled public error are required; an implemented control is not established. |
| FUND-008 | Complexity and reuse choices. | Independent limits for books and rooms. | Share a comparison without merging policies. | Preserve contracts and justify abstraction cost. | Changing the book limit does not change rooms; sharing code is allowed if it preserves that independence. |
| FUND-009 | Behavioral evidence. | Compare before, at, and after closing time. | Controlled clock for a unit; integration whose real clock is under test. | Choose cases and dependencies according to what must be demonstrated. | The boundary distinguishes less than from less than or equal; a simulated clock does not replace the intended integration test. |
| FUND-010 | Algorithms, size, and relevant performance. | Running totals with equal results and fewer additions. | Empty input; speed improvement claimed without measurement. | Separate analytical counts from measured time and memory. | Empty input has empty output; fewer additions do not establish a real speedup of the same ratio. |
| FUND-011 | People, interface, and regional context. | Date with a label, format, and understandable error. | No interface; ambiguous numeric date without a region. | Require pertinent checks without inferring one format per language. | No keyboard test is invented without an interface; the ambiguous date needs context. |
| FUND-012 | Maintained dependencies and knowledge. | Candidate with identified version, provenance, rationale, and reviews. | Working demonstration with pending license or provenance review; no external dependency. | Separate an assessable candidate from approved adoption and record applicable items. | The demonstration does not remove pending items; no package means no invented installation, but instructions are maintained. |

## Workflow Matrix

| ID | Applicability | Normal case | Boundary or non-applicable case | Review criterion | Evaluated documentary result |
| --- | --- | --- | --- | --- | --- |
| FLOW-001 | Prepare a consumer change. | Record links problem, acceptance, and exclusions. | Small correction; no adoptable stable release exists yet. | Keep records proportionate and do not invent adoption identity. | Pertinent details suffice; planning does not mean adopting this draft as stable. |
| FLOW-002 | Decisions preceding impactful actions. | Migration examines authorization, preservation, and transition. | Text correction without a migration or interface. | Review real risks without imposing architecture or nonexistent controls. | Recovery is anticipated where needed; non-applicability to the text is justified. |
| FLOW-003 | Implement reviewable changes. | Behavior, tests, and bilingual documentation change together. | Coherent correction affects several inseparable files. | Preserve others' work and attribute the outcome to the increment. | Multiple files do not invalidate the increment; unrelated changes or an omitted translation do deviate. |
| FLOW-004 | Verify consumer scope. | Record identifies change, environment, method, and outcome. | Necessary check not run; build not applicable to text. | Separate success, failure, pending work, and non-applicability. | Blocked work remains pending; non-applicability is justified without labeling it a passed test. |
| FLOW-005 | Consumer delivery. | Evidence satisfies acceptance and the complete change is reviewed. | Only part of the scope has been checked. | Compare delivery with acceptance without hiding risk. | The checked part may be reported as partial, not as complete fulfillment. |

## Platform Checklists Matrix

| ID | Applicability | Normal case | Boundary or non-applicable case | Review criterion | Evaluated documentary result |
| --- | --- | --- | --- | --- | --- |
| PLAT-001 | Evaluate a web project. | Hypothetical project with an interface and service identifies both boundaries. | Service without a visual interface. | Apply controls and flows to features that exist. | Visual navigation does not apply to a service alone; its contracts and security still require their own definition. |
| PLAT-002 | Evaluate desktop, including macOS. | Hypothetical project declares one system, version, and architecture. | Cross-platform tool without checks on other systems. | Do not turn tool capability into product support. | Other systems remain planned or excluded; signing, installation, or native accessibility is not presumed. |
| PLAT-003 | Evaluate a mobile project. | Design considers interruptions and variable connectivity. | No synchronization or deferred tasks. | Link each criterion to a real feature or condition. | No offline queue is invented; permissions, lifecycle, and tests are specified only in the consumer. |
| PLAT-004 | Decide whether to share across platforms. | Shared rule and separate adapters with evidence per target. | No actual benefit from sharing. | Compare benefit and cost; do not extrapolate shared tests. | Separate implementations are allowed; testing the shared rule does not verify adapters. |

## Template Matrix

| ID | Applicability | Normal case | Boundary or non-applicable case | Review criterion | Evaluated documentary result |
| --- | --- | --- | --- | --- | --- |
| BRIEF-001 | Identity of a separate consumer. | Purpose, owner, and exact reference to a future approved release. | Planning before that release exists. | Retain pending fields without inventing approval or integrity. | The brief can be prepared; nonexistent stable adoption cannot be declared. |
| BRIEF-002 | Consumer scope and acceptance. | Included feature has observable input and outcome. | “Must work well” without a criterion; out-of-scope idea. | Distinguish verifiable acceptance, exclusion, and assumption. | The vague phrase does not complete acceptance; the idea remains excluded or pending authorization. |
| BRIEF-003 | Declared platforms and languages. | Documentation in both languages; verified platform with evidence. | Planned platform without a test; product without an interface. | Separate documentary and product languages and planned from tested support. | A bilingual interface is not forced, nor is the planned platform promoted to verified. |
| BRIEF-004 | Design and tools chosen by the consumer. | Alternatives, contracts, versions, and rationale recorded. | No language selected yet; no external dependency. | Keep decisions visible and resolve them before their dependent stage. | The template neither selects a technology stack nor requires installing a package. |
| BRIEF-005 | Consumer data and risks. | Classification links access, preservation, and recovery. | Disposable data with bounded deletion; no protected operation. | Distinguish preservation, deletion, and applicable authorization. | Restoring disposable data or inventing accounts is not required; secret protection is not waived. |
| BRIEF-006 | Consumer targets and evidence. | Target has a method, environment, and expected result separate from execution. | Performance target lacks a threshold when needed; no interface. | Make fulfillment decidable and justify each non-applicability. | The incomplete target still lacks a sufficient criterion; accessibility of a nonexistent interface is not marked passed. |
| BRIEF-007 | Actual setup and operations. | Steps and commands match the deliverable and environment. | Document without installation; commands copied from another technology. | Verify existing items without inventing operations or outcomes. | The document explains access and checking; unrelated commands do not count as verified instructions. |
| BRIEF-008 | Decisions, pending items, and approval. | Question has an owner, impact, and resolution stage. | Every field is filled in, but there is no approval decision. | Separate field completeness, consumer status, and approval authority. | A completed template approves neither consumer nor foundation; a material pending item prevents its dependent stage. |

## Documentary Evaluation Closure

Thirty-nine rows and 78 documentary cases were evaluated, without counting the translation as an independent set. Within the declared scope, the criteria distinguish the interpretations described; decisions on automation, dependencies, and compatibility are explicit rather than deferred to an undefined technical choice. No material contradictions were detected among the decisions in these cases after clarifying their scope.

This result completes this assisted applicability evaluation. It does not claim that all content has been tested in every context, that sources support every clause, that a person has confirmed their understanding, or that stable approval exists. Model records retain their own results; these 78 cases are not added as automated tests.

Tests of consumer code, installation, performance, accessibility, operating systems, physical recovery, and distribution are conditional obligations of projects incorporating those implementations, not fictitiously completed work or an application that must be built here. Preservation and approval of an exact release are judged separately under governance.
