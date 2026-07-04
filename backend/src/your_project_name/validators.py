from typing import Any

from your_project_name.exceptions import UnprocessableContentError


class BaseValidator:
    """Collects business-rule failures and raises a single 422 with all errors."""

    def __init__(self) -> None:
        self._errors: list[dict[str, Any]] = []

    def add(
        self,
        type: str,
        loc: list[str],
        msg: str,
        input: Any,
    ) -> None:
        self._errors.append({"type": type, "loc": loc, "msg": msg, "input": input})

    def raise_if_invalid(self) -> None:
        if self._errors:
            raise UnprocessableContentError(detail=self._errors)
