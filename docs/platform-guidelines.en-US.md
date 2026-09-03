# Platform Guidelines

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](platform-guidelines.es-419.md) · [Home](../README.en-US.md)

## Scope

These profiles help define consuming projects to be developed outside this foundation. They are proposed, nonexhaustive areas to evaluate, not a promise of compatibility, technical validation, or a technology selection. Each project turns the relevant criteria into requirements and tests, and justifies those that do not apply. The [common rules](immutable-rules.en-US.md) are still proposals: their mandatory force will depend on approval and adoption in a future stable release.

Partial documentary support and pending items are identified in [traceability](traceability.en-US.md); review and approval are governed by [foundation governance](foundation-governance.en-US.md). The following instructions guide evaluation and do not establish compliance with any platform's current requirements.

## PLAT-001 — Web

- Define whether the product includes an interface, services, or both, and where each trust boundary is located.
- Declare supported browsers, screen sizes, and connectivity conditions when an interface exists.
- Define controls for sessions, permissions, and external inputs when protected features or services exist.
- Evaluate accessibility, navigation, deep links, loading, errors, and recovery for relevant flows.
- Define configuration by environment, deployment, error monitoring, and recovery of the deployed version.
- Evaluate risks specific to the features used, such as untrusted content, cross-site requests, or file uploads, before selecting specific controls.

## PLAT-002 — Desktop: Windows, macOS, and Linux

- Select operating systems, versions, and processor architectures; do not assume compatibility simply because a tool is cross-platform.
- Separate operating system adapters from rules that can be shared.
- Evaluate paths, permissions, storage, installation, updates, and uninstallation while protecting user data.
- Keep the interface responsive during long-running operations and define cancellation, shutdown, and recovery.
- Verify integration with keyboards, windows, display scaling, and relevant assistive technologies.
- Define distribution and package trust according to the chosen channel, and verify its current requirements during implementation.

### macOS Considerations

macOS is a specific desktop target. Evaluate system permissions, distribution, signing, isolation, supported architectures, and integration with menus and windows according to the type of application. Specific requirements are consulted in current official documentation when creating the consuming project; this document does not prescribe procedures or tool versions.

## PLAT-003 — Mobile: Android and iOS

- Declare the systems, versions, and device classes within scope.
- Design for interruptions, application state changes, and variable connectivity.
- Define permissions, secure storage, and local data handling according to sensitivity.
- Evaluate navigation, touch interaction, text scaling, screen readers, and other accessibility requirements.
- Control battery, memory, and network use, and background work according to the actual features.
- Test synchronization and repeated operations when offline data or deferred tasks exist.
- Define distribution and updates; consult the selected channel's current official requirements during implementation.

## PLAT-004 — Cross-Platform Shared Code

- Share stable rules and contracts when there is a real benefit; do not force the same interface or integration across all systems.
- Encapsulate platform-specific capabilities through explicit, verifiable boundaries.
- Test both the shared logic and each relevant adapter.
- Maintain a matrix distinguishing planned, verified, and unsupported platforms, together with the corresponding evidence.
- Do not turn platform differences into conditions scattered throughout the core logic.

## Cross-Cutting Requirements Each Project Must Define

Security and privacy, accessibility when an interface exists, performance targets, supported versions, distribution and recovery strategies, and product languages. Targets must be verifiable and suited to the project's audience and risk; this foundation does not impose universal metrics or arbitrary percentages.
