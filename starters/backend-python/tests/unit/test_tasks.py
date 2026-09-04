# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import pytest

from project_base_api.application.errors import ApiError
from project_base_api.application.tasks import validate_title


def test_title_is_trimmed() -> None:
    assert validate_title("  Ship safely  ") == "Ship safely"


@pytest.mark.parametrize("value", ["", " ", 4, "x" * 81, "line\nbreak"])
def test_invalid_title_is_rejected(value: object) -> None:
    with pytest.raises(ApiError) as error:
        validate_title(value)
    assert error.value.code == "VALIDATION_FAILED"
