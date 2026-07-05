from fastapi import APIRouter

from your_project_name.routers.api.health import router as health_router
from your_project_name.routers.api.articles import router as articles_router

router = APIRouter(prefix="/api")

router.include_router(health_router)
router.include_router(articles_router)
