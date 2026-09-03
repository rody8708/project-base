# Development and Quality Workflow

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](development-workflow.es-419.md) · [Home](../README.en-US.md)

## Objective

Propose a practical routine for consuming projects developed outside this foundation, based on the [proposed rules](immutable-rules.en-US.md). This is not the procedure for approving or publishing the documentary core: that process is separate in [foundation governance](foundation-governance.en-US.md). The size of the record and the depth of verification depend on the risk; no particular collaboration platform or tool is required.

This workflow is an internal proposal, not an exhaustive standard or a technically validated process. Its supporting basis and limits are recorded in [traceability](traceability.en-US.md). Its instructions and definition of done describe intended operation after the approval and adoption of a future stable release; they do not represent obligations already adopted.

## FLOW-001 — Define

- Describe the problem, expected outcome, scope, and acceptance criteria.
- Identify affected platforms, users, data, permissions, and contracts.
- State assumptions and resolve decisions that materially change the scope.
- For a new project separate from this foundation, complete the [project brief](../templates/project-brief.en-US.md) in both languages, identifying an approved stable release before declaring its adoption.

## FLOW-002 — Design What Is Needed

- Choose the smallest solution that satisfies the requirements.
- Define contracts, validations, and handling of relevant failures.
- Evaluate security, privacy, accessibility, compatibility, and performance; establish specific targets when applicable or justify why they do not apply.
- Identify destructive or breaking changes and establish authorization, recovery for data that must be retained, and transition planning for breaking contracts, as applicable, before carrying them out.
- Record alternatives and rationale only for decisions with significant impact.

## FLOW-003 — Implement in Increments

- Work in focused, reviewable changes, preserving other people's existing work.
- Stay consistent with the project's documented conventions.
- Add tests alongside the behavior, including regression tests for reproducible defects.
- Update example configuration, contracts, and documentation in both languages.

## FLOW-004 — Verify

Run the project's checks from an appropriate environment and record which version or set of changes was verified, how, and with what result. Use the actual commands defined for that project; this documentation foundation does not provide application build or test commands.

The following table describes planned checks for the consuming project, not checks already performed or evidence that this foundation is technically valid. Keep the verification plan separate from the record of actual results; a documentary review does not prove an implementation, an installation, or platform compatibility.

| Area | Minimum check, as applicable |
| --- | --- |
| Documentation | Language pairs, semantic equivalence, links, and consistent identifiers and versions. |
| Code | Formatting, static analysis, and type checking when the ecosystem provides them. |
| Behavior | Automated tests for changed and affected flows; regression tests for reproducible defects. |
| Boundaries | Invalid inputs, external errors, permissions, and relevant retries. |
| Data | Verified migration and recovery for data that must be retained; documented authorized scope for disposable data or permanent deletion. |
| Security | Review of secrets, data exposure, and permissions; review of dependencies when present. |
| Interface | Interaction, accessibility, and screen sizes or devices within scope. |
| Distribution | Setup, build, installation, or deployment according to the deliverable and declared platforms. |

A failed check must be resolved or remain visible as pending work. If a control does not apply, the reason is recorded. If it applies and cannot be run, it is not marked as passed, and the change does not meet the definition of done.

## FLOW-005 — Review and Deliver

- Review all modified files and confirm that there are no out-of-scope changes or sensitive data.
- Compare the result with the acceptance criteria and applicable rules.
- Explain what changed, what was verified, what was not run, and what risks remain.
- Include usage and transition instructions when contracts or operating procedures change.
- Identify the work as complete only when the following checklist is satisfied. A partial delivery is identified as partial.

## Definition of Done

- [ ] The result meets all agreed-upon acceptance criteria.
- [ ] Applicable rules are met, and their evidence is recorded.
- [ ] Affected contracts, validations, errors, and permissions have been reviewed.
- [ ] Required checks have been run, and their results are satisfactory.
- [ ] Fixed reproducible defects have a regression test.
- [ ] Data or compatibility changes have verified authorization and transition when applicable.
- [ ] Instructions and documentation are up to date and equivalent in both languages.
- [ ] The complete change has been reviewed, and unrelated modifications have not been included without authorization.
- [ ] Support limitations, residual risks, and operational requirements have been communicated.

## Minimum Verification Record

For each delivery, retain: identification of the change, environment or platform, exact check or command, date, result, evidence location, and limitations. Explicitly distinguish “planned,” “run successfully,” “run with failure,” and “not run”; a planned check is not recorded as passed. The project's own record also respects language separation. Do not include tokens, credentials, or real personal data.

Human review is necessary for criteria involving meaning, scope, and translation. The proposal is to incorporate automated controls when each executable consuming project is created, without presenting a checklist as though it were already installed automation. This document does not claim that such controls exist in this foundation.
