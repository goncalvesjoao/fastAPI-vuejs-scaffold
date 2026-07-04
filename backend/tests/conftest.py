import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel

from your_project_name.settings import settings

pytest_plugins = ["support.factories", "support.auth"]


@pytest.fixture()
def _vcr_provider(monkeypatch):
    monkeypatch.setattr(
        "your_project_name.services.post.openai_provider.settings.openai_api_key",
        None,
    )
    monkeypatch.setattr(
        "your_project_name.services.post.openai_provider.settings.openrouter_api_key",
        os.environ.get("OPENROUTER_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
        or "vcr-dummy-key",
    )


@pytest.fixture()
def test_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture()
def test_app(monkeypatch, test_engine):
    from support import auth

    monkeypatch.setattr(settings, "no_auth", False)
    monkeypatch.setattr(settings, "clerk_issuer", auth.TEST_ISSUER)
    monkeypatch.setattr(settings, "database_url", "sqlite:///:memory:")
    monkeypatch.setattr("your_project_name.db.engine", test_engine)
    monkeypatch.setattr(
        "your_project_name.services.auth._fetch_jwks",
        lambda issuer: auth.JWKS,
    )

    from your_project_name.app import create_app
    from your_project_name.db import get_session

    app_instance = create_app()

    def get_test_session():
        with Session(test_engine) as session:
            yield session

    app_instance.dependency_overrides[get_session] = get_test_session

    return app_instance


@pytest.fixture()
def test_session(test_engine):
    with Session(test_engine) as session:
        yield session


@pytest.fixture()
def test_client(test_app):
    return TestClient(test_app)
