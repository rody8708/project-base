# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import json
import sqlite3
import time
import uuid
from typing import Literal

from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    MetaData,
    String,
    Table,
    and_,
    create_engine,
    delete,
    event,
    insert,
    select,
    update,
)
from sqlalchemy.dialects.mysql import insert as mysql_insert
from sqlalchemy.dialects.postgresql import insert as postgresql_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.engine import Connection, Engine, Transaction
from sqlalchemy.sql.elements import ColumnElement

from project_base_api.domain.models import Principal, Task
from project_base_api.domain.repositories import UnitOfWork

metadata = MetaData()
tasks = Table(
    "tasks",
    metadata,
    Column("id", String(36), primary_key=True),
    Column("owner", String(128), nullable=False, index=True),
    Column("title", String(80), nullable=False),
    Column("completed", Boolean, nullable=False),
    Column("version", Integer, nullable=False),
)
tokens = Table(
    "tokens",
    metadata,
    Column("id", String(36), primary_key=True),
    Column("digest", String(64), nullable=False, unique=True),
    Column("subject", String(128), nullable=False),
    Column("permissions", String(512), nullable=False),
    Column("expires_at", Integer, nullable=False),
    Column("revoked", Boolean, nullable=False, default=False),
)
rate_limits = Table(
    "rate_limits",
    metadata,
    Column("key", String(64), primary_key=True),
    Column("window", Integer, primary_key=True),
    Column("count", Integer, nullable=False),
)


def make_engine(database_url: str) -> Engine:
    engine = create_engine(database_url, pool_pre_ping=True)
    if engine.dialect.name == "sqlite" and engine.url.database not in {None, "", ":memory:"}:
        if sqlite3.sqlite_version_info < (3, 51, 3):
            engine.dispose()
            raise RuntimeError("SQLite 3.51.3+ is required for safe WAL; use the pinned uv runtime")

        def configure_sqlite(connection: sqlite3.Connection, _record: object) -> None:
            cursor = connection.cursor()
            try:
                mode = cursor.execute("PRAGMA journal_mode=WAL").fetchone()
                if mode != ("wal",):
                    raise RuntimeError("SQLite WAL requires a writable local filesystem")
                cursor.execute("PRAGMA synchronous=FULL")
            finally:
                cursor.close()

        event.listen(engine, "connect", configure_sqlite)
    return engine


