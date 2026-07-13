import base64

from your_project_name.settings import settings


def test_rejects_oversized_request_body_before_route_handling(
    test_client,
    auth_headers,
    monkeypatch,
):
    monkeypatch.setattr(settings, "request_body_max_bytes", 8)

    response = test_client.post(
        "/api/articles",
        content=b'{"title":"too large"}',
        headers=auth_headers(user_uid="current_user")
        | {"Content-Type": "application/json"},
    )

    assert response.status_code == 413
    assert response.json() == {"detail": "Request body too large."}


def test_rate_limits_api_requests(test_client, monkeypatch):
    monkeypatch.setattr(settings, "rate_limit_requests", 2)
    monkeypatch.setattr(settings, "rate_limit_window_seconds", 60)

    assert test_client.get("/api/health").status_code == 200
    assert test_client.get("/api/health").status_code == 200

    response = test_client.get("/api/health")

    assert response.status_code == 429
    assert response.json() == {"detail": "Rate limit exceeded."}
    assert response.headers["Retry-After"] == "60"


def test_basic_auth_only_protects_static_routes(test_client, monkeypatch):
    monkeypatch.setattr(settings, "basic_auth_username", "admin")
    monkeypatch.setattr(settings, "basic_auth_password", "secret")

    static_response = test_client.get("/")
    api_response = test_client.get("/api/health")

    assert static_response.status_code == 401
    assert static_response.headers["WWW-Authenticate"] == "Basic"
    assert api_response.status_code == 200


def test_basic_auth_allows_static_routes_with_valid_credentials(
    test_client,
    monkeypatch,
):
    monkeypatch.setattr(settings, "basic_auth_username", "admin")
    monkeypatch.setattr(settings, "basic_auth_password", "secret")
    token = base64.b64encode(b"admin:secret").decode("ascii")

    response = test_client.get("/", headers={"Authorization": f"Basic {token}"})

    assert response.status_code == 200
