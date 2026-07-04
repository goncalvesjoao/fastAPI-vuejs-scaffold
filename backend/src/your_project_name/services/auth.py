from functools import lru_cache
from typing import Dict

import httpx
from jose import JWTError, jwt
from jose.constants import Algorithms
from jose.exceptions import ExpiredSignatureError
from pydantic import BaseModel

from your_project_name.exceptions import UnauthorizedError
from your_project_name.settings import settings


class AuthContext(BaseModel):
    user_uid: str


@lru_cache(maxsize=1)
def _fetch_jwks(issuer: str) -> dict:
    jwks_url = f"{issuer}/.well-known/jwks.json"
    response = httpx.get(jwks_url, timeout=10.0)
    response.raise_for_status()
    return response.json()


def verify_auth_token(auth_token: str) -> Dict[str, str]:
    issuer = settings.auth_issuer
    authorized_parties = settings.authorized_parties

    try:
        unverified_header = jwt.get_unverified_header(auth_token)
    except JWTError:
        raise UnauthorizedError("Invalid Authorization Token")

    signing_key_id = unverified_header.get("kid")
    if not signing_key_id:
        raise UnauthorizedError("Authorization Token without signing key ID")

    jwks = _fetch_jwks(issuer)
    signing_key = next(
        (
            json_web_key
            for json_web_key in jwks.get("keys", [])
            if json_web_key.get("kid") == signing_key_id
        ),
        None,
    )
    if signing_key is None:
        raise UnauthorizedError("Authorization Token without a signing key")

    try:
        payload = jwt.decode(
            auth_token,
            signing_key,
            algorithms=[Algorithms.RS256],
            issuer=issuer,
            options={"verify_aud": False},
        )
    except ExpiredSignatureError:
        raise UnauthorizedError("User session has expired")
    except JWTError as error:
        raise UnauthorizedError(f"Invalid Authorization Token: {error}")

    authorized_party = payload.get("azp", "")
    if (
        authorized_parties
        and authorized_party
        and authorized_party not in authorized_parties
    ):
        raise UnauthorizedError(
            "Invalid Authorization Token: Not authorized for this party"
        )

    return payload


def verify_bearer_token(bearer_token: str) -> Dict[str, str]:
    if not bearer_token.startswith("Bearer "):
        raise UnauthorizedError("User not logged in")

    auth_token = bearer_token.removeprefix("Bearer ").strip()

    return verify_auth_token(auth_token)


def auth_context(bearer_token: str) -> AuthContext:
    if settings.auth_disabled:
        if not bearer_token.startswith("Bearer "):
            raise UnauthorizedError("User not logged in")

        user_uid = bearer_token.removeprefix("Bearer ").strip()
        if not user_uid:
            raise UnauthorizedError("User not logged in")

        return AuthContext(user_uid=user_uid)

    payload = verify_bearer_token(bearer_token)
    return AuthContext(user_uid=payload["sub"])