class SqlAlchemyRepository:
    def __init__(self, connection: Connection) -> None:
        self.connection = connection

    def _owner_matches(self, owner: str) -> ColumnElement[bool]:
        # MySQL's default collation ignores case. Identity must not.
        column = tasks.c.owner
        if self.connection.dialect.name == "mysql":
            return column.collate("utf8mb4_bin") == owner
        return column == owner

    @staticmethod
    def _task(row: object) -> Task:
        values = row._mapping  # type: ignore[attr-defined]
        return Task(
            values["id"], values["owner"], values["title"], values["completed"], values["version"]
        )

    def list(self, owner: str, limit: int, after: str | None) -> tuple[list[Task], str | None]:
        condition = self._owner_matches(owner)
        if after:
            condition = and_(condition, tasks.c.id > after)
        rows = self.connection.execute(
            select(tasks).where(condition).order_by(tasks.c.id).limit(limit)
        ).all()
        result = [self._task(row) for row in rows]
        return result, result[-1].id if result else None

    def find(self, owner: str, task_id: str) -> Task | None:
        row = self.connection.execute(
            select(tasks).where(and_(self._owner_matches(owner), tasks.c.id == task_id))
        ).first()
        return self._task(row) if row else None

    def create(self, owner: str, title: str) -> Task:
        task = Task(str(uuid.uuid4()), owner, title, False, 1)
        self.connection.execute(
            insert(tasks).values(
                id=task.id,
                owner=task.owner,
                title=task.title,
                completed=task.completed,
                version=task.version,
            )
        )
        return task

    def replace(
        self, owner: str, task_id: str, title: str, completed: bool, version: int
    ) -> tuple[Literal["updated", "missing", "conflict"], Task | None]:
        changed = self.connection.execute(
            update(tasks)
            .where(
                and_(self._owner_matches(owner), tasks.c.id == task_id, tasks.c.version == version)
            )
            .values(title=title, completed=completed, version=version + 1)
        ).rowcount
        if changed:
            return "updated", Task(task_id, owner, title, completed, version + 1)
        current = self.find(owner, task_id)
        return ("conflict", None) if current else ("missing", None)

    def delete(
        self, owner: str, task_id: str, version: int
    ) -> Literal["deleted", "missing", "conflict"]:
        changed = self.connection.execute(
            delete(tasks).where(
                and_(self._owner_matches(owner), tasks.c.id == task_id, tasks.c.version == version)
            )
        ).rowcount
        if changed:
            return "deleted"
        return "conflict" if self.find(owner, task_id) else "missing"

    def find_principal(self, token_digest: str) -> Principal | None:
        row = self.connection.execute(
            select(tokens).where(
                and_(
                    tokens.c.digest == token_digest,
                    tokens.c.revoked.is_(False),
                    tokens.c.expires_at > int(time.time()),
                )
            )
        ).first()
        if not row:
            return None
        values = row._mapping
        return Principal(values["id"], values["subject"], tuple(json.loads(values["permissions"])))

    def provision(
        self, subject: str, permissions: tuple[str, ...], token_digest: str, expires_at: int
    ) -> None:
        self.connection.execute(
            insert(tokens).values(
                id=str(uuid.uuid4()),
                digest=token_digest,
                subject=subject,
                permissions=json.dumps(permissions),
                expires_at=expires_at,
                revoked=False,
            )
        )

    def revoke(self, token_id: str) -> None:
        self.connection.execute(update(tokens).where(tokens.c.id == token_id).values(revoked=True))

    def consume(self, key: str, window: int, maximum: int) -> bool:
        values = {"key": key, "window": window, "count": 0}
        dialect = self.connection.dialect.name
        if dialect == "mysql":
            statement = mysql_insert(rate_limits).values(**values)
            self.connection.execute(statement.on_duplicate_key_update(count=rate_limits.c.count))
        elif dialect == "postgresql":
            self.connection.execute(
                postgresql_insert(rate_limits).values(**values).on_conflict_do_nothing()
            )
        elif dialect == "sqlite":
            self.connection.execute(
                sqlite_insert(rate_limits).values(**values).on_conflict_do_nothing()
            )
        else:
            raise ValueError("Unsupported rate-limit database dialect")
        changed = self.connection.execute(
            update(rate_limits)
            .where(
                and_(
                    rate_limits.c.key == key,
                    rate_limits.c.window == window,
                    rate_limits.c.count < maximum,
                )
            )
            .values(count=rate_limits.c.count + 1)
        ).rowcount
        return changed == 1


class SqlAlchemyUnitOfWork(UnitOfWork):
    engine: Engine
    connection: Connection
    transaction: Transaction
    tasks: SqlAlchemyRepository
    tokens: SqlAlchemyRepository
    rates: SqlAlchemyRepository

    def __init__(self) -> None:
        pass

    def __enter__(self) -> "SqlAlchemyUnitOfWork":
        self.connection = self.engine.connect()
        self.transaction = self.connection.begin()
        repository = SqlAlchemyRepository(self.connection)
        self.tasks = repository
        self.tokens = repository
        self.rates = repository
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        if exc_type is None:
            self.transaction.commit()
        else:
            self.transaction.rollback()
        self.connection.close()


def uow_factory(engine: Engine) -> type[SqlAlchemyUnitOfWork]:
    class BoundUnitOfWork(SqlAlchemyUnitOfWork):
        pass

    BoundUnitOfWork.engine = engine
    return BoundUnitOfWork
