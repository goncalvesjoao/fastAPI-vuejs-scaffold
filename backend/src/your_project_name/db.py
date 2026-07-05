from collections.abc import Generator
from pathlib import Path

from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import make_url
from sqlmodel import Session, SQLModel

from your_project_name.models import (
    Article,  # noqa: F401 ensure models are registered with SQLModel.metadata
)
from your_project_name.settings import Settings, settings


def _ensure_sqlite_parent_dir(database_url: str) -> None:
    parsed_database_url = make_url(database_url)
    if not parsed_database_url.drivername.startswith("sqlite"):
        return
    if parsed_database_url.database in (None, "", ":memory:"):
        return

    Path(parsed_database_url.database).expanduser().parent.mkdir(
        parents=True,
        exist_ok=True,
    )


def create_database_engine(config: Settings = settings) -> Engine:
    database_url = config.normalized_database_url()
    _ensure_sqlite_parent_dir(database_url)
    return create_engine(database_url, connect_args=config.database_connect_args())


engine = create_database_engine()


def init_db(database_engine: Engine = engine) -> None:
    SQLModel.metadata.create_all(database_engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
