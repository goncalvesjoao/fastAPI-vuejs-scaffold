from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from your_project_name.db import init_db
from your_project_name.dependencies import enforce_basic_auth
from your_project_name.exceptions import register_exception_handlers
from your_project_name.i18n import I18nMiddleware
from your_project_name.routers import router as routers
from your_project_name.settings import settings


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    dependencies: list[Any] = []

    # Protecting production env with basic auth
    if settings.basic_auth:
        dependencies.append(Depends(dependency=enforce_basic_auth))

    app = FastAPI(
        lifespan=lifespan,
        dependencies=dependencies,
    )

    register_exception_handlers(app=app)

    app.add_middleware(I18nMiddleware)
    app.add_middleware(
        middleware_class=CORSMiddleware,
        allow_origins=[f"http://localhost:{settings.effective_frontend_port}"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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
