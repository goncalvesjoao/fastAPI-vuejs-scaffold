from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI

from your_project_name.db import init_db
from your_project_name.exceptions import register_exception_handlers
from your_project_name.middleware import register_middleware
from your_project_name.routers import router as routers
from your_project_name.settings import settings

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        send_default_pii=True,
    )


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)

    register_exception_handlers(app)
    register_middleware(app)

    app.include_router(router=routers)

    return app


app: FastAPI = create_app()


def main() -> None:
    import uvicorn

    uvicorn.run(
        app="your_project_name.app:app",
        host="0.0.0.0",
        port=settings.effective_backend_port,
        reload=settings.development_mode(),
    )


if __name__ == "__main__":
    main()
