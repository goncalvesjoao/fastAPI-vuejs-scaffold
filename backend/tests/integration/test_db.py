from sqlalchemy import inspect

from your_project_name.db import create_database_engine, init_db
from your_project_name.settings import Settings


def make_test_settings(tmp_path):
    return Settings(
        environment="test",
        database_url=f"sqlite+libsql:///{tmp_path / 'app.db'}",
        database_auth_token=None,
    )


def test_init_db_creates_tables(tmp_path):
    engine = create_database_engine(make_test_settings(tmp_path))

    init_db(engine)

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    assert "articles" in table_names
