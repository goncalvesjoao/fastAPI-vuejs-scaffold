from support.json import pick

from your_project_name.models import PostNatureEnum
from your_project_name.services import posts as post_service
from your_project_name.services.posts import UpdatePostInputDto


def test_get_posts_returns_filtered_results_and_is_scoped_to_authenticated_user(
    test_client,
    auth_headers,
    post_factory,
):
    expected_record = post_factory(
        user_uid="current_user",
        nature=PostNatureEnum.SCIENTIFIC,
        content="Scientific post content",
    )
    post_factory(
        user_uid="current_user",
        nature=PostNatureEnum.JOURNAL,
        content="Journal post content",
    )
    post_factory(
        user_uid="other_user",
        nature=PostNatureEnum.SCIENTIFIC,
        content="Scientific post content for other user",
    )

    response = test_client.get(
        "/api/posts",
        params={
            "page": "1",
            "page_size": "25",
            "nature": PostNatureEnum.SCIENTIFIC.value,
        },
        headers=auth_headers(user_uid="current_user"),
    )

    assert response.status_code == 200
    data = response.json()
    assert pick(data, "page", "page_size", "total_count", "total_pages") == {
        "page": 1,
        "page_size": 25,
        "total_count": 1,
        "total_pages": 1,
    }
    assert len(data["records"]) == 1
    record_data = data["records"][0]
    assert pick(
        record_data,
        "id",
        "user_uid",
        "title",
        "nature",
        "content",
    ) == {
        "id": expected_record.id,
        "user_uid": "current_user",
        "title": expected_record.title,
        "nature": expected_record.nature.value,
        "content": expected_record.content,
    }


def test_get_posts_sorts_by_most_recently_updated(
    test_session,
    test_client,
    auth_headers,
    post_factory,
):
    older_record = post_factory(
        user_uid="current_user",
        nature=PostNatureEnum.JOURNAL,
        content="Journal post older content",
    )
    newer_record = post_factory(
        user_uid="current_user",
        nature=PostNatureEnum.JOURNAL,
        content="Journal post newer content",
    )

    post_service.update(
        session=test_session,
        user_uid="current_user",
        id=older_record.id,
        input=UpdatePostInputDto(title="Updated Older Post Title"),
    )

    response = test_client.get(
        "/api/posts", headers=auth_headers(user_uid="current_user")
    )

    assert response.status_code == 200
    data = response.json()
    assert [post["id"] for post in data["records"]] == [
        older_record.id,
        newer_record.id,
    ]


def test_get_posts_requires_authentication(test_client):
    response = test_client.get("/api/posts")

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
