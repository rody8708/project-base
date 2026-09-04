# Technical Candidate 1.2.0

[Español latinoamericano](candidate-1.2.0.es-419.md) · [Package](project-foundation-1.2.0-candidate.zip) · [Verification and inventory](project-foundation-1.2.0-candidate.verification.json)

Status: verified, awaiting explicit owner approval. This is not yet an approved stable release.

## Exact Identity

- Proposed version: `1.2.0`; maintenance and Node revision: `1.2.0-rc.1`.
- Source: commit `9007083275cb083bc39479288d5adbc60496cc1a`, integrated through [PR #30](https://github.com/rody8708/project-base/pull/30).
- File: `project-foundation-1.2.0-candidate.zip`; 2,844,053 bytes and 573 files.
- SHA-256: `fa353b14d2c7101d21074778513c7a15fbb13e0c81dbab29d582cd9c6c8fb5a6`.
- Original license: MPL-2.0; dependencies retain their own licenses.

## Scope and Verification

Includes seven templates, bilingual fundamentals, guided assistant, local MCP, export, API contract, and Node/Python operations labs. Node adds PostgreSQL/MySQL, asynchronous repositories, and shared limiting; Python retains its reproduced blocking fixes. Node helpers require await; the HTTP contract remains compatible. No password-based human accounts, recovery, or MFA.

Only Git-controlled files from a clean revision were captured; each content was compared with its blob using declared filters. The ZIP preserves checkout bytes, including the historical CRLF receipt, and every recovered file was compared by SHA-256 with the captured bytes. The external inventory identifies every entry. It contains no installed dependencies, runtime databases, real configuration, or private keys; credentials written in tests are synthetic.

From a new recovery without dependencies preinstalled in it, the following passed: 73 maintenance tests; documentation/architecture; nine fast Node tests; Node SQLite/PostgreSQL/MySQL labs; Node integration with React/native web; Ruff, mypy, and 31 Python HTTPS/SQLite tests. [Source CI](https://github.com/rody8708/project-base/actions/runs/33927228907) additionally passed the Python matrices, PHP, web, portable Flutter, and Kotlin Android. Native Apple execution is not inferred from those results.

The local recovery and its dependencies were retained as evidence. An earlier synthetic adoption copy in the Windows temporary directory was retained because host policy blocked its manual removal; its processes were stopped. Labs removed their own containers, databases, and TLS material. User data was not changed.

## Limits and Decision

macOS/iOS remain deferred without a Mac; desktop Linux and physical devices lack complete acceptance. Sustained capacity, RPO/RTO, public deployment, and production are not certified. Those checks belong to each application and its infrastructure.

Releases 1.0.0 and 1.1.0 remain intact. Approval requires explicitly accepting this SHA-256 identity, scope, license, and exceptions. Approval will be preserved in an external receipt; the ZIP will not be modified to change its headers. Requested changes produce another candidate, never an overwrite of this package.
