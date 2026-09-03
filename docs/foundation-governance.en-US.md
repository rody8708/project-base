# Foundation Governance and Validation

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](foundation-governance.es-419.md) · [Home](../README.en-US.md) · [Support and traceability](traceability.en-US.md)

## Purpose, Scope, and Origin

This document proposes how to review, validate, approve, and preserve the master foundation. It is a local governance proposal that develops the user's intent and the audit findings; it does not claim compliance with an external standard. It must also be reviewed and approved before governing a stable release.

This repository maintains the fundamentals, proposed rules, templates, and evidence about the foundation itself. Projects that use it will be created outside it. An example or a foundation test is not the same as starting a consumer application. This revision includes teaching code in Markdown to check bounded models; it adds no reusable product runtime components. Any future addition of those components requires a defined scope and validation.

## Current Status and Correction of the Previous Label

- Working document revision: `0.1.0-draft.4`.
- Approved stable releases: none.
- Content: documentary core, template, advisory profiles, teaching models, and maintenance tools retained in Markdown; scope and evaluation of all 39 elements in [applicability](applicability.en-US.md).
- Functional validation of product components or platforms: not performed. Teaching-model verification has its own scope and record; it does not validate the fundamentals in full.
- Mechanism for preserving and verifying releases: implemented in [release tools](release-tools.en-US.md), using a ZIP package, manifest, and SHA-256 identity. Evidence and limits are recorded in [release readiness](release-readiness.en-US.md).
- The previous `1.0.0` label did not correspond to an approved release. It is replaced with a draft identifier while retaining the 39 content identifiers. No previously existing stable release is being withdrawn or modified.

Reviewing the draft or authorizing its editing does not approve all of its obligations. Explicit user requirements retain their origin; details added by this foundation remain subject to review.

## Origin of Each Element

The [traceability register](traceability.en-US.md) distinguishes user requirements, local proposals, and principles checked against references. An entry may combine these origins: a source may support the principle, while the exact requirement, its limitations, and its verification method are local decisions.

Each element must identify its origin, the scope covered by the source, limitations or pending items, expected verification, and actual status. The edition or access date of references and the section used will be recorded. A general source does not automatically support an entire compound rule or examples that have not yet been developed.

## States and Evidence

State identifiers are shared between languages; translation does not change their meaning.

| State | Meaning | Evidence Needed to Assign It |
| --- | --- | --- |
| `proposed` | Proposed for review. | Identifiable content and declared pending items, without assuming complete support. |
| `document-reviewed` | Reviewed as documentation within the stated scope. | Checked origin, recorded limitations, and a coherence and translation review. It does not demonstrate functionality or approval. |
| `validated-in-scope` | Validated only for an explicit scope. | Agreed criteria, completed checks, results, and recorded limitations. For documentation, clarity and applicability are validated through cases; for components, actual behavior is also validated. |
| `approved` | Approved for an identified release. | Validation of the scope and explicit approval from the user or a designated person, tied to the exact content. |

An element does not advance because of its age, number of sources, or volume of documentation. If an obligation, its scope, or a relevant dependency changes, the continued validity of its evidence is reviewed; affected content does not automatically retain validation. The previous release remains intact.

In this revision, all 39 rows are `document-reviewed` within their stated documentary scope, without validating implementations. Row states describe that assisted review; case evaluation is recorded separately. The package remains a candidate until explicit approval; no row should be read as comprehensive technical certification.

## Proposed Conditions for a Stable Release

For a release to be declared stable, the following must be demonstrable within its scope:

1. The purpose and boundaries are clear, including the separation between the foundation and its consumer projects.
2. Each included element has complete traceability: a specific source or a justified local decision, scope, limitations, and a review owner.
3. Proposed obligations have been evaluated against applicable and non-applicable cases. Conflicts, exceptions, and material pending decisions have been explicitly resolved.
4. Included fundamentals have enough depth for their stated use, with explanations, examples, and relevant checks. They are not presented as an exhaustive standard for all programming.
5. Both languages are semantically equivalent; links, identifiers, and metadata are verified. Comparing headings does not replace reviewing meaning.
6. Evidence distinguishes completed work from planned work. If technical components exist, their tests and operating conditions are recorded; otherwise, the release is explicitly limited to documentation.
7. The release content can be preserved, obtained, and verified through the release mechanism defined below.
8. The responsible person explicitly approves the identity, scope, and obligations of that release. General authorization to continue working does not satisfy this condition.

Pending items in an excluded portion must be identified as outside the release scope; they cannot be hidden by marking them approved. This checklist is not satisfied merely because it has been written.

## Identifiable, Immutable Releases

The record separates editorial revision, byte identity, and approval. The candidate contains both languages' files and a technical manifest of paths, sizes, and SHA-256 hashes; the manifest is excluded from its own hash list. The complete ZIP's identity is retained outside it. Instructions and tests are in [release tools](release-tools.en-US.md).

