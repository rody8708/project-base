# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import argparse
import os
from pathlib import Path

from dotenv import load_dotenv

from project_base_api.infrastructure.database import make_engine
from project_base_api.infrastructure.migrations import migrate_down, migrate_up


def main() -> None:
    load_dotenv(dotenv_path=Path.cwd() / ".env", override=False)
    parser = argparse.ArgumentParser(description="Apply or roll back one versioned migration.")
    parser.add_argument("direction", choices=("up", "down"))
    args = parser.parse_args()
    engine = make_engine(os.getenv("DATABASE_URL", "sqlite:///./database.sqlite"))
    if args.direction == "up":
        migrate_up(engine)
    else:
        migrate_down(engine)


if __name__ == "__main__":
    main()
