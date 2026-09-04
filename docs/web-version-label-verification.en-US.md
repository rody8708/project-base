# Web version label verification

[Español (Latinoamérica)](web-version-label-verification.es-419.md)

- Date: 2026-09-04. Tested maintenance branch: `codex/remove-template-version-badge`, web starter revisions `1.1.0-draft.3`, based on `e8983fc`.
- Environment: Windows, Node 24.16.0, npm 11.17.0; isolated development servers on loopback ports 5181 (native web) and 5174 (React). No backend, credentials, or real data were used.
- Reproduction: the new native source regression and React rendered-UI regression both failed on the original candidate/version copy before the correction.
- Automated result: repository documentation and architecture checks passed; 74 maintenance tests, 87 native-web tests, and 46 React tests passed. React type checking and production build passed.
- Browser acceptance: both pages showed no template version in Spanish or English. Added and completed a synthetic task, switched language, and observed one completed task in both applications. Reloading each page reset the memory-only list to zero as expected. The native header was also visually inspected.
- Browser harness limitation: native checkbox `check()` reported a selector timeout because completion changes the accessible name; a fresh DOM inspection confirmed the checked state and completed count. This was not recorded as a successful tool action.
- Cleanup: reloading discarded synthetic tasks; temporary verification tabs and servers were closed. The user's existing port 5180 server and generated application were not changed.
- Scope: this verifies the maintained starter UI, not a new production approval, published archive, or an update to an existing consumer copy.
