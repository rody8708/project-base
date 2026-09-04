# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import re
import unicodedata
from collections.abc import Callable

from project_base_api.application.errors import ApiError
from project_base_api.domain.models import Principal, Task
from project_base_api.domain.repositories import UnitOfWork

ID_PATTERN = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def require_permission(principal: Principal, permission: str) -> None:
    if permission not in principal.permissions:
        raise ApiError(403, "FORBIDDEN", "The operation is not permitted.")


def validate_id(value: str) -> str:
    if not ID_PATTERN.fullmatch(value):
        raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
    return value


def validate_title(value: object) -> str:
    clean = value.strip() if isinstance(value, str) else ""
    forbidden = {"Cc", "Cs", "Zl", "Zp"}
    if (
        not clean
        or len(clean) > 80
        or any(unicodedata.category(char) in forbidden for char in clean)
    ):
        raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
    return clean


def task_dict(task: Task) -> dict[str, object]:
    return {
        "id": task.id,
        "title": task.title,
        "completed": task.completed,
        "version": task.version,
    }


class TaskService:
    def __init__(self, uow_factory: Callable[[], UnitOfWork]) -> None:
        self._uow_factory = uow_factory

    def list(self, principal: Principal, limit: int, after: str | None) -> dict[str, object]:
        require_permission(principal, "tasks:read")
        if limit < 1 or limit > 100:
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        if after is not None:
            validate_id(after)
        with self._uow_factory() as uow:
            tasks, next_cursor = uow.tasks.list(principal.subject, limit, after)
        return {"data": [task_dict(task) for task in tasks], "next_after": next_cursor}

    def get(self, principal: Principal, task_id: str) -> Task:
        require_permission(principal, "tasks:read")
        with self._uow_factory() as uow:
            task = uow.tasks.find(principal.subject, validate_id(task_id))
        if task is None:
            raise ApiError(404, "NOT_FOUND", "The resource was not found.")
        return task

    def create(self, principal: Principal, payload: dict[str, object]) -> Task:
        require_permission(principal, "tasks:write")
        if set(payload) != {"title"}:
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        with self._uow_factory() as uow:
            return uow.tasks.create(principal.subject, validate_title(payload["title"]))

    def replace(self, principal: Principal, task_id: str, payload: dict[str, object]) -> Task:
        require_permission(principal, "tasks:read")
        require_permission(principal, "tasks:write")
        if set(payload) != {"title", "completed", "version"}:
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        completed, version = payload["completed"], payload["version"]
        if (
            not isinstance(completed, bool)
            or not isinstance(version, int)
            or isinstance(version, bool)
            or not 1 <= version <= 2147483645
        ):
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        with self._uow_factory() as uow:
            result, task = uow.tasks.replace(
                principal.subject,
                validate_id(task_id),
                validate_title(payload["title"]),
                completed,
                version,
            )
        if result == "missing":
            raise ApiError(404, "NOT_FOUND", "The resource was not found.")
        if result == "conflict":
            raise ApiError(409, "VERSION_CONFLICT", "The resource changed; reload it.")
        if task is None:
            raise RuntimeError("Repository returned an updated result without a task.")
        return task

    def delete(self, principal: Principal, task_id: str, payload: dict[str, object]) -> None:
        require_permission(principal, "tasks:read")
        require_permission(principal, "tasks:write")
        version = payload.get("version")
        if (
            set(payload) != {"version"}
            or not isinstance(version, int)
            or isinstance(version, bool)
            or not 1 <= version <= 2147483646
        ):
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        with self._uow_factory() as uow:
            result = uow.tasks.delete(principal.subject, validate_id(task_id), version)
        if result == "missing":
            raise ApiError(404, "NOT_FOUND", "The resource was not found.")
        if result == "conflict":
            raise ApiError(409, "VERSION_CONFLICT", "The resource changed; reload it.")
