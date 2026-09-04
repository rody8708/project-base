# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
from typing import Literal, Protocol

from project_base_api.domain.models import Principal, Task


class TaskRepository(Protocol):
    def list(self, owner: str, limit: int, after: str | None) -> tuple[list[Task], str | None]: ...
    def find(self, owner: str, task_id: str) -> Task | None: ...
    def create(self, owner: str, title: str) -> Task: ...
    def replace(
        self, owner: str, task_id: str, title: str, completed: bool, version: int
    ) -> tuple[Literal["updated", "missing", "conflict"], Task | None]: ...
    def delete(
        self, owner: str, task_id: str, version: int
    ) -> Literal["deleted", "missing", "conflict"]: ...


class TokenRepository(Protocol):
    def find_principal(self, token_digest: str) -> Principal | None: ...
    def provision(
        self, subject: str, permissions: tuple[str, ...], token_digest: str, expires_at: int
    ) -> None: ...
    def revoke(self, token_id: str) -> None: ...


class RateLimitRepository(Protocol):
    def consume(self, key: str, window: int, maximum: int) -> bool: ...


class UnitOfWork(Protocol):
    tasks: TaskRepository
    tokens: TokenRepository
    rates: RateLimitRepository

    def __enter__(self) -> "UnitOfWork": ...
    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None: ...
