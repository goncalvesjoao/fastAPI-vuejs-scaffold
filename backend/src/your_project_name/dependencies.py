import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlmodel import Session

from your_project_name.db import get_session
from your_project_name.services.auth import AuthContext, auth_context
from your_project_name.settings import settings


def get_auth_context(request: Request) -> AuthContext:
    return auth_context(request.headers.get("Authorization", ""))


def enforce_basic_auth(credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    assert (
        settings.basic_auth_username is not None
        and settings.basic_auth_password is not None
    ), "Basic auth credentials must be set in settings"

    # Use secrets.compare_digest to prevent timing attacks
    is_user = secrets.compare_digest(credentials.username, settings.basic_auth_username)
    is_pass = secrets.compare_digest(credentials.password, settings.basic_auth_password)

    if not (is_user and is_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized access",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


GetAuthContext = Annotated[AuthContext, Depends(get_auth_context)]
GetSession = Annotated[Session, Depends(get_session)]
