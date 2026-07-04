from functools import lru_cache
from pathlib import Path
import tomllib
from typing import Any

from starlette.requests import Request
from starlette.types import ASGIApp, Receive, Scope, Send

DEFAULT_LOCALE = "en"
LOCALES_PATH = Path(__file__).with_name("locales")

Catalog = dict[str, Any]


class MissingTranslationError(LookupError):
    pass


@lru_cache
def _catalogs() -> dict[str, Catalog]:
    catalogs: dict[str, Catalog] = {}

    for catalog_path in LOCALES_PATH.glob("*.toml"):
        with catalog_path.open("rb") as catalog_file:
            catalog = tomllib.load(catalog_file)
            _validate_catalog(catalog, catalog_path)
            catalogs[catalog_path.stem.lower()] = catalog

    if DEFAULT_LOCALE not in catalogs:
        raise ValueError(
            f"Default locale {DEFAULT_LOCALE!r} is missing from {LOCALES_PATH}"
        )

    return catalogs


def _validate_catalog(catalog: Catalog, catalog_path: Path) -> None:
    pending: list[tuple[str, Any]] = list(catalog.items())

    while pending:
        key, value = pending.pop()
        if isinstance(value, dict):
            pending.extend(
                (f"{key}.{nested_key}", nested_value)
                for nested_key, nested_value in value.items()
            )
        elif not isinstance(value, str):
            raise ValueError(
                f"Translation {key!r} in {catalog_path} must be a string"
            )


class I18n:
    def __init__(self, locale: str = DEFAULT_LOCALE) -> None:
        self.locale = self.resolve_locale(locale)

    @classmethod
    def supported_locales(cls) -> set[str]:
        return set(_catalogs())

    @classmethod
    def _match_locale(cls, locale: str) -> str | None:
        normalized_locale = locale.strip().replace("_", "-").lower()
        candidates = (normalized_locale, normalized_locale.partition("-")[0])

        for candidate in candidates:
            if candidate in _catalogs():
                return candidate

        return None

    @classmethod
    def resolve_locale(cls, locale: str) -> str:
        return cls._match_locale(locale) or DEFAULT_LOCALE

    @classmethod
    def from_accept_language(cls, accept_language: str | None) -> "I18n":
        preferences: list[tuple[float, int, str]] = []

        for position, preference in enumerate((accept_language or "").split(",")):
            parts = [part.strip() for part in preference.split(";")]
            language = parts[0]
            quality = 1.0

            for parameter in parts[1:]:
                name, separator, value = parameter.partition("=")
                if separator and name.lower() == "q":
                    try:
                        quality = float(value)
                    except ValueError:
                        quality = 0.0

            if language and language != "*" and quality > 0:
                preferences.append((-quality, position, language))

        for _, _, language in sorted(preferences):
            locale = cls._match_locale(language)
            if locale is not None:
                return cls(locale)

        return cls()

    def t(
        self,
        key: str,
        *,
        fallback: str | None = None,
        **parameters: Any,
    ) -> str:
        template = self._find(self.locale, key)

        if template is None and self.locale != DEFAULT_LOCALE:
            template = self._find(DEFAULT_LOCALE, key)

        if template is None:
            if fallback is not None:
                return fallback
            raise MissingTranslationError(
                f"Translation key {key!r} was not found for locale {self.locale!r}"
            )

        return template.format(**parameters)

    @staticmethod
    def _find(locale: str, key: str) -> str | None:
        value: Any = _catalogs()[locale]

        for segment in key.split("."):
            if not isinstance(value, dict) or segment not in value:
                return None
            value = value[segment]

        return value if isinstance(value, str) else None


class I18nMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        if scope["type"] == "http":
            request = Request(scope)
            request.state.i18n = I18n.from_accept_language(
                request.headers.get("accept-language")
            )

        await self.app(scope, receive, send)


def get_i18n(request: Request) -> I18n:
    i18n = getattr(request.state, "i18n", None)
    if isinstance(i18n, I18n):
        return i18n

    return I18n.from_accept_language(request.headers.get("accept-language"))
