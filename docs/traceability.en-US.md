# Support and Verification Register

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](traceability.es-419.md) · [Home](../README.en-US.md) · [Foundation governance](foundation-governance.en-US.md)

## How to Read This Register

This register covers the 39 existing elements: 10 rules, 12 fundamentals, 5 workflow stages, 4 platform profiles, and 8 template sections. It adds no rules and does not replace their text. It identifies which parts have documented support, which remain local decisions, and what still needs verification.

- `USER`: a requirement stated by the user in this conversation, identified below as `REQ-U-...`.
- `LOCAL`: a design proposal for this foundation; not a requirement attributable to the user or an external source.
- `REF`: a principle checked against a specific section of a primary source. This does not mean adoption of the entire source.
- `proposed`: the element's support still needs to be checked, or its local rationale needs further justification.
- `document-reviewed`: the indicated part has undergone documentary review; this does not mean approval, functional validation, or support for every clause.

Partial support for one clause does not establish the others. The table's verification procedures are local proposals for future evidence: they are not obtained results, installed tests, or checks literally required by the sources. Each future execution will need an identified artifact or change, environment, method, result, responsible party, and limitations, as defined in governance.

The evidence recorded here is the documentary comparison performed by the assistant on **2026-09-02**, limited to the indicated sections. It is not an independent review. No row by itself establishes working code, a supported platform, or a stable release.

The applicability review completes the local rationale for every row in this documentary delivery; it does not expand each source's partial support. Concrete decisions for future consumers are not unfinished foundation design work.

## User-Origin Requirements

These identifiers trace the conversation; they are not new product rules.

| Reference | Stated requirement | Attribution limit |
| --- | --- | --- |
| REQ-U-001 | Create a reusable master foundation for web, desktop, macOS, and mobile projects; projects will be built separately using that foundation. | Does not specify architectures, tools, additional systems, or particular tests. |
| REQ-U-002 | Rely on solid, consolidated fundamentals and on tested, working technical elements when they exist. | Does not declare the current content validated or prescribe universal automation. |
| REQ-U-003 | Start with fundamentals, good practices, and immutable rules documented in `.md`. | The selection of 10 rules, their identifiers, and the release model are local proposals. |
| REQ-U-004 | Maintain Latin American Spanish and US English in separate files. | The codes `es-419` and `en-US`, synchronization mechanism, and external-material exceptions are implementation decisions; this does not specify the final product's languages. |

## Primary Source Catalog

Access date: **2026-09-02**. The foundation retains its own wording and the citations, editions or revisions, sections, and limits identifying the support used; it does not reproduce complete works. Maintained guides are linked to specific revisions in their upstream repositories; standards and courses are identified by publication or semester edition. These are not claimed to be the latest editions, and no certification or full compliance with the sources is asserted.

An upstream revision identifies content but does not guarantee eternal external availability. An identified course edition does not freeze its site's bytes. These limits do not require archiving every third party: the foundation's own documents and precise references are preserved; external changes do not automatically modify a foundation release. The 31 identifiers are reference entries, not necessarily 31 independent works: SRC-NIST-SSDF and SRC-NIST-USE refer to the same publication; SWEBOK is excluded from technical support.

### SRC-SWEBOK

