import time

import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwk, jwt
from jose.constants import Algorithms

TEST_ISSUER = "https://test-clerk.example.com"
TEST_KID = "test-key-id"

_PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)

JWKS = {
    "keys": [
        jwk.construct(_PRIVATE_KEY.public_key(), Algorithms.RS256).to_dict()
        | {"kid": TEST_KID, "use": "sig"}
    ]
}


def jwt_token(
    sub: str,
    expiration: int | None = None,
    *,
    expired: bool = False,
) -> str:
    claims = {"sub": sub, "iss": TEST_ISSUER}

    if expired:
        claims["exp"] = int(time.time()) - 60
    elif expiration is not None:
        claims["exp"] = expiration

    return jwt.encode(
        claims,
        _PRIVATE_KEY,
        algorithm=Algorithms.RS256,
        headers={"kid": TEST_KID},
    )


@pytest.fixture()
def auth_headers():
    def _auth_headers(
        user_uid: str,
        expiration: int | None = None,
        *,
        expired: bool = False,
    ) -> dict[str, str]:
        token = jwt_token(user_uid, expiration, expired=expired)

        return {"Authorization": f"Bearer {token}"}

    return _auth_headers
