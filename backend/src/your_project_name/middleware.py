import base64
from collections import defaultdict, deque
import hashlib
import math
import secrets
from threading import Lock
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from your_project_name.i18n import I18nMiddleware
from your_project_name.settings import settings


class RequestBodyTooLargeError(Exception):
    pass


class RequestBodyLimitMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] not in {
            "POST",
            "PUT",
            "PATCH",
        }:
            await self.app(scope, receive, send)
            return

        limit = settings.request_body_max_bytes
        if limit <= 0:
            await self.app(scope, receive, send)
            return

        if _content_length_exceeds_limit(_header(scope, b"content-length"), limit):
            await _request_body_too_large_response(scope, receive, send)
            return

        received = 0

        async def limited_receive() -> Message:
            nonlocal received

            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > limit:
                    raise RequestBodyTooLargeError
            return message

        try:
            await self.app(scope, limited_receive, send)
        except RequestBodyTooLargeError:
            await _request_body_too_large_response(scope, receive, send)


class RateLimitMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app
        self.requests: defaultdict[str, deque[float]] = defaultdict(deque)
        self.lock = Lock()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not scope["path"].startswith("/api/"):
            await self.app(scope, receive, send)
            return

        limit = settings.rate_limit_requests
        window = settings.rate_limit_window_seconds
        if limit <= 0 or window <= 0:
            await self.app(scope, receive, send)
            return

        retry_after = self._retry_after(_rate_limit_keys(scope), limit, window)
        if retry_after is not None:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded."},
                headers={"Retry-After": str(retry_after)},
            )
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)

    def _retry_after(self, keys: list[str], limit: int, window: int) -> int | None:
        now = time.monotonic()
        cutoff = now - window

        with self.lock:
            for key in keys:
                timestamps = self.requests[key]
                while timestamps and timestamps[0] <= cutoff:
                    timestamps.popleft()
                if len(timestamps) >= limit:
                    return max(1, math.ceil(window - (now - timestamps[0])))

            for key in keys:
                self.requests[key].append(now)

        return None


class StaticFilesBasicAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        if not settings.basic_auth or request.url.path.startswith("/api/"):
            return await call_next(request)

        auth = request.headers.get("Authorization")
        if not auth:
            return _basic_auth_response()

        try:
            scheme, encoded = auth.split(" ", 1)
        except ValueError:
            return _basic_auth_response()

        if scheme.lower() != "basic":
            return _basic_auth_response()

        try:
            decoded = base64.b64decode(encoded).decode("utf-8")
        except Exception:
            return _basic_auth_response()

        if ":" not in decoded:
            return _basic_auth_response()

        username, _, password = decoded.partition(":")
        is_user = secrets.compare_digest(username, settings.basic_auth_username or "")
        is_pass = secrets.compare_digest(password, settings.basic_auth_password or "")

        if not (is_user and is_pass):
            return _basic_auth_response()

        return await call_next(request)


async def _request_body_too_large_response(
    scope: Scope,
    receive: Receive,
    send: Send,
) -> None:
    response = JSONResponse(
        status_code=413,
        content={"detail": "Request body too large."},
    )
    await response(scope, receive, send)


def _basic_auth_response() -> Response:
    return Response(
        status_code=401,
        headers={"WWW-Authenticate": "Basic"},
        content="Unauthorized",
    )


def _header(scope: Scope, name: bytes) -> bytes | None:
    for header_name, header_value in scope["headers"]:
        if header_name == name:
            return header_value
    return None


def _content_length_exceeds_limit(content_length: bytes | None, limit: int) -> bool:
    if content_length is None:
        return False

    try:
        return int(content_length) > limit
    except ValueError:
        return False


def _rate_limit_keys(scope: Scope) -> list[str]:
    client = scope.get("client")
    client_host = client[0] if client else "unknown"
    keys = [f"ip:{client_host}"]

    authorization = _header(scope, b"authorization")
    if authorization:
        digest = hashlib.sha256(authorization).hexdigest()[:16]
        keys.append(f"auth:{digest}")

    return keys


def register_middleware(app: FastAPI) -> None:
    app.add_middleware(StaticFilesBasicAuthMiddleware)
    app.add_middleware(I18nMiddleware)
    app.add_middleware(RequestBodyLimitMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[f"http://localhost:{settings.effective_frontend_port}"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
