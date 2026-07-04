from pathlib import Path

from fastapi import APIRouter

from your_project_name.routers.api import router as api_router
from your_project_name.routers.spa import create_spa_router

router = APIRouter()
router.include_router(api_router)

BACKEND_DIR = Path(__file__).resolve().parents[3]
router.include_router(
    create_spa_router(
        BACKEND_DIR / "spa",
        public_dir=BACKEND_DIR / "public",
    )
)
