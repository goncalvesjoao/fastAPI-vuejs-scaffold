from support.json import pick


def test_update_post_updates_post_for_authenticated_user(
    test_client,
    auth_headers,
    post_factory,
):
    record = post_factory(user_uid="current_user")

    response = test_client.patch(
        f"/api/posts/{record.id}",
        json={
            "title": "New title",
        },
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 200
    data = response.json()

    assert pick(data, "title", "content", "nature") == {
        "title": "New title",
        "content": record.content,
        "nature": record.nature.value,
    }


def test_update_post_returns_unprocessable_content_for_type_check_validations(
    test_client, auth_headers, post_factory
):
    record = post_factory(user_uid="current_user")

    response = test_client.patch(
        f"/api/posts/{record.id}",
        json={"title": "", "nature": "unknown", "content": ""},
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
            "input": "unknown",
        },
    ]


def test_update_post_updates_post_when_no_params_were_used(
    test_client,
    auth_headers,
    post_factory,
):
    record = post_factory(user_uid="current_user")

    response = test_client.patch(
        f"/api/posts/{record.id}",
        json={},
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 200


def test_update_post_is_scoped_to_authenticated_user(
    test_client,
    auth_headers,
    post_factory,
):
    record = post_factory(user_uid="another_user")

    response = test_client.patch(
        f"/api/posts/{record.id}",
        json={"title": "Not allowed"},
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": f"Post not found with parameters: id={record.id}"
    }


def test_update_post_requires_authentication(test_client):
    response = test_client.patch("/api/posts/1", json={"title": "Updated"})

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
