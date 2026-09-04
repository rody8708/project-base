# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import socket
import time
from collections.abc import AsyncIterator, Iterator
from pathlib import Path
from threading import Thread

import pytest
import uvicorn
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.infrastructure.migrations import migrate_up
from project_base_api.presentation.http import create_app
from tests.database_lab import database_url

TOKEN = "a" * 64


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--database-engine", choices=("sqlite", "postgresql", "mysql"), default="sqlite"
    )
    parser.addoption("--docker-wsl", default=None, help="WSL distribution running Docker")
    parser.addoption("--live-http", action="store_true", help="Test through a real loopback server")


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
    if not request.config.getoption("--live-http"):
        async with AsyncClient(
            transport=ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test"
        ) as value:
            yield value
        return
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
        server = uvicorn.Server(uvicorn.Config(app, log_level="critical", ws="none"))
        thread = Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
        thread.start()
        try:
            deadline = time.monotonic() + 15
            while not server.started:
                if not thread.is_alive() or time.monotonic() > deadline:
                    raise RuntimeError("Isolated HTTP server did not start")
                time.sleep(0.01)
            async with AsyncClient(base_url=f"http://127.0.0.1:{port}", trust_env=False) as value:
                yield value
        finally:
            server.should_exit = True
            thread.join(timeout=15)
            if thread.is_alive():
                raise RuntimeError("Isolated HTTP server did not stop")


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def authorization() -> dict[str, str]:
    return {"Authorization": f"Bearer {TOKEN}"}
