from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_ENVIRONMENT = "production"
DEFAULT_BACKEND_PORT = 8000
DEFAULT_FRONTEND_PORT = 5173
DEFAULT_PLATFORM_PORT: int | None = None
DEFAULT_DATABASE_URL = "sqlite+libsql:///data/app.db"
DEFAULT_DATABASE_AUTH_TOKEN: str | None = None
LOCAL_DATABASE_DRIVERS = {"sqlite", "sqlite+libsql"}
DEFAULT_REQUEST_BODY_MAX_BYTES = 512 * 1024
DEFAULT_RATE_LIMIT_REQUESTS = 600
DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 60


def normalize_database_url(value: str | None) -> str:
    database_url = (value or DEFAULT_DATABASE_URL).strip() or DEFAULT_DATABASE_URL
    if database_url.startswith("libsql://"):
        database_url = f"sqlite+{database_url}"

    parsed_database_url = make_url(database_url)
    if (
        parsed_database_url.drivername == "sqlite+libsql"
        and parsed_database_url.host
        and "secure" not in parsed_database_url.query
    ):
        delimiter = "&" if "?" in database_url else "?"
        return f"{database_url}{delimiter}secure=true"

    if (
        parsed_database_url.drivername in LOCAL_DATABASE_DRIVERS
        and parsed_database_url.host is None
        and parsed_database_url.database not in (None, "", ":memory:")
    ):
        database_path = Path(parsed_database_url.database).expanduser()
        if not database_path.is_absolute():
            database_path = BACKEND_DIR / database_path
        return f"{parsed_database_url.drivername}:///{database_path}"

    return database_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = DEFAULT_ENVIRONMENT
    backend_port: int = DEFAULT_BACKEND_PORT
    frontend_port: int = DEFAULT_FRONTEND_PORT
    platform_port: int | None = Field(
        default=DEFAULT_PLATFORM_PORT,
        validation_alias="PORT",
    )
    database_url: str | None = DEFAULT_DATABASE_URL
    database_auth_token: str | None = DEFAULT_DATABASE_AUTH_TOKEN
    no_auth: bool | None = None
    clerk_secret_key: str | None = None
    clerk_publishable_key: str | None = None
    clerk_issuer: str | None = None
    clerk_authorized_parties: str = ""
    basic_auth_username: str | None = None
    basic_auth_password: str | None = None
    request_body_max_bytes: int = DEFAULT_REQUEST_BODY_MAX_BYTES
    rate_limit_requests: int = DEFAULT_RATE_LIMIT_REQUESTS
    rate_limit_window_seconds: int = DEFAULT_RATE_LIMIT_WINDOW_SECONDS
    sentry_dsn: str | None = None

    # TODO: make the app raise an error if if self.auth_disabled is True and self.auth_issuer is empty

    @property
    def auth_issuer(self) -> str:
        return (self.clerk_issuer or "").strip().rstrip("/")

    @property
    def basic_auth(self) -> bool:
        if not (self.basic_auth_username and self.basic_auth_password):
            return False
        return True

    @property
    def effective_backend_port(self) -> int:
        return self.platform_port or self.backend_port

    @property
    def effective_frontend_port(self) -> int:
        return self.platform_port or self.frontend_port

    def development_mode(self) -> bool:
        return self.environment.lower() == "development"

    @property
    def auth_disabled(self) -> bool:
        return self.no_auth is True or (
            self.no_auth is None and self.clerk_publishable_key is None
        )

    def normalized_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def authorized_parties(self) -> list[str]:
        if not self.clerk_authorized_parties.strip():
            return []
        return [
            authorized_party.strip()
            for authorized_party in self.clerk_authorized_parties.split(",")
            if authorized_party.strip()
        ]

    def database_connect_args(self) -> dict[str, object]:
        database_url = self.normalized_database_url()
        if database_url.startswith("sqlite+libsql://"):
            database_auth_token = (
                self.database_auth_token.strip()
                if self.database_auth_token is not None
                else ""
            )
            if database_auth_token == "":
                return {}
            return {"auth_token": database_auth_token}
        if database_url.startswith("sqlite://"):
            return {"check_same_thread": False}

        return {}


settings = Settings()
