import pytest

from your_project_name.exceptions import UnauthorizedError
from your_project_name.services.auth import auth_context
from your_project_name.settings import settings


def test_auth_context_uses_bearer_value_as_user_uid_when_auth_is_disabled(
    monkeypatch,
):
    monkeypatch.setattr(settings, "no_auth", True)

    context = auth_context("Bearer fake-user-uid")

    assert context.user_uid == "fake-user-uid"


@pytest.mark.parametrize("authorization", ["", "Basic fake-user-uid", "Bearer "])
def test_auth_context_still_requires_a_non_empty_bearer_value_without_auth(
    monkeypatch,
    authorization,
):
    monkeypatch.setattr(settings, "no_auth", True)

    with pytest.raises(UnauthorizedError, match="User not logged in"):
        auth_context(authorization)
