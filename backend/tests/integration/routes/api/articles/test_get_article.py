from support.json import pick


def test_get_article_returns_article_for_authenticated_user(
    test_client,
    auth_headers,
    article_factory,
):
    record = article_factory(user_uid="current_user")

    response = test_client.get(
        f"/api/articles/{record.id}",
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 200
    data = response.json()
    assert pick(data, "id", "user_uid", "title", "content", "nature") == {
        "id": record.id,
        "user_uid": "current_user",
        "title": record.title,
        "content": record.content,
        "nature": record.nature,
    }


def test_get_article_is_scoped_to_authenticated_user(
    test_client,
    auth_headers,
    article_factory,
):
    record = article_factory("other_user")

    response = test_client.get(
        f"/api/articles/{record.id}",
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": f"Article not found with parameters: id={record.id!r}",
    }


def test_get_article_requires_authentication(test_client):
    response = test_client.get("/api/articles/1")

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
