# Backend Python/FastAPI

[English (United States)](README.en-US.md)

Esta plantilla crea una API ejecutable en Python con FastAPI, SQLAlchemy Core y una arquitectura explícita `domain/application/infrastructure/presentation`. Sirve cuando quieres la productividad de un framework probado sin permitir que el dominio dependa del framework o de la base de datos.

## Qué aporta

- API JSON compatible con el contrato compartido de tareas.
- autenticación mediante tokens opacos, permisos y aislamiento por propietario;
- repositorios y unidad de trabajo como puertos, con SQLAlchemy únicamente en infraestructura;
- SQLite predeterminado y URLs configurables para PostgreSQL o MySQL;
- pruebas unitarias sin HTTP y pruebas de integración con SQLite temporal;
- versiones exactas y entorno reproducible administrado por `uv`.

Es una base técnica, no genera las reglas particulares de tu negocio, login con contraseña, recuperación, MFA ni una aprobación automática de producción.

## Inicio rápido

Instala Python 3.13 y [uv](https://docs.astral.sh/uv/), luego:

```powershell
uv sync --locked --all-extras
uv run python -m project_base_api.migrate_cli up
uv run python -m project_base_api.token_cli local-user
uv run uvicorn project_base_api.main:app --host 127.0.0.1 --port 8080
```

Guarda el token mostrado solo en tu entorno local. Comprueba `http://127.0.0.1:8080/api/health`; las rutas bajo `/api/v1` requieren `Authorization: Bearer <token>`.

## Comprobación

```powershell
uv run ruff check .
uv run mypy
uv run pytest
```

## Cambiar el motor SQL

Copia `.env.example` como `.env` sin agregarlo a Git y configura `DATABASE_URL`:

- SQLite: `sqlite:///./database.sqlite`
- PostgreSQL: `postgresql+psycopg://user:password@localhost/database`
- MySQL: `mysql+pymysql://user:password@localhost/database?charset=utf8mb4`

La interfaz del repositorio no cambia. Cambiar la URL no demuestra compatibilidad de tu esquema: antes de publicar, ejecuta las pruebas de integración y respaldo/restauración contra la versión real del motor elegida.

El esquema se modifica mediante migraciones versionadas. `migrate_cli up` aplica pendientes y `migrate_cli down` revierte una versión; no edites una base desplegada con SQL manual.

## Dónde agregar una función

1. Entidad o contrato puro en `domain/`.
2. Orquestación y reglas en `application/`.
3. SQL o servicio externo en `infrastructure/` detrás de un puerto.
4. Traducción HTTP en `presentation/`.
5. Pruebas unitarias e integración antes de conectar un cliente.

Consulta también el [contrato OpenAPI](contracts/task-api-v1.openapi.json) y los documentos exportados en `foundation/`.
