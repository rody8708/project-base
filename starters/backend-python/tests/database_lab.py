# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
"""Owned disposable SQL containers only; never accepts an existing database URL."""

import secrets
import shutil
import subprocess
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from project_base_api.infrastructure.database import make_engine


@contextmanager
def database_url(engine: str, distribution: str | None) -> Iterator[str | None]:
    if engine == "sqlite":
        yield None
        return
    with native_database(engine, distribution) as lab:
        yield lab.url


@dataclass
class DatabaseLab:
    url: str
    backup: Callable[[], bytes]
    restore: Callable[[bytes], None]


@contextmanager
def native_database(engine: str, distribution: str | None) -> Iterator[DatabaseLab]:
    if engine not in {"postgresql", "mysql"}:
        raise ValueError("Native backup engine must be PostgreSQL or MySQL")
    executable = shutil.which("wsl" if distribution else "docker")
    if executable is None:
        raise RuntimeError("Docker launcher is not installed")
    prefix = [executable, "-d", distribution, "--", "docker"] if distribution else [executable]

    def docker_bytes(*args: str, payload: bytes | None = None) -> bytes:
        result = subprocess.run(  # noqa: S603 -- fixed Docker operations, no shell
            [*prefix, *args], input=payload, capture_output=True, timeout=180, check=False
        )
        if result.returncode:
            # Do not expose command/environment credentials in test failures.
            raise RuntimeError(f"Isolated Docker operation failed: {args[0]}")
        return result.stdout

    def docker(*args: str) -> str:
        return docker_bytes(*args).decode("utf-8").strip()

    name = f"project-base-python-test-{secrets.token_hex(8)}"
    password = secrets.token_hex(24)
    if engine == "postgresql":
        port = "5432"
        image = "postgres:18.6-bookworm"
        options = [
            "-e",
            "POSTGRES_USER=lab",
            "-e",
            f"POSTGRES_PASSWORD={password}",
            "-e",
            "POSTGRES_DB=lab",
            "--tmpfs",
            "/var/lib/postgresql",
        ]
        driver = "postgresql+psycopg"
    else:
        port = "3306"
        image = "mysql:8.4.11"
        options = [
            "-e",
            f"MYSQL_ROOT_PASSWORD={secrets.token_hex(24)}",
            "-e",
            "MYSQL_USER=lab",
            "-e",
            f"MYSQL_PASSWORD={password}",
            "-e",
            "MYSQL_DATABASE=lab",
            "--tmpfs",
            "/var/lib/mysql",
        ]
        driver = "mysql+pymysql"
    try:
        docker(
            "run",
            "--detach",
            "--name",
            name,
            "--label",
            "project-base=python-test",
            "--publish",
            f"127.0.0.1::{port}",
            *options,
            image,
        )
        host_port = docker("port", name, f"{port}/tcp").rsplit(":", 1)[1]
        url = f"{driver}://lab:{password}@127.0.0.1:{host_port}/lab"
        if engine == "mysql":
            url += "?charset=utf8mb4"
        probe = make_engine(url)
        try:
            deadline = time.monotonic() + 120
            while True:
                try:
                    with probe.connect() as connection:
                        connection.execute(text("SELECT 1"))
                    break
                except SQLAlchemyError:
                    if time.monotonic() >= deadline:
                        raise RuntimeError("Isolated database did not become ready") from None
                    time.sleep(1)

            def backup() -> bytes:
                if engine == "postgresql":
                    return docker_bytes(
                        "exec",
                        "-e",
                        f"PGPASSWORD={password}",
                        name,
                        "pg_dump",
                        "-U",
                        "lab",
                        "-d",
                        "lab",
                        "--no-owner",
                        "--no-acl",
                    )
                return docker_bytes(
                    "exec",
                    "-e",
                    f"MYSQL_PWD={password}",
                    name,
                    "mysqldump",
                    "-u",
                    "lab",
                    "--single-transaction",
                    "--no-tablespaces",
                    "--set-gtid-purged=OFF",
                    "lab",
                )

            def restore(payload: bytes) -> None:
                if engine == "postgresql":
                    docker_bytes(
                        "exec",
                        "-i",
                        "-e",
                        f"PGPASSWORD={password}",
                        name,
                        "psql",
                        "-U",
                        "lab",
                        "-d",
                        "lab",
                        "-v",
                        "ON_ERROR_STOP=1",
                        payload=payload,
                    )
                else:
                    docker_bytes(
                        "exec",
                        "-i",
                        "-e",
                        f"MYSQL_PWD={password}",
                        name,
                        "mysql",
                        "-u",
                        "lab",
                        "lab",
                        payload=payload,
                    )

            yield DatabaseLab(url, backup, restore)
        finally:
            probe.dispose()
    finally:
        # Exact random name created by this invocation; no volumes or host mounts.
        if docker("ps", "-aq", "--filter", f"name=^/{name}$"):
            docker("rm", "--force", "--volumes", name)
        if docker("ps", "-aq", "--filter", f"name=^/{name}$"):
            raise RuntimeError("Isolated database cleanup failed")
