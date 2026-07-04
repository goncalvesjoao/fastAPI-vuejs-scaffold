def test_delete_post_removes_post_for_authenticated_user(
    test_client,
    auth_headers,
    post_factory,
):
    record = post_factory(user_uid="current_user")

    response = test_client.delete(
        f"/api/posts/{record.id}",
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 204
    assert response.content == b""

    response = test_client.get(
        f"/api/posts/{record.id}",
        headers=auth_headers(user_uid="current_user"),
    )
    assert response.status_code == 404


def test_delete_post_is_scoped_to_authenticated_user(
    test_client,
    auth_headers,
    post_factory,
):
    record = post_factory("other_user")

    response = test_client.delete(
        f"/api/posts/{record.id}",
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": f"Post not found with parameters: id={record.id!r}",
    }


def test_delete_post_requires_authentication(test_client):
    response = test_client.delete("/api/posts/1")

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
