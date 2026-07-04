import anyio
import httpx
from fastapi import FastAPI

from your_project_name.routers.spa import create_spa_router


def create_test_app(tmp_path):
    app = FastAPI()
    app.include_router(
        create_spa_router(
            tmp_path / "spa",
            public_dir=tmp_path / "public",
        )
    )
    return app


def test_serves_public_favicon_from_root_path_before_spa_build(tmp_path):
    public_dir = tmp_path / "public"
    public_dir.mkdir()
    (public_dir / "favicon.ico").write_bytes(b"public-icon")

    frontend_build_dir = tmp_path / "spa"
    frontend_build_dir.mkdir()
    (frontend_build_dir / "favicon.ico").write_bytes(b"spa-icon")

    app = create_test_app(tmp_path)

    async def make_request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.get("/favicon.ico")

    response = anyio.run(make_request)

    assert response.status_code == 200
    assert response.content == b"public-icon"


def test_serves_public_assets_from_root_path(tmp_path):
    public_dir = tmp_path / "public"
    public_dir.mkdir()
    (public_dir / "robots.txt").write_text("User-agent: *", encoding="utf-8")

    app = create_test_app(tmp_path)

    async def make_request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.get("/robots.txt")

    response = anyio.run(make_request)

    assert response.status_code == 200
    assert response.text == "User-agent: *"


def test_serves_frontend_build_index_for_spa_routes(tmp_path):
    frontend_build_dir = tmp_path / "spa"
    frontend_build_dir.mkdir()
    (frontend_build_dir / "index.html").write_text("<main>app</main>", encoding="utf-8")

    app = create_test_app(tmp_path)

    async def make_request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.get("/posts/123")

    response = anyio.run(make_request)

    assert response.status_code == 200
    assert response.text == "<main>app</main>"


def test_returns_fallback_message_when_frontend_build_is_missing(tmp_path):
    app = create_test_app(tmp_path)

    async def make_request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.get("/")

    response = anyio.run(make_request)

    assert response.status_code == 200
    assert response.json() == {
        "message": "Frontend not built. Run `npm run build` to generate static files."
    }
