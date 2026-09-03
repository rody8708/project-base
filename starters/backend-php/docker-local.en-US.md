# PHP 8.5 Docker Lab

[Verified SQLite backup and restore](recovery.en-US.md).

[Español (Latinoamérica)](docker-local.es-419.md) · [Home](README.en-US.md) · [Security](security-production.en-US.md)

## Purpose

Run this foundation on Linux with PHP 8.5 and Apache/HTTPS without replacing WSL PHP 8.2 or Windows PHP. Isolated local profile, not an approved production deployment. TLS terminates in Apache inside the container (mod_php), without an external proxy or PHP-FPM in this profile.

Requires Node 24, tar, and local Linux/amd64 Docker. Windows uses the existing Ubuntu-24.04 WSL distribution; neither Compose nor Buildx is required. An explicit file list streams the code, so the D drive need not be mounted in WSL. No host packages or certificates are installed. The first build downloads official images, Debian packages, and Composer dependencies.

## Commands

From this starter directory:

```text
node scripts/docker-local.mjs verify
node scripts/docker-local.mjs up
node scripts/docker-local.mjs down CONTAINER_NAME
```

verify builds, starts, tests, and removes its container, including disposable data and secrets. up runs the same tests and retains a healthy lab, printing its exact URL and name. down checks the name and ownership label before removing that container. It never uses global deletion or touches other projects. Images and build cache are retained to speed subsequent runs.

Each run creates a unique name. Docker assigns an automatic port on 127.0.0.1, never all interfaces; it does not occupy ports 80/443 or existing database ports. Docker may reassign the port on restart; verification queries it again. Hosts and DNS are unchanged. The configured application URL is an internal lab reference, not a public domain.

## Isolation and Secrets

Code resides in the image; no user directories, Docker socket, or existing databases are mounted. SQLite, the application key, and the certificate live in /state inside the container. They survive docker restart but are lost when removing or recreating the container. This is NOT production persistence or backup.

The process uses www-data, no Linux capabilities, no-new-privileges, and memory, CPU, and process limits. The image contains neither PHPUnit nor host credentials. Automatic startup migrations apply only to this disposable SQLite: do not copy that policy to production data. Composer and build tools remain in the image; surface reduction and OS package auditing are pending.

The self-signed certificate lasts seven days and includes local names and 127.0.0.1. Tests explicitly trust that certificate and require TLS validation; they also verify rejection without that trust. Neither curl -k nor disabled rejectUnauthorized is used. Browsers will warn because no global CA was installed. Renew by deleting and recreating only the disposable lab.

Test tokens are never printed, and the verification token is revoked. A retained lab needs a newly issued credential through the security guide's CLI inside that container. Never copy real-project credentials. Apache logs omit URLs/queries, bodies, and Authorization.

## Optional Windows Trust

Only with user authorization, run from PowerShell 7:

```powershell
./scripts/trust-local-windows.ps1 -Container CONTAINER_NAME
```

The command identifies the lab by name and ownership label. It creates or reuses a local authority in Cert:\CurrentUser\My with a nonexportable private key and 30-day validity. It issues a non-CA server certificate valid for seven days for foundation.localhost, localhost, and 127.0.0.1. Only the server key and public certificates reach the container; no PFX is saved to disk.

Only the public authority is installed in Cert:\CurrentUser\Root. Windows may show a confirmation that the user must review. Neither LocalMachine nor WSL trust is modified. The authority grants this user TLS trust: keep its key protected and remove trust when no longer needed. Never directly trust the original self-signed CA certificate whose private key lives in the server.

Apache reloads without restarting the container, and Invoke-RestMethod verifies HTTPS without validation exceptions. PASS output and thumbprints confirm installation; a pending prompt does not mean completion. Recreating the container requires issuing another certificate with this command. WSL, containers, and tools with separate trust stores need explicit public-CA configuration; they do not automatically inherit Windows trust.

To remove trust, locate the exact thumbprint printed by the command in the user store and remove only that Root entry. The authority key and server certificate remain in My until explicitly removed. Never delete other authorities. Restart tabs or the browser if an earlier TLS error is cached.

## Verification Scope

Healthy startup; real HTTPS from the host; untrusted certificate rejection; anonymous access returning 401; authenticated create/read/update/delete; restart persistence; revocation; and check-production returning LOCAL_CHECKS_PASS with productionApproved=false. A SQLite backup/restore rehearsal now uses a separate destination, invalidates tokens, and reads through the HTTP kernel. Email, human login, MFA, load, and alerting are not simulated yet.

Evaluation on 2026-09-03: image ran PHP 8.5.10. WSL retained PHP 8.2.33 and Windows retained PHP 8.5.1. PHP/JavaScript syntax, 46 maintenance tests, and 102 documents in 51 language pairs (812 local links) were also checked. Testing corrected Apache-to-PHP Authorization forwarding, port discovery after restart, and Content-Length for DELETE bodies.

PHP/Composer base images are digest-pinned for amd64, and composer.lock pins PHP dependencies. Apt packages do not use a historical snapshot: rebuilding is not bit-for-bit reproducible. Review vulnerabilities and update references deliberately.

Sources: [official PHP image](https://hub.docker.com/_/php) and [Docker port publishing](https://docs.docker.com/engine/network/port-publishing/).