The selected mechanism is an identified local archive, created without overwriting and marked read-only against accidental changes. It is recovered into a new folder, checking identity, inventory, and content before use. This is neither tamper-proof storage nor a remote copy: someone with permissions can modify or delete files. Preserving the package and its approved record in a trusted location remains the owner's responsibility; losing both copies cannot be repaired with a hash. No hosting has been purchased or external backup configured.

Verification requires an expected SHA-256 obtained from the trusted record, not calculated from the received file to authorize itself. The hash detects changes relative to that value; it does not authenticate the approver. Recovery and rejection paths are tested locally through automation. That test is not attributed to another person or claimed as an independent distribution trial.

An approved release's content is not rewritten. A correction, even an editorial one, produces another identified release with an explanation of the change and its impact. The previous history is preserved.

Editorial revisions use `0.1.0-draft.N`. After the exact candidate is approved, an external receipt may assign stable release `1.0.0` without rewriting its bytes. It will include the authorized person or role, date, editorial revision, release version, full SHA-256, scope, accepted obligations, and a retrievable approval reference. No digital signature is presumed: textual approval must be retained as such. Internal headers and states describe the preapproval snapshot; effective status comes from the trusted receipt tied to that identity, never from the ZIP filename alone. Requested changes produce another candidate and renewed checks; approval is not granted in advance.

Changing an approved release's obligations requires another major version; a compatible addition, a minor version; a correction without obligation changes, a patch version. This is a local convention. Source editions and incorporated formulations are identified in the package; permanent availability or freezing of every external site is not promised. An inaccessible context-only source is not used as technical support.

## Adoption by Another Project

Once a stable release exists, the consumer project will be created in a separate location and will record: its own location, adopted version, exact release identity, method and result of integrity verification, applicable scope, permitted adaptations, and the adoption owner.

A copy or a retrievable reference to the immutable content may be retained. An edited copy cannot be presented as the original release; its local changes must be distinguished. Additional consumer policies will not remove applicable obligations from the adopted release. Updating the foundation will be an explicit decision accompanied by impact review and checks.

The [project template](../templates/project-brief.en-US.md) only prepares that record. There is currently no stable release that can be recorded as adopted.

## Minimum Review or Validation Record

Each record must identify: the element and revision examined, scope, expected criterion, reproducible method or command, environment when applicable, observed result, limitations, date, and reviewing person or role. It must not contain secrets or unnecessary personal data.

To repeat the document checks for this revision: inventory all `.md` files, verify one counterpart per language, compare identifiers and metadata, resolve every local link, and semantically review each pair. External references are checked against the cited section and its limitations; a responding link does not demonstrate support for a claim.

Future component checks must add their actual results. Consumer applications will not be created here to make the foundation appear tested. [Document checks](document-checks.en-US.md), models, and release tools can run locally from Markdown; continuous integration has not been installed.

## Historical Record of Revision 0.1.0-draft.1

- Date: `2026-09-02`.
- Examined revision: `0.1.0-draft.1`; document scope covering all 16 Markdown files, including their eight language pairs.
- Reviewer: development assistant with assisted cross-review; this is neither user approval nor an independent professional audit.
- Structural method: file inventory, strict UTF-8 reading, metadata and identifier comparison, register-to-document correspondence, and resolution of local link paths and anchors.
- Structural result: passed; 39 original elements retained, 39 traceability entries per language, 126 resolved local links or anchors, and consistent draft metadata. Each register includes four user-origin requirements and seven cataloged references.
- Content method: reading the pairs and comparing obligations, conditions, and translations; reviewing the distinction between partial support, planned evidence, and actual results. The circular approval condition, unconditional recovery in the workflow, and verifiable-setup mismatch in the register were corrected.
- Content result: no unresolved material semantic differences were found in this assisted review. State distributions match between languages: 27 `proposed` elements and 12 `document-reviewed`; none has functional validation or stable approval.
- Source limitation: the register retains the sections actually checked and the partial SWEBOK access. It does not establish exhaustive coverage of fundamentals or future permanence or integrity of external pages. Resolving local links does not validate external citations.
- Not performed: component tests, platform trials, publication of a stable package, and verification of its retrieval and integrity. This round has no components or stable release.
- Approval decision: pending. These results close the checks for this document correction, not the conditions for consolidating and publishing the entire foundation.

## Historical Record of Revision 0.1.0-draft.2

