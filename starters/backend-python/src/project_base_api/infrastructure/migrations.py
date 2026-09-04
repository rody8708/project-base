# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
from collections.abc import Callable

from sqlalchemy import Column, MetaData, String, Table, delete, insert, select
from sqlalchemy.engine import Connection, Engine

from project_base_api.infrastructure.database import metadata

migration_metadata = MetaData()
schema_migrations = Table(
    "schema_migrations",
    migration_metadata,
    Column("version", String(64), primary_key=True),
)


def initial_up(connection: Connection) -> None:
    metadata.create_all(connection)


def initial_down(connection: Connection) -> None:
    metadata.drop_all(connection)


MIGRATIONS: tuple[tuple[str, Callable[[Connection], None], Callable[[Connection], None]], ...] = (
    ("0001_initial", initial_up, initial_down),
)


def migrate_up(engine: Engine) -> None:
    with engine.begin() as connection:
        migration_metadata.create_all(connection)
        applied = set(connection.execute(select(schema_migrations.c.version)).scalars())
        for version, up, _down in MIGRATIONS:
            if version not in applied:
                up(connection)
                connection.execute(insert(schema_migrations).values(version=version))


def migrate_down(engine: Engine) -> None:
    with engine.begin() as connection:
        migration_metadata.create_all(connection)
        applied = set(connection.execute(select(schema_migrations.c.version)).scalars())
        for version, _up, down in reversed(MIGRATIONS):
            if version in applied:
                down(connection)
                connection.execute(
                    delete(schema_migrations).where(schema_migrations.c.version == version)
                )
                return
