# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor
from threading import Event

import httpx
import pytest
from sqlalchemy import Engine

from project_base_api.application.tasks import TaskService
from project_base_api.domain.models import Principal, Task
from project_base_api.infrastructure.database import uow_factory
from project_base_api.presentation.http import create_app
from tests.http_lab import live_server


def test_slow_persistence_does_not_freeze_other_http_requests(
    engine: Engine, monkeypatch: pytest.MonkeyPatch
) -> None:
    token = "f" * 64
    with uow_factory(engine)() as uow:
        uow.tokens.provision(
            "slow-user",
            ("tasks:write",),
            hashlib.sha256(token.encode()).hexdigest(),
            int(time.time()) + 60,
        )
    entered, release = Event(), Event()
    original = TaskService.create

    def slow_create(self: TaskService, principal: Principal, payload: dict[str, object]) -> Task:
        entered.set()
        if not release.wait(timeout=5):
            raise RuntimeError("Controlled test delay was not released")
        return original(self, principal, payload)

    monkeypatch.setattr(TaskService, "create", slow_create)
    with live_server(create_app(uow_factory(engine)), tls=True) as (url, context):

        def write() -> httpx.Response:
            with httpx.Client(base_url=url, verify=context, trust_env=False) as client:
                return client.post(
                    "/api/v1/tasks",
                    headers={"Authorization": f"Bearer {token}"},
                    json={"title": "Slow synthetic write"},
                )

        with ThreadPoolExecutor(max_workers=1) as pool:
            pending = pool.submit(write)
            try:
                assert entered.wait(timeout=3)
                with httpx.Client(
                    base_url=url, verify=context, trust_env=False, timeout=1
                ) as client:
                    assert client.get("/api/health").status_code == 200
            finally:
                release.set()
            assert pending.result(timeout=5).status_code == 201
