from pydantic import BaseModel
from fastapi import APIRouter
from sqlalchemy import text

from your_project_name.db import engine

router = APIRouter()


class HealthResult(BaseModel):
    api: bool
    database: bool


@router.get("/health")
def health() -> HealthResult:
    db_healthy = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_healthy = False

    return HealthResult(api=True, database=db_healthy)