- Source: IEEE Computer Society, [Software Engineering Body of Knowledge (SWEBOK)](https://www.computer.org/education/bodies-of-knowledge/software-engineering).
- Edition/access: the indexed official excerpt mentions version 4.0, 2024. Direct access was denied; the book was not reviewed, and that edition was not verified as the latest.
- Section checked: the presentation of generally accepted knowledge and its contextual application, visible in the indexed official excerpt.
- Limit: contextual reference excluded from technical support; it supports no obligations or rows. Lack of access to the book does not block this scope, which does not claim to adopt it.

### SRC-NIST-SSDF

- Source: NIST, [SP 800-218: Secure Software Development Framework (SSDF), version 1.1](https://csrc.nist.gov/pubs/sp/800/218/final), [publication](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf).
- Edition/status: final publication, February 2022; this edition is referenced without claiming that later revisions do not exist.
- Sections consulted: executive summary; table 1, PO.1.2, PW.4.1/PW.4.4, PW.7.1/PW.7.2, and PW.8.1/PW.8.2.
- Limit: recommendations for secure development, review, components, and security testing; not a complete programming standard. It does not by itself support every functional test, educational requirement, or absolute wording in this foundation.

### SRC-NIST-USE

- Source: NIST, [SP 800-218: Secure Software Development Framework (SSDF), version 1.1](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf).
- Edition/status: final publication, February 2022; replaces the previous reference to the mutable “SSDF Use” page with the equivalent text in this edition.
- Section consulted: Section 1, printed page 3: contextual selection by risk, cost, feasibility, and applicability; not a uniform checklist.
- Limit: an interpretation constraint for SRC-NIST-SSDF, not an independent work or automatic support for stricter local policies.

### SRC-OWASP-INPUT

- Source: OWASP, [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).
- Revision checked: commit [ca485dc590f92b31f6db336335faa619ba68b112](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/ca485dc590f92b31f6db336335faa619ba68b112/cheatsheets/Input_Validation_Cheat_Sheet.md), dated `2026-06-29`; sections compared with that content.
- Sections consulted: goals, strategies, and client-side versus server-side validation.
- Limit: supports early validation of untrusted inputs and not substituting interface checks for security enforcement. It does not require formal contracts in every module or make validation a sufficient defense against all attacks.

### SRC-OWASP-AUTH

- Source: OWASP, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- Revision checked: commit [0b43888b5d6196711ddb4c42f3db3938fe5f52f4](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/0b43888b5d6196711ddb4c42f3db3938fe5f52f4/cheatsheets/Authorization_Cheat_Sheet.md), dated `2026-08-31`; sections compared with that content.
- Sections consulted: least privilege, per-request checks, trusted enforcement location, and safe failure on rejection.
- Limit: supports authorization controls, not a single architecture or permission model. Adaptation to each platform's native capabilities requires further comparison.

### SRC-OWASP-SECRETS

- Source: OWASP, [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
- Revision checked: commit [fcd8b68435a268ecaa1a4729c5ac68bb5fb08cc7](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/fcd8b68435a268ecaa1a4729c5ac68bb5fb08cc7/cheatsheets/Secrets_Management_Cheat_Sheet.md), dated `2026-08-13`; sections compared with that content.
- Sections consulted: introduction, 2.2, 2.3, and 9.2.
- Limit: supports controlled secrets management, minimum access, and handling exposures in code or logs. It does not select a provider or validate our configuration or each client's credential management.

### SRC-OWASP-ERROR

- Source: OWASP, [Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html).
- Revision checked: commit [752e4d0d8b85061f769fb6b6d3460017f1370d00](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/752e4d0d8b85061f769fb6b6d3460017f1370d00/cheatsheets/Error_Handling_Cheat_Sheet.md), dated `2024-04-02`; sections compared with that content.
- Sections consulted: context and objective of error handling.
- Limit: supports responses without sensitive internal details and separate diagnostics, mainly in web/API applications. It does not establish transactional consistency, resource cleanup, or retry idempotency.

### SRC-MIT-SPECIFICATIONS

- Source: MIT 6.031, Spring 2021, [Specifications](https://web.mit.edu/6.031/www/sp21/classes/06-specifications/).
- Identified edition: MIT 6.031, Spring 2021, reading 6. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Specification structure; Why specifications.
- Limit: Operation contracts and guarantees. Does not validate needs discovery or require Java or a universal ban on missing values.

### SRC-MIT-INVARIANTS

- Source: MIT 6.031, Spring 2021, [Abstraction Functions & Rep Invariants](https://web.mit.edu/6.031/www/sp21/classes/11-abstraction-functions-rep-invariants/).
- Identified edition: MIT 6.031, Spring 2021, reading 11. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Invariants; Checking the rep invariant; Documenting the AF, RI, and safety from rep exposure.
- Limit: Invariants and protected representation. Does not cover precision, calendars, or every immutability implementation.

### SRC-CORNELL-LOOPS

- Source: Cornell CS 2110, Spring 2026, [Loop Invariants](https://courses.cis.cornell.edu/courses/cs2110/2026sp/lectures/lec04/).
- Identified edition: Cornell CS 2110, Spring 2026, lecture 4. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Writing “Loopy” Code: Initialization, Loop Guard, Loop Body.
- Limit: Reasoning about loops that progress toward exit. Does not establish timeouts, cancellation, or long-lived service behavior.

### SRC-MIT-COHESION

- Source: MIT 6.031, Spring 2021, [Designing Specifications](https://web.mit.edu/6.031/www/sp21/classes/07-designing-specs/).
- Identified edition: MIT 6.031, Spring 2021, reading 7. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Designing good specifications: The specification should be coherent.
- Limit: Operation coherence; not a universal recipe for splitting modules.

### SRC-MIT-EFFECTS

- Source: MIT 6.031, Spring 2021, [Code Review](https://web.mit.edu/6.031/www/sp21/classes/04-code-review/).
- Identified edition: MIT 6.031, Spring 2021, reading 4. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Methods should return results, not print them.
- Limit: Separation of results from printing. Extension to networking, storage, and architecture is a local proposal.

### SRC-MIT-CONCURRENCY

- Source: MIT 6.031, Spring 2021, [Thread Safety](https://web.mit.edu/6.031/www/sp21/classes/21-thread-safety/).
- Identified edition: MIT 6.031, Spring 2021, reading 21. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: What threadsafe means; Strategy 1: confinement; Strategy 2: immutability.
- Limit: Shared-state strategies. Does not validate our model or cover its resources, durability, or retries.

### SRC-OWASP-CRYPTO

- Source: OWASP, [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).
- Revision checked: commit [efbc9db2542c987a3c6ffe4e7f8cb48cd636182f](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/efbc9db2542c987a3c6ffe4e7f8cb48cd636182f/cheatsheets/Cryptographic_Storage_Cheat_Sheet.md), dated `2026-08-31`; sections compared with that content.
- Sections checked: Architectural Design; Custom Algorithms.
- Limit: Threat-informed protection and established algorithms. Does not select or verify a cryptographic implementation.

### SRC-OWASP-THREATS

- Source: OWASP, [Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html).
- Revision checked: commit [ad32f17e5d68701bc4c73505b90739bf66bd775b](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/ad32f17e5d68701bc4c73505b90739bf66bd775b/cheatsheets/Threat_Modeling_Cheat_Sheet.md), dated `2026-03-24`; sections compared with that content.
- Sections checked: Overview; Addressing Each Question.
- Limit: Contextual analysis of system, threats, responses, and verification. Does not impose one methodology or certify security.

### SRC-GOOGLE-REVIEW

- Source: Google Engineering Practices, [What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html).
- Revision checked: commit [3e6ba5cfc8c096528173f8f31b2caf15bb78340c](https://raw.githubusercontent.com/google/eng-practices/3e6ba5cfc8c096528173f8f31b2caf15bb78340c/review/reviewer/looking-for.md), dated `2022-03-31`; sections compared with that content.
- Sections checked: Complexity; Comments; Documentation.
- Limit: Contextual complexity and documentation guidance. Does not adopt internal tools or English-only comments.

### SRC-MIT-TESTING

- Source: MIT 6.031, Spring 2021, [Testing](https://web.mit.edu/6.031/www/sp21/classes/03-testing/).
- Identified edition: MIT 6.031, Spring 2021, reading 3. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Choosing test cases by partitioning; Include boundaries in the partition; Coverage; Unit and integration testing.
- Limit: Test selection and scope. Does not impose percentages, tools, or a universal test distribution.

### SRC-GOOGLE-TESTING

- Source: Software Engineering at Google, chapter 11, [Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html).
- Edition/revision: book published in March 2020; HTML at commit [e9e24835cb889fe25251cb9ec6d51b79233e358d](https://raw.githubusercontent.com/abseil/abseil.github.io/e9e24835cb889fe25251cb9ec6d51b79233e358d/resources/swe-book/html/ch11.html), dated `2026-02-10`.
- Sections checked: Case Study: Flaky Tests Are Expensive; Properties common to all test sizes; Test Scope; A Note on Code Coverage.
- Limit: Contextual experience with isolation, nondeterminism, and coverage. Its infrastructure or metrics are not adopted as obligations.

### SRC-MIT-ALGORITHMS

- Source: MIT 6.006, Spring 2020, [Lecture 1: Introduction](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/477c78e0af2df61fa205bcc6cb613ceb_MIT6_006S20_lec1.pdf).
- Identified edition: MIT 6.006, Spring 2020, lecture 1. That editorial identity and the cited sections are fixed; the site's bytes are not claimed to be immutable.
- Sections checked: Efficiency; Model of Computation; Data Structure (pp. 2–3).
- Limit: Cost by input size and computation assumptions. Does not establish a specific measurement protocol or predict actual latency.

### SRC-W3C-WCAG22

- Source: W3C, [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/).
- Edition/access: The indicated dated edition; not claimed to be the latest.
- Sections checked: 2.1.1; 2.4.7; 3.3.1; 3.3.2.
- Limit: Recommendation dated 2024-12-12, selected web-content criteria. Does not establish full conformance, native accessibility, or legal compliance.

### SRC-W3C-I18N

- Source: W3C, [Internationalization Quick Tips for the Web](https://www.w3.org/International/quicktips/).
- Revision checked: commit [8a11663d7bab071d6c53b238eb1582297497e7fc](https://raw.githubusercontent.com/w3c/i18n-drafts/8a11663d7bab071d6c53b238eb1582297497e7fc/quicktips/index.en.html), dated `2025-09-25`; sections compared with that content.
- Sections checked: Forms; Text authoring.
- Limit: Partial guidance on formats and translatable text. Does not define every regional format or require a catalog technique.

### SRC-RFC8259

- Source: IETF, [The JavaScript Object Notation (JSON) Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259.html).
- Edition: RFC 8259, December 2017; accessed `2026-09-02`.
- Sections checked: 3, 4, 6, and 8.1.
- Limit: JSON values, precision, and interchange; does not set business meaning or require this format.

### SRC-RFC3339

- Source: IETF, [Date and Time on the Internet: Timestamps](https://www.rfc-editor.org/rfc/rfc3339.html).
- Edition: RFC 3339, July 2002; accessed `2026-09-02`.
- Sections checked: 4.2, 5.6, and 5.7.
- Limit: timestamps and calendar restrictions; does not resolve schedules or future time-zone changes.

### SRC-UNICODE-NFC

- Source: Unicode, [Unicode Normalization Forms, UAX #15](https://www.unicode.org/reports/tr15/tr15-57.html).
- Edition: Unicode 17.0.0, revision 57, `2025-07-30`; accessed `2026-09-02`.
- Sections checked: 1.1 and 1.2.
- Limit: equivalence and normalization; does not require transforming secrets or establish full conformance.

### SRC-W3C-CLOCK

- Source: W3C, [High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/).
- Edition: Recommendation dated `2019-11-21`; accessed `2026-09-02`.
- Sections checked: 1 and 6.
- Limit: a web monotonic clock; does not establish native clock behavior or distributed synchronization.

### SRC-JAVA-ZONES

- Source: Oracle, [ZoneRules](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/zone/ZoneRules.html).
- Edition/revision: Java SE 17; OpenJDK 17 Javadoc at commit [175b65c0a1e9f624bff80ec14f785403c0b2d62d](https://raw.githubusercontent.com/openjdk/jdk17/175b65c0a1e9f624bff80ec14f785403c0b2d62d/src/java.base/share/classes/java/time/zone/ZoneRules.java), dated `2021-07-21`, identified from `jdk-17+35`. Oracle's HTML is not claimed to be immutable.
- Section checked: getValidOffsets(LocalDateTime).
- Limit: distinguishing normal, nonexistent, and ambiguous local times; does not select Java or validate time-zone data.

### SRC-DOTNET-NUMBERS

- Source: Microsoft, [Floating-point numeric types](https://github.com/dotnet/docs/blob/4b9c7672e087d5f61ade3161ab57ff88e192edcc/docs/csharp/language-reference/builtin-types/floating-point-numeric-types.md).
- Revision: `4b9c7672e087d5f61ade3161ab57ff88e192edcc`, commit date `2026-01-15`; accessed `2026-09-02`.
- Section checked: Characteristics of the floating-point types.
- Limit: precision of specific types; does not prescribe a language or business rounding.

### SRC-DOTNET-USING

- Source: Microsoft, [using statement - ensure the correct use of disposable objects](https://raw.githubusercontent.com/dotnet/docs/399ea4a18a9312379c5b3306bbffcc753491c628/docs/csharp/language-reference/statements/using.md).
- Revision: `399ea4a18a9312379c5b3306bbffcc753491c628`; document metadata `ms.date: 2026-01-16`, not the commit date; accessed `2026-09-02`.
- Section checked: introduction, exits through exceptions and return, equivalence to try/finally.
- Limit: disposal in C# scopes; does not guarantee cleanup after abrupt termination or select a platform.

### SRC-DOTNET-CANCELLATION

- Source: Microsoft, [Cancellation in Managed Threads](https://raw.githubusercontent.com/dotnet/docs/8b2033ff9f3b355e8fca60a4b0ee5e6501ab4fc7/docs/standard/threading/cancellation-in-managed-threads.md).
- Revision: `8b2033ff9f3b355e8fca60a4b0ee5e6501ab4fc7`; document metadata `ms.date: 2026-03-17`, not the commit date; accessed `2026-09-02`.
- Sections checked: Introduction; Operation Cancellation Versus Object Cancellation; Listening and Responding to Cancellation Requests; Listening by Polling; Listening by Registering a Callback.
- Limit: cooperative cancellation in .NET; does not guarantee immediate interruption or reversal of effects.

### SRC-RFC9110

- Source: IETF, [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).
- Edition: RFC 9110, June 2022; accessed `2026-09-02`.
- Section checked: 9.2.2, Idempotent Methods.
- Limit: requested effect and HTTP repetition; does not implement business deduplication or exactly-once execution.

### SRC-SQL-RESTORE

- Source: Microsoft, [Back up and restore SQL Server databases](https://raw.githubusercontent.com/MicrosoftDocs/sql-docs/4f5b84b173a7019a9a4c69952f93b7c08921d57b/docs/relational-databases/backup-restore/back-up-and-restore-of-sql-server-databases.md).
- Revision: `4f5b84b173a7019a9a4c69952f93b7c08921d57b`, commit date `2026-08-27`; accessed `2026-09-02`.
- Sections checked: Backup and restore strategies; Test your backups; Document backup/restore strategy.
- Limit: SQL Server restore strategies and tests; does not require that platform or demonstrate operational recovery here.

## Rules

Reference text: [proposed rules](immutable-rules.en-US.md). In every row, checks are expected, not executed.

### Scope, Boundaries, and Protection

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| RULE-001 | `LOCAL`; [policy rationale](immutable-rules.en-US.md). | Local policy justified to avoid invented requirements and unauthorized scope expansion, with proportionate records. Approval of the obligation remains pending. | Review a change description: problem, observable acceptance, exclusions, and assumptions with an owner; detect an unauthorized expansion. | `document-reviewed` |
| RULE-002 | `REF` [SRC-OWASP-INPUT](#src-owasp-input) + `LOCAL`. | Partial support for untrusted inputs; contracts at module boundaries are a local policy justified by incompatible-assumption risk and evaluated in applicability. | Inventory boundaries; compare contracts and valid, invalid, and edge cases; try bypassing interface validation without bypassing actual protection. | `document-reviewed` |
| RULE-003 | `REF` [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-SECRETS](#src-owasp-secrets), [SRC-OWASP-ERROR](#src-owasp-error) + `LOCAL`. | Partial support for authorization, secrets, and error exposure. Distribution of service secrets in each client type and native controls require specific review. | Review files and logs with dummy data; trace each protected operation to its control; check allowed and denied access and the absence of shared secrets in the client. | `document-reviewed` |
| RULE-004 | `REF` [SRC-SQL-RESTORE](#src-sql-restore) + `LOCAL`. | Restoration checked in a SQL context; authorization, classification, and scope are local policies. No model establishes physical recovery or authorizes actual deletion. | Use dummy data in two separate cases: for retention, test the chosen recovery; for required permanent deletion, confirm target, scope, and authorization without requiring restoration. | `document-reviewed` |
| RULE-005 | `REF` [SRC-OWASP-ERROR](#src-owasp-error), [SRC-DOTNET-USING](#src-dotnet-using), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation), [SRC-RFC9110](#src-rfc9110) + `LOCAL`. | Errors, cleanup, cancellation, and idempotency boundaries partially checked; persistent coordination and each implementation's guarantees need their own evidence. | Trigger an operation failure; inspect the outcome, final state, resources, and logs; repeat the request when applicable and check its effects. | `document-reviewed` |

### Quality, Continuity, and Documentation

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| RULE-006 | `USER` REQ-U-002 + `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.8 + `LOCAL`. | Partial support for security testing. Automation for all code, mandatory regression tests, and completion conditions are local policies, not SSDF mandates. | Map acceptance to tests; record executions, failures, and omissions; show that a regression test reproduces the defect and distinguishes the fix. Review content and parity when there is no code. | `document-reviewed` |
| RULE-007 | `LOCAL`; verifiable setup and dependency control. | Local decision justified in applicability: controlled origin and versions, locking when available, and verified setup. No identical-binary guarantee; consumer installations are verified there. | Repeat setup and installation in a declared clean environment with authorized access; check resolved versions and the absence of hidden paths; justify the selected dependency mechanism without inferring identical binaries. | `document-reviewed` |
| RULE-008 | `LOCAL`; declared compatibility and transition. | Justified local decision: preserve declared promises and authorize/check transitions for breaking changes. No perpetual support or unselected platforms required. | Run cases from the declared matrix, identify breaking changes, and rehearse the transition with representative formats or consumers. | `document-reviewed` |
| RULE-009 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.7 + `LOCAL`. | Partial support for security review. Complete review of each delivery, decisions, and history tooling are local policies; the source does not require Git. | Compare all changes with scope; retain findings and their resolution, significant rationale, and an unambiguous link between the delivery and reviewed content. | `document-reviewed` |
| RULE-010 | `USER` REQ-U-004 + `LOCAL`. | The user requested separate language files; simultaneous delivery, exact parity, and external-material handling are local proposals. | Inventory pairs; compare identifiers, revision, status, and links; review meaning, obligations, and exceptions in both languages. | `document-reviewed` |

## Fundamentals

Reference text: [proposed fundamentals](programming-fundamentals.en-US.md), expanded by [data and time](data-and-time.en-US.md) and [failures and resources](failures-and-resources.en-US.md). Examples and methods are local, not a complete curriculum. The [initial record](fundamentals-verification.en-US.md) and [core verification](core-verification.en-US.md) separate executed cases from documentary review; the following columns do not claim complete execution for each element.

### Problem, Data, and Structure

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| FUND-001 | `REF` [SRC-MIT-SPECIFICATIONS](#src-mit-specifications) + `LOCAL`. | Contracts checked. Stakeholders, priorities, and minimum solution are local decisions; problem discovery is not validated. | Formulate input, output, and error examples; check that each part of a proposed solution addresses an identified need. | `document-reviewed` |
| FUND-002 | `REF` [SRC-MIT-INVARIANTS](#src-mit-invariants), [SRC-RFC8259](#src-rfc8259), [SRC-RFC3339](#src-rfc3339), [SRC-UNICODE-NFC](#src-unicode-nfc), [SRC-W3C-CLOCK](#src-w3c-clock), [SRC-JAVA-ZONES](#src-java-zones), [SRC-DOTNET-NUMBERS](#src-dotnet-numbers) + `LOCAL`. | Representation, ranges, rounding, text, and time developed with models. Domain policies and real language, calendar, or time-zone behavior are not generalized from them. | Prepare missing, empty, zero, and boundary cases; check invariants and relevant conversions without unintended loss. | `document-reviewed` |
| FUND-003 | `REF` [SRC-CORNELL-LOOPS](#src-cornell-loops), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation) + `LOCAL`. | Progress and cooperative cancellation developed. A step count is not a timeout; blocked calls and actual budgets need specific checks. | Trace branches with examples; justify termination; test cancellation or a limit for a long-running operation when applicable. | `document-reviewed` |
| FUND-004 | `REF` [SRC-MIT-COHESION](#src-mit-cohesion) + `LOCAL`. | Specification coherence checked. Does not establish sizes, layers, or a universal division of responsibilities. | Review each module's inputs, effects, and responsibility; demonstrate that a proposed separation improves a specific change or test. | `document-reviewed` |
| FUND-005 | `REF` [SRC-MIT-EFFECTS](#src-mit-effects) + `LOCAL`. | Separation of computation and printing checked. Extension to networking, storage, and operating systems is a local proposal. | Verify a core rule without an interface or network when practical; test the external-effect boundary separately. | `document-reviewed` |
| FUND-006 | `REF` [SRC-MIT-CONCURRENCY](#src-mit-concurrency), [SRC-DOTNET-USING](#src-dotnet-using), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation), [SRC-RFC9110](#src-rfc9110) + `LOCAL`. | Ownership, cleanup, reentrancy, and retries developed. Serial models without crashes do not establish real thread behavior, durability, or intersystem coordination. | Identify owners and transitions; rehearse interruption, simultaneous requests, and shutdown; detect leaks or repeated effects. | `document-reviewed` |

### Security, Quality, and Maintenance

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| FUND-007 | `REF` [SRC-OWASP-INPUT](#src-owasp-input), [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-ERROR](#src-owasp-error), [SRC-OWASP-CRYPTO](#src-owasp-crypto), [SRC-OWASP-THREATS](#src-owasp-threats) + `LOCAL`. | Permissions, inputs, errors, established cryptography, and contextual analysis checked. The specific taxonomy and case controls are local. | List threats and controls for a bounded case; test rejected inputs and access; review messages without exposing internal data. | `document-reviewed` |
| FUND-008 | `REF` [SRC-GOOGLE-REVIEW](#src-google-review) + `LOCAL`. | Contextual support against speculative complexity. Independent policies and mechanism choices require local justification. | Compare two designs for a real need; record change costs and test whether shared code represents the same business rule. | `document-reviewed` |
| FUND-009 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), [SRC-MIT-TESTING](#src-mit-testing), [SRC-GOOGLE-TESTING](#src-google-testing) + `LOCAL`. | SSDF PW.8 supports security testing; MIT/Google support cases, scopes, and determinism. Mandatory automation and the specific test distribution are local policies. | Select cases by behavior and risk; repeat them with controlled clocks and dependencies; demonstrate a defect that high coverage does not detect. | `document-reviewed` |
| FUND-010 | `REF` [SRC-MIT-ALGORITHMS](#src-mit-algorithms) + `LOCAL`. | Results and addition counts checked in models. Product timing or memory was not measured; the measurement protocol and targets are local. | Measure time and memory with representative sizes; compare before and after under the same conditions and record the difference and its costs. | `document-reviewed` |
| FUND-011 | `REF` [SRC-W3C-WCAG22](#src-w3c-wcag22), [SRC-W3C-I18N](#src-w3c-i18n) + `LOCAL`. | Web criteria and internationalization partially checked. No tested interface, full conformance, native accessibility, or legal assessment. | Define user tasks, navigation, and relevant assistance; test formats and text in the product's languages and record barriers. | `document-reviewed` |
| FUND-012 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), [SRC-GOOGLE-REVIEW](#src-google-review) + `LOCAL`. | PW.4.1/PW.4.4 and documentation checked. Specific licenses, compatibility, and dependency costs require their own decisions. | Inventory dependencies and owners; review origin, versions, license, and risks; check that someone can follow the instructions and understand a significant decision. | `document-reviewed` |

## Development Workflow

Reference text: [proposed workflow](development-workflow.en-US.md). Its ordering and definition of done are local design choices, not a development life cycle required by the sources.

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| FLOW-001 | `LOCAL`; preparing a change. | Proportionate preparation justified to avoid hidden assumptions; the bilingual template implements REQ-U-004. Scenarios evaluated in applicability. | Review a change record with acceptance, boundaries, risks, and decisions; detect missing information before the activity that depends on it. | `document-reviewed` |
| FLOW-002 | `LOCAL`; proportionate design and prevention. | Local preventive questions justified by risks, without certifying disciplines or requiring irrelevant controls. Not a universal process. | Walk through a failure, permission, or data-loss case; relate requirements to design, controls, and justified decisions. | `document-reviewed` |
| FLOW-003 | `LOCAL`; reviewable increments. | Local policy justified by change attribution and review: coherent increments, tests, and parity; allows atomic changes across files. | Inspect an increment: focused scope, others' work preserved, associated tests, and equivalent documentation. | `document-reviewed` |
| FLOW-004 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.7/PW.8 + `LOCAL`. | Partial support for security review and testing. Other areas and completion conditions are local proposals. | Execute a set of applicable checks; retain identification, environment, method, outcome, and omissions; confirm that no omitted check is marked as passed. | `document-reviewed` |
| FLOW-005 | `LOCAL`; review and honest delivery. | Local completion definition evaluated against complete and partial delivery. Requires correspondence with acceptance, not a universal format or team. | Compare a delivery package with acceptance and evidence; check instructions, limitations, pending items, and correspondence between delivered and reviewed content. | `document-reviewed` |

## Platform Profiles

Reference text: [proposed profiles](platform-guidelines.en-US.md). The review covers these lists as local guidance, not native technical guides. Current official requirements and support are checked when implementing each consumer; general security sources do not establish compatibility, distribution, or native behavior.

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| PLAT-001 | `USER` REQ-U-001 + `LOCAL`. | Local advisory checklist for framing web requirements around existing functions; not normative procedures, implementations, or approved browser support. | Create a browser/environment matrix; check flows, connectivity, permissions, and deployment; compare chosen controls with applicable official documentation. | `document-reviewed` |
| PLAT-002 | `USER` REQ-U-001 + `LOCAL`. | Local advisory checklist of desktop targets, including macOS; documentary evaluation does not establish installation, signing, distribution, or native behavior. | Select systems and architectures; verify installation, updates, data, shutdown, and accessibility; consult official requirements for the selected channel, including macOS where applicable. | `document-reviewed` |
| PLAT-003 | `USER` REQ-U-001 + `LOCAL`. | Local advisory checklist of mobile conditions; selecting Android/iOS, current requirements, and actual tests belongs to the consumer. | On declared devices or environments, rehearse interruptions, permissions, variable connectivity, synchronization, and updates; measure resources according to actual features. | `document-reviewed` |
| PLAT-004 | `LOCAL`; share code only where beneficial. | Justified local decision: share only with benefit and check adapters separately. Separate implementations are allowed; a single cross-platform application is not required. | Test the same shared rule and each adapter; record differences and evidence by platform without generalizing one result to the others. | `document-reviewed` |

## Consumer Project Template

Reference text: [proposed template](../templates/project-brief.en-US.md). Its fields will be completed in separate projects. Its structure is not prescribed by a standard, and filling in fields does not validate a project.

| ID | Origin and identified support | Scope or pending limitation | Expected verification | Status |
| --- | --- | --- | --- | --- |
| BRIEF-001 | `USER` REQ-U-001 + `LOCAL`. | Local fields justified to avoid ambiguous adoption; external location requested by the user. Identity and approval are completed only when they exist. | Identify owner, purpose, and exact foundation release; check that the reference matches the content actually adopted. | `document-reviewed` |
| BRIEF-002 | `LOCAL`; scope and acceptance. | Local fields for observable acceptance and separating exclusions/assumptions; evaluated in applicability without treating an internal link as external support. | Link each outcome to a verifiable criterion; distinguish exclusions, assumptions, and confirmations. | `document-reviewed` |
| BRIEF-003 | `USER` REQ-U-001/REQ-U-004 + `LOCAL`. | Project types and language separation are supported by the conversation; versions and interface languages are selected per project. | Compare both language documents; separate planned from verified platforms and require evidence for the latter; declare product languages. | `document-reviewed` |
| BRIEF-004 | `LOCAL`; design and tooling decisions. | Local fields justified for visible decisions; they do not select a language, architecture, or manager for future consumers. | Review alternatives and rationale, contracts, and responsibilities; check versions and ensure no selection is presented as imposed by the foundation without support. | `document-reviewed` |
| BRIEF-005 | `REF` [SRC-OWASP-INPUT](#src-owasp-input), [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-SECRETS](#src-owasp-secrets), [SRC-SQL-RESTORE](#src-sql-restore) + `LOCAL`. | Inputs, permissions, secrets, and restoration have contextual support. Retention and deletion are explicit decisions; operational consumer recovery has not been tested. | Relate data to purpose, access, and controls; check recovery where applicable to data that must be preserved; verify rejection cases and dummy configuration without real secrets. | `document-reviewed` |
| BRIEF-006 | `LOCAL`; targets and evidence. | Local fields justified for relating objectives to methods and evidence; filling fields does not establish quality. | Check that each target has a method, environment, threshold where applicable, and planned evidence; review non-applicability reasons and pending items. | `document-reviewed` |
| BRIEF-007 | `LOCAL`; setup and operations. | Local fields justified to reduce hidden knowledge; commands and checks are specified for each deliverable without claiming the template executes them. | Reproduce setup and delivery with real instructions; test diagnostics and transition according to risk; record failures and platforms actually exercised. | `document-reviewed` |
| BRIEF-008 | `LOCAL`; pending items and approval. | Local fields justified for identifying authority and decisions before dependent stages; completeness is not approval. | Review the owner and deadline of each pending item; compare status with evidence and the approval decision, and check bilingual equivalence. | `document-reviewed` |

## Scope Closure and Limits

All 39 elements are document-reviewed: their origins and local decisions are identified, and [applicability](applicability.en-US.md) records 39 case pairs with criteria and results. Reviewer: development assistant with assisted cross-review, 2026-09-02. This is not human approval, an independent audit, or comprehensive functional validation. Expected-verification columns retain criteria for future implementations; they do not claim all have been executed here.

Local automation, dependency, and compatibility conditions are resolved; source entries identify editions, revisions, or courses with explicit limits. There are 31 entries, not 31 independent works. SWEBOK is context excluded from support. All four profiles are included only as reviewed advisory checklists, not approved platform procedures or established support.

[Release readiness](release-readiness.en-US.md) brings together checks, preservation, and candidate integrity. Explicit approval of the exact content remains pending under [governance](foundation-governance.en-US.md). Test applications are not missing here: installations, interfaces, performance, operational restoration, and platform trials belong to the consumers that implement them. Sector-specific legal or regulatory compliance has not been evaluated.
