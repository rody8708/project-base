# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.infrastructure.migrations import migrate_up


def test_sqlite_reader_does_not_block_writer_commit(tmp_path: Path) -> None:
    path = tmp_path / "reader-writer.sqlite"
    engine = make_engine(f"sqlite:///{path}")
    reader = sqlite3.connect(path)
    try:
        migrate_up(engine)
        with uow_factory(engine)() as uow:
            task = uow.tasks.create("user", "Before")
        reader.execute("BEGIN")
        assert reader.execute("SELECT title FROM tasks").fetchone() == ("Before",)

        def write() -> None:
            with uow_factory(engine)() as uow:
                result, _ = uow.tasks.replace("user", task.id, "After", True, 1)
                assert result == "updated"

        with ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(write)
            try:
                # Must commit while the reader is still open, below the unchanged HTTP budget.
                future.result(timeout=2)
            finally:
                reader.rollback()
        with uow_factory(engine)() as uow:
            saved = uow.tasks.find("user", task.id)
            assert saved is not None and saved.title == "After" and saved.version == 2
        with engine.connect() as connection:
            assert connection.exec_driver_sql("PRAGMA journal_mode").scalar_one() == "wal"
            assert connection.exec_driver_sql("PRAGMA synchronous").scalar_one() == 2
    finally:
        reader.close()
        engine.dispose()
        for suffix in ("", "-wal", "-shm", "-journal"):
            Path(f"{path}{suffix}").unlink(missing_ok=True)
