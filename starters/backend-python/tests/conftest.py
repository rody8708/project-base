# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import time
from collections.abc import AsyncIterator, Iterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.infrastructure.migrations import migrate_up
from project_base_api.presentation.http import create_app
from tests.database_lab import database_url
from tests.http_lab import live_server

TOKEN = "a" * 64


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--recovery-repeat", type=int, default=1)
    parser.addoption("--recovery-diagnostics", action="store_true")
    parser.addoption(
        "--database-engine", choices=("sqlite", "postgresql", "mysql"), default="sqlite"
    )
    parser.addoption("--docker-wsl", default=None, help="WSL distribution running Docker")
    parser.addoption("--live-http", action="store_true", help="Test through a real loopback server")
    parser.addoption("--live-https", action="store_true", help="Use disposable verified TLS")


def pytest_generate_tests(metafunc: pytest.Metafunc) -> None:
    if "recovery_iteration" in metafunc.fixturenames:
        count = metafunc.config.getoption("--recovery-repeat")
        if not 1 <= count <= 100:
            raise pytest.UsageError("--recovery-repeat must be between 1 and 100")
        metafunc.parametrize("recovery_iteration", range(count))


@pytest.fixture(scope="session")
def lab_url(request: pytest.FixtureRequest) -> Iterator[str | None]:
    with database_url(
        request.config.getoption("--database-engine"), request.config.getoption("--docker-wsl")
    ) as url:
        yield url


@pytest.fixture
def engine(tmp_path: Path, lab_url: str | None) -> Iterator[Engine]:
    from project_base_api.infrastructure.database import metadata
    from project_base_api.infrastructure.migrations import migration_metadata

    value = make_engine(lab_url or f"sqlite:///{tmp_path / 'test.sqlite'}")
    try:
        migrate_up(value)
        yield value
    finally:
        try:
            with value.begin() as connection:
                metadata.drop_all(connection)
                migration_metadata.drop_all(connection)
        finally:
            value.dispose()
            if lab_url is None:
                for suffix in ("", "-wal", "-shm", "-journal"):
                    (tmp_path / f"test.sqlite{suffix}").unlink(missing_ok=True)


@pytest.fixture
async def client(engine: Engine, request: pytest.FixtureRequest) -> AsyncIterator[AsyncClient]:
    factory = uow_factory(engine)
    with factory() as uow:
        uow.tokens.provision(
            "user-1",
            ("tasks:read", "tasks:write"),
            hashlib.sha256(TOKEN.encode()).hexdigest(),
            int(time.time()) + 3600,
        )
    app = create_app(factory)
    tls = request.config.getoption("--live-https")
    if not request.config.getoption("--live-http") and not tls:
        async with AsyncClient(
            transport=ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test"
        ) as value:
            yield value
        return
    with live_server(app, tls=tls) as (url, context):
        async with AsyncClient(base_url=url, verify=context, trust_env=False, timeout=30) as value:
            yield value


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def authorization() -> dict[str, str]:
    return {"Authorization": f"Bearer {TOKEN}"}
