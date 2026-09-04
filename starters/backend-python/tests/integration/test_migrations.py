# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
from pathlib import Path

from sqlalchemy import inspect

from project_base_api.infrastructure.database import make_engine
from project_base_api.infrastructure.migrations import migrate_down, migrate_up


def test_migration_can_be_applied_and_rolled_back(tmp_path: Path) -> None:
    engine = make_engine(f"sqlite:///{tmp_path / 'migration.sqlite'}")
    migrate_up(engine)
    assert {"tasks", "tokens", "rate_limits", "schema_migrations"}.issubset(
        inspect(engine).get_table_names()
    )
    migrate_down(engine)
    assert inspect(engine).get_table_names() == ["schema_migrations"]
    engine.dispose()
