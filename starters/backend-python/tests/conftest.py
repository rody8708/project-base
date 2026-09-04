# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import time
from collections.abc import AsyncIterator, Iterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.infrastructure.migrations import migrate_up
from project_base_api.presentation.http import create_app

TOKEN = "a" * 64


@pytest.fixture
def engine(tmp_path: object) -> Iterator[Engine]:
    path = tmp_path / "test.sqlite"  # type: ignore[operator]
    value = make_engine(f"sqlite:///{path}")
    migrate_up(value)
    yield value
    value.dispose()


@pytest.fixture
async def client(engine: Engine) -> AsyncIterator[AsyncClient]:
    factory = uow_factory(engine)
    with factory() as uow:
        uow.tokens.provision(
            "user-1",
            ("tasks:read", "tasks:write"),
            hashlib.sha256(TOKEN.encode()).hexdigest(),
            int(time.time()) + 3600,
        )
    async with AsyncClient(
        transport=ASGITransport(app=create_app(factory), raise_app_exceptions=False),
        base_url="http://test",
    ) as value:
        yield value


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def authorization() -> dict[str, str]:
    return {"Authorization": f"Bearer {TOKEN}"}
