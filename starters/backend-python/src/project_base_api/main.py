# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import os
from pathlib import Path

from dotenv import load_dotenv

from project_base_api.infrastructure.database import make_engine, uow_factory
from project_base_api.presentation.http import create_app

load_dotenv(dotenv_path=Path.cwd() / ".env", override=False)
database_url = os.getenv("DATABASE_URL", "sqlite:///./database.sqlite")
engine = make_engine(database_url)
origins = tuple(
    value.strip() for value in os.getenv("API_ALLOWED_ORIGINS", "").split(",") if value.strip()
)
app = create_app(uow_factory(engine), origins)
