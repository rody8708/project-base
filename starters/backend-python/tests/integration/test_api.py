# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import time

import pytest
from httpx import AsyncClient
from sqlalchemy import Engine

from project_base_api.infrastructure.database import uow_factory

pytestmark = pytest.mark.anyio


async def test_health_is_public(client: AsyncClient) -> None:
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "scope": "liveness"}
    assert response.headers["x-request-id"]


async def test_authentication_is_required(client: AsyncClient) -> None:
    response = await client.get("/api/v1/tasks", headers={"Accept-Language": "es"})
    assert response.status_code == 401
    assert response.json() == {
        "error": {"code": "UNAUTHENTICATED", "message": "Se requiere autenticación."}
    }


async def test_task_lifecycle_and_optimistic_lock(
    client: AsyncClient, authorization: dict[str, str]
) -> None:
    created = await client.post(
        "/api/v1/tasks", headers=authorization, json={"title": "First task"}
    )
    assert created.status_code == 201
    task = created.json()["data"]
    assert task["version"] == 1

    fetched = await client.get(created.headers["location"], headers=authorization)
    assert fetched.json()["data"] == task

    replaced = await client.put(
        created.headers["location"],
        headers=authorization,
        json={"title": "Done", "completed": True, "version": 1},
    )
    assert replaced.status_code == 200
    assert replaced.json()["data"]["version"] == 2

    conflict = await client.put(
        created.headers["location"],
        headers=authorization,
        json={"title": "Stale", "completed": False, "version": 1},
    )
    assert conflict.status_code == 409
    assert conflict.json()["error"]["code"] == "VERSION_CONFLICT"

    deleted = await client.request(
        "DELETE", created.headers["location"], headers=authorization, json={"version": 2}
    )
    assert deleted.status_code == 204


async def test_owner_isolation(
    engine: Engine, client: AsyncClient, authorization: dict[str, str]
) -> None:
    created = await client.post("/api/v1/tasks", headers=authorization, json={"title": "Private"})
    assert created.status_code == 201
    listed = await client.get("/api/v1/tasks", headers=authorization)
    assert len(listed.json()["data"]) == 1
    other_token = "b" * 64
    with uow_factory(engine)() as uow:
        uow.tokens.provision(
            "user-2",
            ("tasks:read", "tasks:write"),
            hashlib.sha256(other_token.encode()).hexdigest(),
            int(time.time()) + 3600,
        )
    other = await client.get("/api/v1/tasks", headers={"Authorization": f"Bearer {other_token}"})
    assert other.status_code == 200
    assert other.json()["data"] == []


async def test_token_can_be_revoked(client: AsyncClient, authorization: dict[str, str]) -> None:
    revoked = await client.delete("/api/v1/auth/token", headers=authorization)
    denied = await client.get("/api/v1/tasks", headers=authorization)
    assert revoked.status_code == 204
    assert denied.status_code == 401


async def test_pagination_uses_last_returned_id(
    client: AsyncClient, authorization: dict[str, str]
) -> None:
    for title in ("One", "Two", "Three"):
        response = await client.post("/api/v1/tasks", headers=authorization, json={"title": title})
        assert response.status_code == 201
    first = (await client.get("/api/v1/tasks?limit=2", headers=authorization)).json()
    second = (
        await client.get(
            f"/api/v1/tasks?limit=2&after={first['next_after']}", headers=authorization
        )
    ).json()
    assert first["next_after"] == first["data"][-1]["id"]
    assert len(second["data"]) == 1
    assert second["next_after"] == second["data"][-1]["id"]


async def test_unknown_query_parameter_is_rejected(
    client: AsyncClient, authorization: dict[str, str]
) -> None:
    response = await client.get("/api/v1/tasks?unexpected=1", headers=authorization)
    assert response.status_code == 422
    duplicate = await client.get("/api/v1/tasks?limit=1&limit=2", headers=authorization)
    assert duplicate.status_code == 422


async def test_errors_keep_the_contract_shape(client: AsyncClient) -> None:
    missing = await client.get("/does-not-exist")
    method = await client.patch("/api/health")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "NOT_FOUND"
    assert method.status_code == 405
    assert method.json()["error"]["code"] == "METHOD_NOT_ALLOWED"
