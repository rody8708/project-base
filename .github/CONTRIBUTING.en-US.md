# Contribution Guide

[Español (Latinoamérica)](CONTRIBUTING.es-419.md) · [Home](../README.en-US.md) · [Security policy](SECURITY.en-US.md)

Thank you for contributing to the foundation maintained by **Zendrhax LLC**. This repository preserves reusable fundamentals and starters; it does not host the final products created from them.

## Before Proposing a Change

- Open an Issue for broad architecture, scope, or compatibility changes. A small, clearly bounded correction may go directly to a pull request.
- Do not use public Issues for vulnerabilities. Follow the [security policy](SECURITY.en-US.md).
- Make sure you have the right to contribute the content. By submitting a contribution, you agree that it may be distributed under [MPL-2.0](../LICENSE).

## Workflow

1. Create a fork or branch and start from the current `main` version.
2. Keep each change focused and explain its purpose, scope, tests, and limitations.
3. Preserve one `.es-419.md` file and one `.en-US.md` file with equivalent meaning for every maintained document. Recognized neutral selectors are the exception.
4. Do not include secrets, personal data, installed dependencies, caches, or build output.
5. Open a pull request. `main` is protected and does not accept direct changes.

## Technical Rules

Respect the API boundary between clients and the backend, the persistence ports and adapters, and the documented immutable rules. A change may replace tools or frameworks, but it must preserve the declared contracts or explicitly document their migration. Do not claim compatibility with a platform, engine, or environment you did not execute.

Run at least the repository controls:

```text
npm ci --ignore-scripts
npm run check
npm test
```

Also run the tests and builds for the modified starter according to its README. The pull request must pass the applicable automated checks before it is merged. Approval of a change does not by itself make a foundation a validated production deployment.

## Contact

General contribution questions: [contact@zendrhax.com](mailto:contact@zendrhax.com). Do not send credentials, personal data, or real secrets.
