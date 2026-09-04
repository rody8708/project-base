# Python/FastAPI backend

[Español (Latinoamérica)](README.es-419.md)

This template creates an executable Python API with FastAPI, SQLAlchemy Core, and explicit `domain/application/infrastructure/presentation` architecture. Use it when you want the productivity of a proven framework without making the domain depend on that framework or database.

## What it provides

- JSON API compatible with the shared task contract;
- opaque-token authentication, permissions, and owner isolation;
- repositories and unit of work as ports, with SQLAlchemy confined to infrastructure;
- SQLite by default and configurable PostgreSQL or MySQL URLs;
- HTTP-free unit tests and temporary-SQLite integration tests;
- exact versions and a reproducible environment managed by `uv`.

It is a technical foundation. It does not generate your particular business rules, password login, recovery, MFA, or automatic production approval.

## Quick start

Install Python 3.13 and [uv](https://docs.astral.sh/uv/), then:

```powershell
uv sync --locked --all-extras
uv run python -m project_base_api.migrate_cli up
uv run python -m project_base_api.token_cli local-user
uv run uvicorn project_base_api.main:app --host 127.0.0.1 --port 8080
```

Keep the displayed token only in your local environment. Check `http://127.0.0.1:8080/api/health`; routes under `/api/v1` require `Authorization: Bearer <token>`.

## Verification

```powershell
uv run ruff check .
uv run mypy
uv run pytest
```

### SQL Matrix and Real HTTP

From this directory, with Docker available, run:

```powershell
uv run pytest -W error --tb=short --live-http
uv run pytest -W error --tb=short --database-engine=postgresql --live-http
uv run pytest -W error --tb=short --database-engine=mysql --live-http
```

If Docker runs in WSL, append `--docker-wsl=Ubuntu-24.04` to the PostgreSQL/MySQL commands (use your distribution name). Tests create owned PostgreSQL `18.6` or MySQL `8.4.11` containers, in-memory data, synthetic credentials, and ephemeral loopback-only ports. They do not accept existing database URLs or load `.env`. Containers and data are removed afterward; downloaded images are retained. Do not run this suite with parallel workers sharing one database.

`--live-http` repeats API flows through Uvicorn and real HTTP connections. Coverage includes CRUD, version conflicts, reader permissions, expiry/revocation, and owner isolation, including identifiers differing only in case. MySQL's binary owner comparison stays inside the adapter; domain and application remain unchanged. The `pymysql[rsa]` extra enables authentication with MySQL 8.4's default mechanism.

This matrix does not certify TLS, concurrent load, backup/restore, or a production deployment. Those validations remain pending for this starter and must be repeated for each product.

## Changing the SQL engine

Copy `.env.example` to `.env` without adding it to Git and configure `DATABASE_URL`:

- SQLite: `sqlite:///./database.sqlite`
- PostgreSQL: `postgresql+psycopg://user:password@localhost/database`
- MySQL: `mysql+pymysql://user:password@localhost/database?charset=utf8mb4`

The repository interface does not change. Changing the URL does not prove compatibility for your schema: before release, run integration and backup/restore tests against the selected engine and version.

Versioned migrations change the schema. `migrate_cli up` applies pending versions and `migrate_cli down` rolls back one version; do not alter a deployed database with ad-hoc SQL.

## Where to add a feature

1. Pure entity or contract in `domain/`.
2. Orchestration and rules in `application/`.
3. SQL or an external service in `infrastructure/` behind a port.
4. HTTP translation in `presentation/`.
5. Unit and integration tests before connecting a client.

Also see the [OpenAPI contract](contracts/task-api-v1.openapi.json) and exported documents under `foundation/`.