- Date: `2026-09-02`; review of 18 Markdown files in nine language pairs. The previous revision's historical record is retained above.
- Change: development of the twelve fundamentals, addition of fourteen specific references, and a document pair with reproducible models; no rules or consumer applications were added.
- Reviewer: development assistant with assisted cross-review of contracts, translation, and traceability; not an independent professional audit or user approval.
- Structural method: inventory and strict UTF-8 reading; checking metadata, headings, code fences, pairs, identifiers, and states; resolving local links and anchors; comparing destinations and code blocks between languages.
- Structural result: passed; 39 original identifiers, 39 traceability rows per language, four user requirements, and 21 sources per catalog. Resolved 210 local links or anchors; inventoried 44 external link occurrences without treating that count as verification of their support.
- Content method: source comparison by section, review of normal and faulty cases, assumptions, limits, and bilingual equivalence. FUND-005 was corrected to declare and propagate `Written` or `OutputError` rather than leave write failure ambiguous. No other material contradictions were detected within the assisted review's scope.
- Model evidence: procedure and results retained in the [verification record](fundamentals-verification.en-US.md). Under PowerShell 7.6.4 on Windows, both files produced 17 passing checks and detected three deliberate defects; these are the same cases, not two independent sets.
- Resulting state: 21 `document-reviewed` elements and 18 `proposed` per language. None advances to `validated-in-scope` or `approved`; the three models do not cover all criteria for their fundamentals. All obligations still await stable approval.
- Not executed: other examples, product components, real threads, interfaces, platform trials, preservation of a stable release, or retrieval of that package. Source limitations and topics needing development remain in the traceability register.
- Approval decision: pending. This closes the document expansion and its bounded checks, not full consolidation of the foundation.

## Historical Record: Five-Point Progress in 0.1.0-draft.3

This round covers the common documentary core and its examples, not product components or platform support. The table distinguishes completed work from full closure; it does not change approval authority or declare the stable-release conditions satisfied.

| Point | Completed work | What remains for full closure |
| --- | --- | --- |
| 1. Fundamentals | Two bilingual expansions on data, precision, text, time, cancellation, resources, and recovery; reviewed contracts and cases. | Review the sufficiency of the first delivery's scope and limitations; do not turn bounded examples into guarantees for future implementations. |
| 2. Rules | Local rationale for the ten obligations and interpretation scenarios that also exercise the workflow and template. | Resolve applicability conditions and still-uncovered scenarios, especially mandatory verification, dependencies, and compatibility; approve the exact content when appropriate. |
| 3. Validation | 97 model checks and eight documentary scenarios; executable examples for nine fundamentals and documentary review for the other three. | Complete the evaluation required for the elements included in the delivery. Results do not cover every clause or product tests. |
| 4. Sources | Ten new references with identified editions or revisions; a 31-entry catalog with source-specific limitations. | Pin still-variable revisions of earlier references and the Java SE 17 HTML; resolve any pending support or rationale within the final scope. |
| 5. Release | Review records and hashes of the checked models are retained. | Implement preservation and retrieval of the exact package, verify its integrity, and obtain explicit approval. Example hashes do not replace that mechanism. |

Tests of real interfaces, operating systems, distribution, databases, or services can only be required within a scope that includes those implementations. They are neither operations performed here nor fictitiously satisfied conditions for this documentation. Platform profiles are not declared approved merely because their implementations are excluded from this round.

## Historical Record of Revision 0.1.0-draft.3

- Date: `2026-09-02`; 24 Markdown files in twelve language pairs. Earlier historical records are retained without substituting new results for their original results.
- Change: two bilingual chapters and a pair of verification records; expanded traceability, rule rationale, and navigation. The 39 original identifiers are retained; no applications were created or dependencies installed.
- Reviewer: development assistant with assisted cross-review of contracts, translation, models, and limitations. This is not an independent audit or user approval.
- Structural method: strict UTF-8 reading, metadata, headings, fences, pairs, identifiers, states, sources, link destinations and anchors; comparison of code blocks and links between languages.
- Structural result: passed; 39 elements and 39 traceability rows per language, four user requirements, and 31 sources per catalog; 320 resolved local links or anchors and 76 inventoried external link occurrences. Inventory does not establish source support.
- Executed evidence: the [core record](core-verification.en-US.md) retains the method, environment, hash, and results of 80 new checks plus the rerun of the initial 17; both languages produced the same passing results. The case count is not doubled by language.
- Documentary evidence: eight reviewed scenarios; checked interpretations of scope, proportionate verification, compatibility, retention/deletion, and the documentary security, accessibility, and dependency cases. Those controls were not executed in products.
- Content correction: text-sequence comparison was clarified as ordinal before and after NFC; cultural comparison and sequence identity are not treated as equivalent. Model ranges and results were aligned with their contracts. No detected material contradictions remained in the reviewed cases.
- State: 23 `document-reviewed` elements and 16 `proposed` per language. RULE-001 is reviewed within its local rationale and RULE-004 within its contextual support and data classification. No element is declared fully `validated-in-scope` or `approved`.
- Not executed: product, platform, physical-resource, network, real-concurrency, operational backup/restoration, production-performance, or stable-release preservation/retrieval tests.
- Decision: this round's work is documented and checked within its scope; full closure of the five points and stable approval remain pending as shown in the table above.

## Technical Closure of Revision 0.1.0-draft.4

The [delivery record](release-readiness.en-US.md) brings together the final scope, evaluation of all 39 elements, repeatable checks, and the candidate's external identity. Pending items described in the historical sections above belong to those revisions; they do not replace current status. The remaining decision is explicit approval of the exact package and its obligations, not renewed authorization for technical work already in scope.
