# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Task:
    id: str
    owner: str
    title: str
    completed: bool
    version: int


@dataclass(frozen=True, slots=True)
class Principal:
    token_id: str
    subject: str
    permissions: tuple[str, ...]
