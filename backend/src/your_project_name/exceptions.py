from collections.abc import Mapping, Sequence
from typing import Any, Final

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from your_project_name.i18n import I18n, get_i18n
from your_project_name.models import HTTPErrorResponse, HTTPValidationError


class UnauthorizedError(HTTPException):
    RESPONSE: Final[dict[int | str, dict[str, Any]]] = {
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Unauthorized access",
            "model": HTTPErrorResponse,
        },
    }

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail or "Unauthorized access",
        )


class UnprocessableContentError(HTTPException):
    RESPONSE: Final[dict[int | str, dict[str, Any]]] = {
        status.HTTP_422_UNPROCESSABLE_CONTENT: {
            "description": "Invalid or missing data provided",
            "model": HTTPValidationError,
        },
    }

    def __init__(self, detail: list[dict[str, Any]] | None = None) -> None:
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=detail,
        )


class NotFoundError(HTTPException):
    RESPONSE: Final[dict[int | str, dict[str, Any]]] = {
        status.HTTP_404_NOT_FOUND: {
            "description": "Resource not found",
            "model": HTTPErrorResponse,
        },
    }

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail or "Resource not found",
        )


class RecordNotFoundError(NotFoundError):
    def __init__(self, name: str, **params: Any) -> None:
        formatted_params = ", ".join(f"{k}={v!r}" for k, v in params.items())

        super().__init__(
            detail=f"{name} not found with parameters: {formatted_params}",
        )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        RequestValidationError,
        request_validation_exception_handler,
    )


async def request_validation_exception_handler(
    request: Request,
    exception: Exception,
) -> JSONResponse:
    if not isinstance(exception, RequestValidationError):
        raise exception

    errors = _translate_errors(exception.errors(), get_i18n(request))

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content=jsonable_encoder({"detail": errors}),
    )


def _translate_errors(
    errors: Sequence[Mapping[str, Any]],
    i18n: I18n,
) -> list[dict[str, Any]]:
    translated_errors: list[dict[str, Any]] = []

    for original_error in errors:
        error = dict(original_error)
        error["msg"] = i18n.t(
            f"validation.{error.get('type')}",
            fallback=str(error.get("msg", "")),
            **error.get("ctx", {}),
        )

        translated_errors.append(error)

    return translated_errors
