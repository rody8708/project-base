# Programming Fundamentals

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](programming-fundamentals.es-419.md) · [Home](../README.en-US.md)

## How to Interpret These Fundamentals

These fundamentals develop twelve areas of reasoning for consuming projects created outside this foundation. They guide the application of the [proposed rules](immutable-rules.en-US.md), but they are neither a complete standard nor comprehensive programming instruction. Their documentary support is identified per element in [traceability](traceability.en-US.md), along with local decisions, limits, and pending items; it does not amount to technical validation.

They do not prescribe a paradigm, a number of layers, or a set of patterns. Specific decisions must reflect the project's size, risks, and team capabilities. Prescriptive language describes proposed guidance, not obligations already adopted. Mandatory force will depend on rules explicitly approved in a future stable release and adopted by the consuming project, according to [foundation governance](foundation-governance.en-US.md).

The examples and criteria below are original local designs, not code taken from the sources. The pseudocode uses zero-based indexes, mathematical integers, and explicit results such as `Absent` or `InvalidInput`; it does not select a language. An implementation will need to address types, numeric limits, and external inputs in its own environment. The cases show expected results, not product executions. The [initial model record](fundamentals-verification.en-US.md) retains 17 checks; [core verification](core-verification.en-US.md) adds 80 and eight documentary scenarios. They distinguish executed examples, contract reviews, and aspects not checked in products.

## FUND-001 — Understand the Problem Before Coding

Proposed application: identify who needs the outcome and describe inputs, outputs, errors, and effects before choosing an implementation. A contract distinguishes what it requires of the caller from what the operation guarantees. At an untrusted boundary, those requirements do not replace actual validation. Clarify ambiguities with the responsible person; meeting the wrong specification does not solve the right problem.

Example: calculate how many packages are needed for `n` units, with a positive integer capacity. Zero units require zero packages; a partial package counts as a whole one. No external data is modified.

```text
function packageCount(n, capacity):
    if n < 0 or capacity <= 0: return InvalidInput
    return n DIV capacity + (1 if n MOD capacity != 0 else 0)
```

Expected check: `(0,4) → 0`, `(8,4) → 2`, `(9,4) → 3`; `(-1,4)` and `(3,0)` are rejected. The variant that returns only `n DIV capacity` fails for `(9,4)`. The criterion must distinguish between these solutions, rather than merely saying “calculates correctly.”

