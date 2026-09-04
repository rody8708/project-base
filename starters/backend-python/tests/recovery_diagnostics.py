# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
"""Opt-in, bounded diagnostics: no SQL text, parameters, headers, or bodies."""

import json
import ssl
import sys
import time
from collections import deque
from pathlib import Path
from threading import Lock
from types import FrameType, TracebackType
from typing import Any

import httpx
from fastapi import FastAPI
from sqlalchemy import Engine, event
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class RecoveryTrace:
    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled
        self.started = time.perf_counter()
        self.events: deque[tuple[float, str]] = deque(maxlen=80)
        self.lock = Lock()
        self.max_sql_ms = 0.0
        self.failure_stacks: list[list[str]] = []

    def mark(self, name: str) -> None:
        if self.enabled:
            with self.lock:
                self.events.append((round(time.perf_counter() - self.started, 6), name))

    def attach(self, engine: Engine) -> None:
        if not self.enabled:
            return

        def before(connection: Any, *_args: Any) -> None:
            connection.info["lab_sql_start"] = time.perf_counter()
            self.mark("sql.begin")

        def after(connection: Any, *_args: Any) -> None:
            elapsed = (time.perf_counter() - connection.info.pop("lab_sql_start")) * 1000
            self.max_sql_ms = max(self.max_sql_ms, elapsed)
            self.mark("sql.end")

        event.listen(engine, "before_cursor_execute", before)
        event.listen(engine, "after_cursor_execute", after)

    def app(self, app: FastAPI) -> FastAPI:
        if self.enabled:
            app.add_middleware(TraceMiddleware, trace=self)
        return app

    def client(self, url: str, context: ssl.SSLContext | bool) -> httpx.Client:
        def network(name: str, _info: dict[str, Any]) -> None:
            self.mark(name)
            if name.endswith(".failed"):
                self.failure_stacks = self.stacks()

        def request_hook(request: httpx.Request) -> None:
            self.mark(f"client.{request.method}")
            request.extensions["trace"] = network

        return httpx.Client(
            base_url=url,
            verify=context,
            trust_env=False,
            event_hooks={"request": [request_hook]} if self.enabled else None,
        )

    def __enter__(self) -> "RecoveryTrace":
        return self

    @staticmethod
    def stacks() -> list[list[str]]:
        stacks: list[list[str]] = []
        for initial_frame in sys._current_frames().values():
            frame: FrameType | None = initial_frame
            stack: list[str] = []
            while frame is not None and len(stack) < 20:
                stack.append(
                    f"{Path(frame.f_code.co_filename).name}:{frame.f_lineno}:{frame.f_code.co_name}"
                )
                frame = frame.f_back
            stacks.append(stack)
        return stacks

    def __exit__(self, kind: object, error: object, traceback: TracebackType | None) -> None:
        if not self.enabled:
            return
        result: dict[str, object] = {
            "lab": "PY-LAB-001",
            "passed": kind is None,
            "elapsed_s": round(time.perf_counter() - self.started, 3),
            "max_sql_ms": round(self.max_sql_ms, 3),
        }
        if kind is not None:
            result["events"] = list(self.events)
            result["stacks"] = self.failure_stacks or self.stacks()
        print(json.dumps(result))


class TraceMiddleware:
    def __init__(self, app: ASGIApp, trace: RecoveryTrace) -> None:
        self.app, self.trace = app, trace

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        self.trace.mark(f"http.{scope['method']}.begin")

        async def observed_receive() -> Message:
            self.trace.mark("body.wait")
            message = await receive()
            self.trace.mark(f"body.{message['type']}")
            return message

        async def observed_send(message: Message) -> None:
            self.trace.mark(message["type"])
            await send(message)

        await self.app(scope, observed_receive, observed_send)
        self.trace.mark("http.end")
