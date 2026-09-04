# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import sqlite3
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from pathlib import Path

import httpx
import pytest
from sqlalchemy import Engine, select, update

from project_base_api.infrastructure.database import make_engine, tokens, uow_factory
from project_base_api.infrastructure.migrations import migrate_up, schema_migrations
from project_base_api.presentation.http import create_app
from tests.database_lab import native_database
from tests.http_lab import live_server


@contextmanager
def recovery_pair(
    kind: str, distribution: str | None, path: Path
) -> Iterator[tuple[Engine, Engine, Callable[[], None], Callable[[], None]]]:
    if kind == "sqlite":
        source_path, backup_path, target_path = [
            path / f"{name}.sqlite" for name in ("source", "backup", "target")
        ]
        source, target = (
            make_engine(f"sqlite:///{source_path}"),
            make_engine(f"sqlite:///{target_path}"),
        )

        def copy_database(origin: Path, destination: Path) -> None:
            first, second = sqlite3.connect(origin), sqlite3.connect(destination)
            try:
                first.backup(second)
            finally:
                first.close()
                second.close()

        try:
            yield (
                source,
                target,
                lambda: copy_database(source_path, backup_path),
                lambda: copy_database(backup_path, target_path),
            )
        finally:
            source.dispose()
            target.dispose()
            for file in (source_path, backup_path, target_path):
                for suffix in ("", "-wal", "-shm", "-journal"):
                    Path(f"{file}{suffix}").unlink(missing_ok=True)
        return
    with (
        native_database(kind, distribution) as source_lab,
        native_database(kind, distribution) as target_lab,
    ):
        source, target = make_engine(source_lab.url), make_engine(target_lab.url)
        snapshot: list[bytes] = []

        def backup() -> None:
            snapshot.append(source_lab.backup())

        try:
            yield source, target, backup, lambda: target_lab.restore(snapshot[0])
        finally:
            source.dispose()
            target.dispose()
            snapshot.clear()


def test_native_backup_restores_api_and_revokes_recovered_tokens(
    request: pytest.FixtureRequest, tmp_path: Path
) -> None:
    kind = request.config.getoption("--database-engine")
    distribution = request.config.getoption("--docker-wsl")
    with recovery_pair(kind, distribution, tmp_path) as (source, target, backup, restore):
        migrate_up(source)
        token = "d" * 64
        with uow_factory(source)() as uow:
            uow.tokens.provision(
                "recovery-user",
                ("tasks:read", "tasks:write"),
                hashlib.sha256(token.encode()).hexdigest(),
                int(time.time()) + 3600,
            )
        headers = {"Authorization": f"Bearer {token}"}
        with live_server(create_app(uow_factory(source)), tls=True) as (url, context):
            with httpx.Client(base_url=url, verify=context, trust_env=False) as client:
                response = client.post(
                    "/api/v1/tasks", headers=headers, json={"title": "Respaldo ñ 🚀"}
                )
                assert response.status_code == 201
                saved = response.json()["data"]
                location = response.headers["location"]
                backup()
                assert (
                    client.post(
                        "/api/v1/tasks", headers=headers, json={"title": "After snapshot"}
                    ).status_code
                    == 201
                )
        restore()
        with source.connect() as connection, target.connect() as restored:
            assert (
                connection.execute(select(schema_migrations)).all()
                == restored.execute(select(schema_migrations)).all()
            )
            assert (
                connection.execute(select(tokens)).all() == restored.execute(select(tokens)).all()
            )
        # Recovery procedure: invalidate recovered sessions before serving traffic.
        with target.begin() as connection:
            connection.execute(update(tokens).values(revoked=True))
        fresh = "e" * 64
        with uow_factory(target)() as uow:
            uow.tokens.provision(
                "recovery-user",
                ("tasks:read", "tasks:write"),
                hashlib.sha256(fresh.encode()).hexdigest(),
                int(time.time()) + 3600,
            )
        with live_server(create_app(uow_factory(target)), tls=True) as (url, context):
            with httpx.Client(base_url=url, verify=context, trust_env=False) as client:
                assert client.get(location, headers=headers).status_code == 401
                fresh_headers = {"Authorization": f"Bearer {fresh}"}
                assert client.get(location, headers=fresh_headers).json()["data"] == saved
                assert client.get("/api/v1/tasks", headers=fresh_headers).json()["data"] == [saved]
                changed = client.put(
                    location,
                    headers=fresh_headers,
                    json={"title": "Recovered", "completed": True, "version": 1},
                )
                assert changed.status_code == 200
                assert changed.json()["data"]["version"] == 2
        with uow_factory(source)() as uow:
            assert len(uow.tasks.list("recovery-user", 20, None)[0]) == 2
