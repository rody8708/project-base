# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import asyncio
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from types import SimpleNamespace

import pytest
from httpx import AsyncClient
from sqlalchemy import Engine, insert, select

from project_base_api.infrastructure.database import rate_limits, uow_factory


@pytest.mark.parametrize("existing_window", [False, True])
def test_rate_limit_is_atomic_across_connections(engine: Engine, existing_window: bool) -> None:
    if existing_window:
        with engine.begin() as connection:
            connection.execute(insert(rate_limits).values(key="burst", window=1, count=0))
    gate = Barrier(12)

    def consume(_: int) -> bool:
        gate.wait(timeout=15)
        with uow_factory(engine)() as uow:
            return uow.rates.consume("burst", 1, 5)

    with ThreadPoolExecutor(max_workers=12) as pool:
        assert sum(pool.map(consume, range(12))) == 5
    with engine.connect() as connection:
        assert connection.execute(select(rate_limits.c.count)).scalar_one() == 5


@pytest.mark.anyio
async def test_concurrent_http_writes_preserve_versions(
    client: AsyncClient, authorization: dict[str, str]
) -> None:
    responses = await asyncio.gather(
        *[
            client.post("/api/v1/tasks", headers=authorization, json={"title": f"Task {i}"})
            for i in range(24)
        ]
    )
    assert all(response.status_code == 201 for response in responses)
    assert len({response.json()["data"]["id"] for response in responses}) == 24
    location = responses[0].headers["location"]
    updates = await asyncio.gather(
        *[
            client.put(
                location,
                headers=authorization,
                json={"title": f"Winner {i}", "completed": True, "version": 1},
            )
            for i in range(12)
        ]
    )
    assert sorted(response.status_code for response in updates) == [200] + [409] * 11
    winner = next(response.json()["data"] for response in updates if response.status_code == 200)
    assert (await client.get(location, headers=authorization)).json()["data"] == winner
    assert winner["version"] == 2


@pytest.mark.anyio
async def test_http_rate_limit_under_burst(
    client: AsyncClient, authorization: dict[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "project_base_api.presentation.http.time", SimpleNamespace(time=lambda: 6000)
    )
    responses = await asyncio.gather(
        *[client.get("/api/v1/tasks", headers=authorization) for _ in range(144)]
    )
    assert sorted(response.status_code for response in responses) == [200] * 120 + [429] * 24
    assert all(
        response.headers["retry-after"] == "60"
        for response in responses
        if response.status_code == 429
    )
