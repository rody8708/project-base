# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import socket
import ssl

import httpx
import pytest
from sqlalchemy import Engine

from project_base_api.infrastructure.database import uow_factory
from project_base_api.presentation.http import create_app
from tests.http_lab import live_server


def test_tls_verifies_trust_hostname_and_protocol(engine: Engine) -> None:
    with live_server(create_app(uow_factory(engine)), tls=True) as (url, context):
        assert isinstance(context, ssl.SSLContext)
        with httpx.Client(verify=context, trust_env=False) as client:
            assert client.get(f"{url}/api/health").status_code == 200
        with httpx.Client(trust_env=False) as untrusted:
            with pytest.raises(httpx.ConnectError):
                untrusted.get(f"{url}/api/health")
        port = int(url.rsplit(":", 1)[1])
        with socket.create_connection(("127.0.0.1", port), timeout=5) as connection:
            with context.wrap_socket(connection, server_hostname="localhost") as encrypted:
                assert encrypted.version() in {"TLSv1.2", "TLSv1.3"}
        with socket.create_connection(("127.0.0.1", port), timeout=5) as connection:
            with pytest.raises(ssl.SSLCertVerificationError):
                context.wrap_socket(connection, server_hostname="wrong.invalid")


def test_tls_rejects_expired_certificate(engine: Engine) -> None:
    with live_server(create_app(uow_factory(engine)), tls=True, expired=True) as (url, context):
        with httpx.Client(verify=context, trust_env=False) as client:
            with pytest.raises(httpx.ConnectError, match="certificate has expired"):
                client.get(f"{url}/api/health")
