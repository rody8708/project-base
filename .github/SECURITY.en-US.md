# Security Policy

[Español (Latinoamérica)](SECURITY.es-419.md) · [Home](../README.en-US.md) · [Contribution guide](CONTRIBUTING.en-US.md)

## Supported Versions

Zendrhax LLC evaluates reports against the latest stable release. It is currently `1.1.0`. Earlier revisions and drafts do not receive independent security fixes. Each project created from this foundation is responsible for its own dependencies, configuration, deployment, and incident response.

## Reporting a Vulnerability

Do not open a public Issue, discussion, or pull request for a suspected vulnerability. Prefer GitHub private vulnerability reporting in this repository. If that channel is unavailable, email [contact@zendrhax.com](mailto:contact@zendrhax.com) with the subject `project-base security report`.

Include, when possible:

- affected version, commit, component, and configuration;
- minimal reproduction steps or a harmless proof of concept;
- observed or probable impact and conditions required for exploitation;
- known mitigations and a safe way to contact you.

Do not include real secrets, active credentials, personal data, or third-party information. Allow reasonable time to investigate and coordinate a fix before public disclosure. Zendrhax LLC will attempt to acknowledge receipt and communicate the next step, but this policy does not promise a contractual response or remediation deadline.

## Scope

Reports about code, automation, executable documentation, and official artifacts in this repository are accepted. Vulnerabilities in a product built from the foundation must be reported to that product's operator. Local or CI evidence does not replace validation of the real deployment, its secrets, TLS, backups, monitoring, or operational controls.
