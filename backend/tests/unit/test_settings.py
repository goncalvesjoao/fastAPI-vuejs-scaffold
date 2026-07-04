from pathlib import Path

from your_project_name.settings import DEFAULT_DATABASE_URL, Settings


def backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def make_test_settings(tmp_path):
    return Settings(
        environment="test",
        database_url=f"sqlite+libsql:///{tmp_path / 'app.db'}",
        database_auth_token=None,
    )


def test_database_url_defaults_to_local_libsql():
    config = Settings(environment="test", database_url=None, database_auth_token=None)

    assert (
        config.normalized_database_url()
        == f"sqlite+libsql:///{backend_root() / 'data/app.db'}"
    )
    assert config.database_connect_args() == {}


def test_empty_database_url_defaults_to_local_libsql():
    config = Settings(environment="test", database_url="", database_auth_token=None)

    assert (
        config.normalized_database_url()
        == f"sqlite+libsql:///{backend_root() / 'data/app.db'}"
    )


def test_relative_libsql_database_url_resolves_from_backend_root():
    config = Settings(
        environment="test",
        database_url=DEFAULT_DATABASE_URL,
        database_auth_token=None,
    )

    database_path = Path(
        config.normalized_database_url().removeprefix("sqlite+libsql:///")
    )
    assert database_path == backend_root() / "data/app.db"


def test_plain_sqlite_database_url_is_supported(tmp_path):
    config = Settings(
        environment="test",
        database_url=f"sqlite:///{tmp_path / 'app.db'}",
        database_auth_token=None,
    )

    assert config.normalized_database_url() == f"sqlite:///{tmp_path / 'app.db'}"
    assert config.database_connect_args() == {"check_same_thread": False}


def test_absolute_sqlite_database_url_is_supported(tmp_path):
    config = make_test_settings(tmp_path)

    assert config.normalized_database_url() == f"sqlite+libsql:///{tmp_path / 'app.db'}"
    assert config.database_connect_args() == {}


def test_libsql_database_url_uses_sqlalchemy_dialect():
    config = Settings(
        environment="test",
        database_url="libsql://demo.turso.io",
        database_auth_token="secret-token",
    )

    assert (
        config.normalized_database_url() == "sqlite+libsql://demo.turso.io?secure=true"
    )
    assert config.database_connect_args() == {"auth_token": "secret-token"}


def test_local_libsql_database_url_does_not_force_secure():
    config = Settings(
        environment="test",
        database_url="sqlite+libsql:///local.db",
        database_auth_token=None,
    )

    assert (
        config.normalized_database_url()
        == f"sqlite+libsql:///{backend_root() / 'local.db'}"
    )


def test_empty_database_auth_token_omits_auth():
    config = Settings(
        environment="test",
        database_url="libsql://demo.turso.io",
        database_auth_token="",
    )

    assert (
        config.normalized_database_url() == "sqlite+libsql://demo.turso.io?secure=true"
    )
    assert config.database_connect_args() == {}


def test_platform_port_overrides_backend_and_frontend_ports(monkeypatch):
    monkeypatch.setenv("PORT", "9123")

    config = Settings(environment="test", backend_port=8000, frontend_port=5173)

    assert config.effective_backend_port == 9123
    assert config.effective_frontend_port == 9123


def test_auth_is_disabled_when_explicitly_requested():
    config = Settings(
        environment="test",
        no_auth=True,
        clerk_publishable_key="pk_test",
    )

    assert config.auth_disabled is True


def test_auth_is_disabled_when_auth_and_clerk_key_are_unset():
    config = Settings(
        environment="test",
        no_auth=None,
        clerk_publishable_key=None,
    )

    assert config.auth_disabled is True


def test_explicit_no_auth_false_requires_clerk():
    config = Settings(
        environment="test",
        no_auth=False,
        clerk_publishable_key=None,
    )

    assert config.auth_disabled is False
