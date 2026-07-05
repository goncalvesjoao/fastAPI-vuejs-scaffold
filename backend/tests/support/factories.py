import itertools

import pytest
from sqlmodel import Session

from your_project_name.models import ArticleNatureEnum, ArticlePublic
from your_project_name.repositories import articles as article_repository
from your_project_name.services import articles
from your_project_name.services.articles import CreateArticleInputDto

_title_counter = itertools.count(1)


def article_payload(
    *,
    title: str = "New Article",
    nature: ArticleNatureEnum = ArticleNatureEnum.STANDARD,
    content: str = "Hello World",
) -> dict:
    return {
        "title": title,
        "nature": nature.value if isinstance(nature, ArticleNatureEnum) else nature,
        "content": content,
    }


def create_article(
    session: Session,
    user_uid: str,
    *,
    title: str | None = None,
    nature: ArticleNatureEnum = ArticleNatureEnum.STANDARD,
    content: str = "Hello World!",
) -> ArticlePublic:
    if title is None:
        title = f"New Article {next(_title_counter)}"

    record = articles.create(
        session,
        user_uid=user_uid,
        input=CreateArticleInputDto(
            title=title,
            content=content,
            nature=nature,
        ),
    )

    article = article_repository.find_by(session, user_uid=user_uid, id=record.id)
    assert article is not None

    article_repository.save(session, article)
    session.commit()
    return ArticlePublic.model_validate(article)


@pytest.fixture()
def article_factory(test_session):
    def _create_article(
        user_uid: str,
        *,
        title: str | None = None,
        nature: ArticleNatureEnum = ArticleNatureEnum.JOURNAL,
        content: str = "Hello again, World!",
    ) -> ArticlePublic:
        return create_article(
            test_session,
            user_uid,
            title=title,
            nature=nature,
            content=content,
        )

    return _create_article
