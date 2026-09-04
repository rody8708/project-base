# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import argparse
import hashlib
import os
import re
import secrets
import time
from pathlib import Path

from dotenv import load_dotenv

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.infrastructure.migrations import migrate_up


def main() -> None:
    load_dotenv(dotenv_path=Path.cwd() / ".env", override=False)
    parser = argparse.ArgumentParser(description="Provision a local evaluation bearer token.")
    parser.add_argument("subject")
    parser.add_argument("--permissions", default="tasks:read,tasks:write")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:@/-]{0,127}", args.subject):
        parser.error("subject must be a portable 1-128 character identifier")
    permissions = tuple(item.strip() for item in args.permissions.split(",") if item.strip())
    if not permissions or any(item not in {"tasks:read", "tasks:write"} for item in permissions):
        parser.error("permissions must be tasks:read and/or tasks:write")
    token = secrets.token_hex(32)
    engine = make_engine(os.getenv("DATABASE_URL", "sqlite:///./database.sqlite"))
    migrate_up(engine)
    with uow_factory(engine)() as uow:
        uow.tokens.provision(
            args.subject,
            tuple(sorted(set(permissions))),
            hashlib.sha256(token.encode()).hexdigest(),
            int(time.time()) + 86400,
        )
    print(token)


if __name__ == "__main__":
    main()
