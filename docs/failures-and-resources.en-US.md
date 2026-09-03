# Failures, Cancellation, Resources, and Recovery

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](failures-and-resources.es-419.md) · [Home](../README.en-US.md)

## Scope and Use

This expansion develops FUND-003 and FUND-006 from the [fundamentals](programming-fundamentals.en-US.md) and aspects of RULE-004 and RULE-005. It adds no rules and selects no platform. The examples are original local models; the proposed conditions require their own implementation and evidence in each consuming project, outside this base. Support and its limits appear in [traceability](traceability.en-US.md).

The tables describe expected results. The [core verification record](core-verification.en-US.md) identifies which were executed and with what limits; an expectation is not a passed test.

## Resource Ownership and Cleanup

Before using a file, connection, subscription, or another resource, identify who acquires it, who may use it, and who releases it. Receiving a borrowed resource does not automatically transfer ownership. After successful acquisition, arrange cleanup for all controlled exits, including an error or cancellation. If acquisition partially fails, its implementation must handle internal resources whose ownership it never transferred to the caller.

The [C# reference for `using`](traceability.en-US.md#src-dotnet-using) documents disposal when leaving a scope, including through an exception. This is a specific mechanism, not a selection of C# or a guarantee against abrupt process termination. Other environments require checking their own guarantees.

Local proposal: preserve the work result and cleanup result separately. A cleanup failure must not erase the original failure or become success. Attempting release does not prove release succeeded; nor does it authorize indiscriminately repeating cleanup that may have effects. Asynchronous cleanup requires observing its completion according to the contract. Do not subsequently use a released resource or close it while another authorized owner is still using it.

## Cancellation, Limits, and Unknown Outcomes

A cancellation request asks work to stop; it does not prove that work has stopped. The [.NET documentation](traceability.en-US.md#src-dotnet-cancellation) explains cooperation between the party requesting cancellation and the party observing it. A blocked call may need a specific mechanism to respond.

Local proposal: check cancellation before starting each work unit, bound the duration of units when necessary, and document what happens to completed work. In the three-unit model, cancellation observed after the first returns `Cancelled` with `completed=1`; it does not undo that unit. A request received after confirmed completion must not invent a reversal.

An expired time limit ends the permitted wait, not necessarily the remote operation. If an effect may have occurred and the response was lost, the local outcome is `Unknown`, not `NotApplied`. Preserve the operation's identity to query or reconcile its outcome. Define a total budget, including retries; do not silently extend it by restarting the counter. This policy is local and does not implement clocks, network cancellation, or distributed confirmation.

## Concurrency, Reentrancy, and Transitions

The [concurrency reference](traceability.en-US.md#src-mit-concurrency) discusses confinement and immutability. The local contract must identify the complete transition preserving the invariant, not only isolated writes. For one available slot, checking availability and reserving it form a single transition with respect to competing requests.

Example: with `initialCapacity=1`, both A→B and B→A must produce one acceptance, one rejection, and zero remaining slots. If both requests read `1` before writing, they may accept twice even though the final value is `0`; checking only that value misses the defect.

A single thread does not exclude reentrancy: calling external code or suspending may allow another request before the previous one finishes. Declare whether that is possible. Confinement, transactions, atomic operations, or mutual exclusion are environment-dependent alternatives, not interchangeable recipes. A local lock does not demonstrate coordination across processes, and a word such as `atomic` in pseudocode does not implement it. Serial models do not test real threads, deadlocks, or crash recovery.

## Retries and Bounded Idempotency

[RFC 9110, Section 9.2.2](traceability.en-US.md#src-rfc9110) defines idempotency by the requested effect of identical repetitions, not necessarily identical responses. It distinguishes when automatically repeating an HTTP request is reasonable; it does not provide a deduplication implementation for every business operation.

Local proposal: retry only errors classified as recoverable when repetition is safe, with bounded attempts and a bounded total budget. Define delays appropriate to the service; a retry does not fix permissions or invalid inputs. When an effect is uncertain and no relevant guarantee exists, reconcile it before repeating.

If idempotency keys are used, specify:

- Scope: authorized identity, operation type, and key; a key does not replace authorization.
- Payload: a stable equality criterion; reject reuse of a key with different content.
- Coordination: checking, applying the effect, and recording the result must prevent duplicates under simultaneous requests and crashes within the promised scope.
- Persistence and expiration: record lifetime and treatment of late requests; losing or expiring the record may allow another effect.

The example uses an in-memory map and serial requests: `keyA` with payload `2` returns `Applied2`; repetition returns `Replayed2` without another effect; payload `3` returns `Conflict`. This does not demonstrate persistent atomicity, crash tolerance, or “exactly once” execution. If the record and effect belong to different systems, resolving that coordination requires another design and other tests.

## Recovery and Permanent Deletion

When data must be retained, define the recoverable point, acceptable loss, recovery time, and who may restore it. Identify necessary content, version, dependencies, and permissions; protect backups as well. The [SQL Server restore guide](traceability.en-US.md#src-sql-restore) requires testing restores in its context. Its use here supports that distinction without adopting SQL Server or turning all its instructions into universal rules.

Local proposal: rehearse an isolated restore, check that expected content is complete, that its structure and invariants are valid, and that it can be used. An existing file, a successful backup message, or a checksum alone does not demonstrate all of those properties. Record the actual procedure, its results, and limits before relying on it for the data in scope.

The expected model is `{version:1, items:[2,3], total:5}`. Restoring an equivalent copy in memory satisfies that case; an incomplete copy or `{version:1, items:[1,4], total:5}` does not. Preserving the total is not enough to preserve the content. Disks, database backups, credentials, and actual recovery times are not tested.

Before a destructive action, confirm the exact target, scope, and verifiable authorization; a preapproved policy may provide that authorization. Disposable data and authorized permanent deletion do not inherently require a recoverable copy: document their classification and limits, including affected copies. Do not create retention that contradicts a required deletion. Ambiguous authorization prevents action; these models authorize no actual deletion.

## Verification Cases

| Original case | Expected result | Defect detected |
| --- | --- | --- |
| Successful work and cleanup after acquisition | Success; one cleanup attempt. | Omitting normal cleanup. |
| Acquisition fails before ownership transfer | Acquisition error; zero caller cleanup attempts. | Closing an unacquired resource. |
| Work fails after acquisition | Original error; one cleanup attempt. | Exiting before cleanup. |
| Work and cleanup both fail | Original and secondary errors preserved. | Hiding either error or reporting success. |
| Cancellation after the first of three units | `Cancelled`, `completed=1`. | Continuing the other two units. |
| Remote effect possible, response lost | `Unknown`. | Claiming the effect did not occur. |
| Same key and payload repeated; then different payload | `Applied2`, `Replayed2`, `Conflict`; one effect. | Duplicating or accepting an ambiguous key. |
| Complete copy; altered copy with equal total; incomplete copy | Accept only the complete copy. | Checking only the total or existence. |

All of these scopes are deliberately small. Passing them does not establish an operational recovery strategy, safe concurrency, or full compliance with the rules.
