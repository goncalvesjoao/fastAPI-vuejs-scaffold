from support.json import pick

from your_project_name.models import ArticleNatureEnum
from your_project_name.services import articles as article_service
from your_project_name.services.articles import UpdateArticleInputDto


def test_get_articles_returns_filtered_results_and_is_scoped_to_authenticated_user(
    test_client,
    auth_headers,
    article_factory,
):
    expected_record = article_factory(
        user_uid="current_user",
        nature=ArticleNatureEnum.SCIENTIFIC,
        content="Scientific article content",
    )
    article_factory(
        user_uid="current_user",
        nature=ArticleNatureEnum.JOURNAL,
        content="Journal article content",
    )
    article_factory(
        user_uid="other_user",
        nature=ArticleNatureEnum.SCIENTIFIC,
        content="Scientific article content for other user",
    )

    response = test_client.get(
        "/api/articles",
        params={
            "page": "1",
            "page_size": "25",
            "nature": ArticleNatureEnum.SCIENTIFIC.value,
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


def test_get_articles_sorts_by_most_recently_updated(
    test_session,
    test_client,
    auth_headers,
    article_factory,
):
    older_record = article_factory(
        user_uid="current_user",
        nature=ArticleNatureEnum.JOURNAL,
        content="Journal article older content",
    )
    newer_record = article_factory(
        user_uid="current_user",
        nature=ArticleNatureEnum.JOURNAL,
        content="Journal article newer content",
    )

    article_service.update(
        session=test_session,
        user_uid="current_user",
        id=older_record.id,
        input=UpdateArticleInputDto(title="Updated Older Article Title"),
    )

    response = test_client.get(
        "/api/articles", headers=auth_headers(user_uid="current_user")
    )

    assert response.status_code == 200
    data = response.json()
    assert [record["id"] for record in data["records"]] == [
        older_record.id,
        newer_record.id,
    ]


def test_get_articles_requires_authentication(test_client):
    response = test_client.get("/api/articles")

    assert response.status_code == 401
    assert response.json() == {"detail": "User not logged in"}