Support and limits: [MIT, Specifications](traceability.en-US.md#src-mit-specifications) supports contracts and their guarantees. Selecting stakeholders, prioritizing needs, and seeking a minimal solution are local proposals; this example does not validate the requirements discovery process or inputs of every type.

## FUND-002 — Model Data and Invariants

Proposed application: define what each data item represents and which conditions make its state valid. An invariant is a condition that public operations preserve. Prevent other parts of the program from directly modifying the representation and bypassing its controls. Distinguish missing data, empty text, and zero when they have different meanings.

Example: a closed interval of integer positions satisfies `0 <= start <= end`. Equality represents a valid position, not an invalid interval.

```text
function makeInterval(start, end):
    if start < 0 or end < start: return InvalidInterval
    return immutable {start: start, end: end}
```

Expected check: `(2,5)` and `(3,3)` are valid; `(4,3)` and `(-1,3)` are rejected. Checking only `start >= 0` allows a reversed interval. In an implementation, also review whether any public operation or shared reference can break the invariant after the value is constructed.

Support and limits: [MIT, Abstraction Functions & Rep Invariants](traceability.en-US.md#src-mit-invariants) supports invariants and representation protection. `immutable` describes a required property, not a word that guarantees it in every language. [Data and time](data-and-time.en-US.md) develops units, limits, precision, encoding, and dates with specific sources and cases. The interval alone does not verify those aspects or their adaptation to a real domain.

## FUND-003 — Use Clear Control Flow

Proposed application: make conditions, progress, and exits visible. For an operation that must terminate, explain what remains true and which quantity decreases until exit. A service that must remain active needs a different criterion: work progress, limits, and controlled shutdown; not every process is required to terminate spontaneously.

Example: find the position of the first negative value in a finite sequence that does not change during traversal.

```text
function firstNegative(values):
    i = 0
    while i < length(values):
        if values[i] < 0: return Present(i)
        i = i + 1
    return Absent
```

Expected check: `[] → Absent`, `[3,0,-2] → Present(2)`, `[0] → Absent`. Before each evaluation of the loop condition, `0 <= i <= length(values)` and no element before `i` is negative. If the operation does not return, `length(values)-i` decreases. The variant that advances only over positive values gets stuck on `[0]`; a step limit allows this to be detected without running an infinite loop.

Support and limits: [Cornell, Loop Invariants](traceability.en-US.md#src-cornell-loops) supports this reasoning. Each access and comparison is assumed to terminate. [Failures and resources](failures-and-resources.en-US.md) develops cooperative cancellation, budgets, and unknown outcomes. The step counter is not a production timeout; blocked calls need environment-specific mechanisms and checks.

## FUND-004 — Design Cohesive Functions and Modules

Proposed application: give each operation an explainable responsibility and a coherent contract. Separate tasks when a real need for change or a test demonstrates the benefit; do not split them based on an arbitrary line count. Choose names that express intent and declare effects.

Example: adding units does not require generating labels. Each row has a nonnegative integer `units` value; `label` is optional and does not affect the sum.

```text
function totalUnits(rows):
    total = 0
    for row in rows:
        total = total + row.units
    return total
```

Expected check: `[] → 0`; two rows with units `3` and `2` produce `5`, even if the first has no label. Adding, changing, or removing labels preserves the total. A combined operation that requires a label to add units violates this contract. Checks for external rows and label formatting are verified at their own boundaries.

Support and limits: [MIT, Designing Specifications](traceability.en-US.md#src-mit-cohesion) supports coherent specifications without offering an infallible recipe. This separation is a decision for the example; multiple results or effects can legitimately belong to the same operation. It does not demonstrate an architecture or a universal rule for module size.

## FUND-005 — Isolate Business Rules and External Effects

Proposed application: distinguish computation from interaction with the outside world when this makes each responsibility easier to understand and test. Declare which operation calculates a result and which displays, stores, or transmits it. A useful separation does not, by itself, require classes, remote services, or multiple layers.

Example: calculate remaining units from nonnegative integers; completing more than required leaves zero units remaining. In this model, `output.write(value)` returns `Written` or `OutputError`; the display operation returns that result without hiding it.

```text
function remainingUnits(required, completed):
    return max(0, required - completed)

function displayRemaining(required, completed, output):
    return output.write(remainingUnits(required, completed))
```

Expected check: the calculation returns `7` for `(10,3)` and `0` for `(3,10)` without opening a screen. A successful write returns `Written`; a failed write returns `OutputError`, without changing the mathematical result or reporting success. A variant that requires an available output within the calculation introduces an undeclared effect; another that discards the write error violates the display contract.

Support and limits: [MIT, Code Review](traceability.en-US.md#src-mit-effects) supports returning results separately from printing them. Extending this criterion to networking, storage, and operating systems is a local proposal that requires assessing costs and contracts. The case does not test an actual adapter or require separating operations that are inseparable under their transactional contract.

## FUND-006 — Control State, Concurrency, and Resources

Proposed application: identify who owns the state, who can modify it, and how a complete transition is coordinated. Consider confinement or immutability when they simplify correctness; expecting two operations to “normally” avoid overlapping is not enough. Also document the acquisition and release of files, connections, or subscriptions when they exist.

Example: only one slot remains. One owner processes each complete request serially, without suspending it or allowing another request inside `reserve`.

```text
remaining = 1
function reserve():
    if remaining == 0: return Rejected
    remaining = remaining - 1
    return Accepted
```

Expected check: the complete orders A→B and B→A produce one acceptance and one rejection, with `remaining == 0`. Without coordination: A reads `1`, B reads `1`, A writes `0` and accepts, B writes `0` and accepts. Two acceptances violate `acceptedCount + remaining == initialCapacity`.

Support and limits: [MIT, Thread Safety](traceability.en-US.md#src-mit-concurrency) supports confinement and immutability as strategies. Serial execution is a model assumption, not an installed concurrent implementation. [Failures and resources](failures-and-resources.en-US.md) expands on reentrancy, retries, cleanup, and idempotency with explicit assumptions. Its models do not test real threads, durability, intersystem coordination, or the absence of interface blocking.

## FUND-007 — Treat Errors and Security as Part of the Design

Proposed application: account for untrusted inputs, rejected access, and external failures as part of the behavior. Separate the public message from internal diagnostics; protect logs as well. Do not invent cryptographic algorithms. Link each control to a threat and review how it will be verified, without assuming that a generic checklist demonstrates security.

Documentary example: only the owner may read a protected document. Storage can fail with a message containing a fictitious path.

| Case | Expected result | Failure to detect |
| --- | --- | --- |
| Authorized owner; document available | Permitted content after the access check. | Returning content before checking permission. |
| Another person requests the same identifier | Rejection without content. | Bypassing permission because the identifier is known. |
| Authorized owner; storage fails | Useful public error without the internal path; controlled diagnostics. | Displaying the internal error directly. |

Expected check: review the actual control, not just button visibility. If the document's existence is sensitive, do not reveal it through different messages either. An error does not automatically authorize a retry; that depends on the operation's effects.

Support and limits: OWASP supports [input handling](traceability.en-US.md#src-owasp-input), [authorization](traceability.en-US.md#src-owasp-auth), [errors](traceability.en-US.md#src-owasp-error), [established cryptography](traceability.en-US.md#src-owasp-crypto), and [threat modeling](traceability.en-US.md#src-owasp-threats). The specific error classification and this case are local decisions; no storage, controls, or cryptography have been implemented or tested here.

## FUND-008 — Seek Simplicity and Demonstrated Reuse

Proposed application: avoid complexity for merely hypothetical needs. Before sharing code, identify whether it represents the same policy or only similar-looking operations. Consider understanding and the cost of change, not just lines removed.

Example: book loans and room reservations have independent limits; counts and limits are nonnegative integers.

```text
function canBorrowBook(active, loans, bookLimit):
    return active and loans < bookLimit

function canReserveRoom(active, reservations, roomLimit):
    return active and reservations < roomLimit
```

Expected check: for an active person, `loans=2`, `bookLimit=3`, `reservations=0`, and `roomLimit=1` allow both actions. Changing only `bookLimit` to `2` rejects the loan but still allows the reservation. An abstraction that turns both limits into a global policy violates that independence. Sharing a comparison can be correct if it preserves both contracts; keeping separate functions can also be correct.

Support and limits: [Google, reviewing complexity](traceability.en-US.md#src-google-review) provides guidance against speculative generalizations. It is contextual guidance, not a universal standard. The example's policy independence is local; this citation does not automatically choose composition, inheritance, or duplication.

## FUND-009 — Verify Observable Behaviors

Proposed application: choose tests according to the contract and risk. Combine isolated rules, integration boundaries, and complete flows when they provide distinct evidence. Control clocks, randomness, or dependencies when they introduce unwanted variation; retain tests with real dependencies when the behavior of that integration is what needs to be verified. Record executions and omissions separately.

Example: an operation remains open only before closing. `now` and `closesAt` are nonnegative integers on the same time scale; the closing endpoint is exclusive.

```text
function isOpen(now, closesAt):
    return now < closesAt
```

Expected check: `(8,10) → true`, `(10,10) → false`, `(11,10) → false`, repeatable with the same values. The incorrect variant `<=` passes the cases for `8` and `11` but fails for `10`. Executing the entire expression without checking the boundary can hide the defect; line coverage does not mean the result is correct.

Support and limits: [MIT, Testing](traceability.en-US.md#src-mit-testing) supports partitions, boundaries, and scopes; [Software Engineering at Google](traceability.en-US.md#src-google-testing) supports controlling nondeterminism and understanding coverage limits. Their percentages and infrastructure are not adopted. The example does not test an actual clock, time zones, or a distributed system. RULE-006's regression requirement remains a local policy pending approval.

## FUND-010 — Evaluate Complexity and Measure Performance

Proposed application: distinguish growth in work from an actual time measurement. Identify input size, counted operations, and assumptions. An optimization provides useful evidence only if it preserves the contract and is evaluated under conditions relevant to the project.

Example: produce cumulative totals. `[3,-1,4] → [3,2,6]`; an empty input produces an empty output. Design A sums again from the beginning for each position; design B adds each value once to an accumulator and stores each total. Both count one addition per visited value, including the first.

With constant-cost additions and `n` values, A performs `n(n+1)/2` additions and B performs `n`: for `n=3`, these are `6` and `3`. Both store `n` results; the accumulator does not eliminate that cost. These are analytical counts, not measured times or a promise to speed up a product by a particular factor.

Expected check: first compare results for empty input, zeros, and negatives. To measure, declare the implementation, environment, sizes, data, and whether setup is included; repeat under equivalent conditions and record variation and memory use. If the supposed improvement changes results or measurements are inconsistent, do not present it as demonstrated.

Support and limits: [MIT, Introduction to Algorithms](traceability.en-US.md#src-mit-algorithms) supports analysis by size and computational model. The measurement protocol is local. Results and addition counts were checked in the [core record](core-verification.en-US.md), not the time-and-memory experiment. Numeric limits, actual costs, and targets must be defined for the consumer project.

## FUND-011 — Design for People and Their Context

Proposed application: declare people's tasks, their contexts, and the accessibility goals relevant to the interface. For web content, consider keyboard operation, visible focus, labels, and identifiable errors. Plan localization without assuming that each language corresponds to a single regional format. The languages of these documents do not determine the product's languages.

Documentary example: a field for choosing a delivery date. The design states its purpose and format, how to reach it using a keyboard, recognize focus, change the value, and confirm.

Expected check: for `31/02/2026`, identify the field and explain the problem in text, not just color. Do not silently interpret `04/03/2026` without a regional context or declared format. To represent April 3 in the example, “3 de abril de 2026” and “April 3, 2026” must refer to the same date; this does not establish a single numeric convention for Latin America. A translation assembled from rigid fragments must be reviewed if it prevents a natural sentence.

Support and limits: [W3C, WCAG 2.2](traceability.en-US.md#src-w3c-wcag22), criteria 2.1.1, 2.4.7, 3.3.1, and 3.3.2; [W3C, Internationalization Quick Tips](traceability.en-US.md#src-w3c-i18n), formats and translatable text. These are partial web references. Without an executable interface, keyboard operation, assistive reading, and presentation have not been tested. Full WCAG conformance, native accessibility, and legal compliance are not established; they require their own evaluation.

## FUND-012 — Maintain Dependencies and Knowledge

Proposed application: treat each dependency as an ongoing decision, not an installation that completes the work. Record identity, provenance, version, selection rationale, relevant reviews, and the responsible person. Maintain decision explanations and usage instructions when they change.

Documentary example, with no package installed:

```text
candidate:
    identity: identified
    artifactVersion: identified
    provenanceEvidence: linked
    licenseReview: pending
    behaviorChecks: pending
decision: pending
```

Expected check: with the required information and reviews complete, the candidate becomes ready for a responsible decision, not automatically approved. If provenance is missing or reviews are pending, retain `pending`, even if a demonstration works. Ask another person to find the version, rationale, verifications, and pending items; record actual questions. That knowledge-transfer review is planned, not completed.

Support and limits: [NIST SSDF, PW.4.1/PW.4.4](traceability.en-US.md#src-nist-ssdf) supports evaluating and maintaining components; [Google, comments and documentation](traceability.en-US.md#src-google-review) supports useful explanations and instructions. The sources do not approve a specific package or determine license obligations, acceptable costs, or a universal update frequency. This foundation also does not adopt Google's preference for English-only comments.

## Questions for Reviewing a Solution

- Are the behavior and invalid states clear?
- Can the logic be understood and tested without unnecessary details?
- What happens with invalid data, insufficient permissions, interruptions, or external failures?
- Is data protected, and are resources released?
- Does the complexity address a real, verifiable need?
- Can another person set up the project and verify the change using the available documentation?
