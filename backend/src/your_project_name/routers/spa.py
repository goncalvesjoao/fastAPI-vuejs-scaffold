from pathlib import Path

from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from your_project_name.exceptions import NotFoundError


def _public_file_response(
    public_dir: Path,
    requested_path: str,
) -> FileResponse | None:
    if requested_path == "":
        return None

    relative_path = Path(requested_path)
    if relative_path.is_absolute() or ".." in relative_path.parts:
        return None

    public_file_path = public_dir / relative_path
    if public_file_path.is_file():
        return FileResponse(public_file_path)

    return None


def create_spa_router(
    frontend_build_dir: Path,
    *,
    public_dir: Path,
) -> APIRouter:
    router = APIRouter()

    if frontend_build_dir.is_dir() and (frontend_build_dir / "assets").is_dir():
        router.mount(
            "/assets",
            StaticFiles(directory=str(frontend_build_dir / "assets")),
            name="assets",
        )

    @router.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        public_response = _public_file_response(public_dir, full_path)
        if public_response is not None:
            return public_response

        static_file_path = frontend_build_dir / full_path
        if static_file_path.is_file():
            return FileResponse(static_file_path)

        frontend_index = frontend_build_dir / "index.html"
        if frontend_index.is_file():
            return FileResponse(frontend_index)

        if full_path == "":
            return {
                "message": "Frontend not built. Run `npm run build` to generate static files."
            }

        raise NotFoundError()

    return router
