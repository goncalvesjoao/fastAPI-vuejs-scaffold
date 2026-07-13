from typing import Annotated

from fastapi import Depends, Request
from sqlmodel import Session

from your_project_name.db import get_session
from your_project_name.services.auth import AuthContext, auth_context


def get_auth_context(request: Request) -> AuthContext:
    return auth_context(request.headers.get("Authorization", ""))


GetAuthContext = Annotated[AuthContext, Depends(get_auth_context)]
GetSession = Annotated[Session, Depends(get_session)]
