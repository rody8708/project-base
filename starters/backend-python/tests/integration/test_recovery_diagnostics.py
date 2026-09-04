# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import json

import httpx
import pytest
from sqlalchemy import Engine, text

from tests.recovery_diagnostics import RecoveryTrace


def test_diagnostics_are_bounded_and_omit_sensitive_values(
    engine: Engine, capsys: pytest.CaptureFixture[str]
) -> None:
    canary = "synthetic-private-canary"
    trace = RecoveryTrace(True)
    with pytest.raises(RuntimeError), trace:
        trace.attach(engine)
        with engine.connect() as connection:
            connection.execute(text("SELECT :value"), {"value": canary})
        for _ in range(100):
            trace.mark("test.event")
        with trace.client("https://localhost", True) as client:
            assert client.timeout.read == 5
            request = httpx.Request("PUT", "https://localhost", headers={"Authorization": canary})
            client.event_hooks["request"][0](request)
            request.extensions["trace"](
                "http11.receive_response_headers.failed", {"exception": canary}
            )
            assert trace.failure_stacks
        raise RuntimeError(canary)
    output = capsys.readouterr().out
    assert canary not in output
    report = json.loads(output)
    assert report["passed"] is False
    assert len(report["events"]) == 80
    assert report["stacks"]


def test_diagnostics_are_opt_in(capsys: pytest.CaptureFixture[str]) -> None:
    with RecoveryTrace(False) as trace:
        trace.mark("not-recorded")
        with trace.client("https://localhost", True) as client:
            assert client.timeout.read == 5
            assert client.event_hooks["request"] == []
    assert not trace.events
    assert capsys.readouterr().out == ""
