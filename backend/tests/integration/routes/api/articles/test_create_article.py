from support.factories import article_payload
from support.json import pick


def test_create_article_returns_created_article_for_authenticated_user(
    test_client,
    auth_headers,
):
    payload = article_payload()
    response = test_client.post(
        "/api/articles",
        json=payload,
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 200
    data = response.json()
    assert pick(
        data,
        "user_uid",
        "title",
        "nature",
        "content",
    ) == {
        "user_uid": "current_user",
        "title": payload["title"],
        "nature": payload["nature"],
        "content": payload["content"],
    }
    assert "id" in data


def test_create_article_returns_unprocessable_content_for_invalid_data(
    test_client, auth_headers
):
    response = test_client.post(
        "/api/articles",
        json={"title": "", "content": "", "nature": ""},
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert len(data["detail"]) == 3
    assert data["detail"] == [
        {
            "type": "string_too_short",
            "loc": ["body", "title"],
            "msg": "Please enter at least 1 character(s)",
            "ctx": {"min_length": 1},
            "input": "",
        },
        {
            "type": "string_too_short",
            "loc": ["body", "content"],
            "msg": "Please enter at least 1 character(s)",
            "ctx": {"min_length": 1},
            "input": "",
        },
        {
            "type": "enum",
            "loc": ["body", "nature"],
            "msg": "Please choose one of: 'scientific', 'standard' or 'journal'",
            "ctx": {"expected": "'scientific', 'standard' or 'journal'"},
            "input": "",
        },
    ]


def test_create_article_returns_unprocessable_content_when_no_params_were_used(
    test_client, auth_headers
):
    response = test_client.post(
        "/api/articles",
        json={},
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert len(data["detail"]) == 2
    assert data["detail"] == [
        {
            "type": "missing",
            "loc": ["body", "title"],
            "msg": "This field is mandatory",
            "input": {},
        },
        {
            "type": "missing",
            "loc": ["body", "content"],
            "msg": "This field is mandatory",
            "input": {},
        },
    ]


def test_create_article_translates_validation_errors_from_accept_language(
    test_client, auth_headers
):
    headers = auth_headers(user_uid="current_user") | {"Accept-Language": "ja-JP"}

    response = test_client.post(
        "/api/articles",
        json={"title": "", "content": ""},
        headers=headers,
    )

    assert response.status_code == 422
    assert [error["msg"] for error in response.json()["detail"]] == [
        "1文字以上で入力してください",
        "1文字以上で入力してください",
    ]


def test_create_article_falls_back_to_english_for_an_unknown_locale(
    test_client, auth_headers
):
    headers = auth_headers(user_uid="current_user") | {"Accept-Language": "pt-BR"}

    response = test_client.post(
        "/api/articles",
        json={},
        headers=headers,
    )

    assert response.status_code == 422
    assert [error["msg"] for error in response.json()["detail"]] == [
        "This field is mandatory",
        "This field is mandatory",
    ]


def test_create_article_returns_unprocessable_content_for_business_logic_validations(
    test_client, auth_headers, article_factory
):
    existing_record = article_factory(user_uid="current_user", title="Existing title")

    response = test_client.post(
        "/api/articles",
        json={"title": existing_record.title, "content": "Some content"},
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert len(data["detail"]) == 1
    assert data["detail"] == [
        {
            "type": "unique",
            "loc": ["body", "title"],
            "msg": "Title must be unique for the user",
            "input": existing_record.title,
        },
    ]


def test_create_article_requires_authentication(test_client):
    response = test_client.post("/api/articles", json={})

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
