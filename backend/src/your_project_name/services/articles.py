from datetime import UTC, datetime

from sqlmodel import Field, Session, Text

from your_project_name.exceptions import RecordNotFoundError
from your_project_name.models import PaginatedRecords, ArticleNatureEnum, ArticlePublic
from your_project_name.models.article import ArticleInputBase
from your_project_name.repositories import (
    articles as article_repository,
)
from your_project_name.validators import BaseValidator


def find_all_by(
    session: Session,
    user_uid: str,
    page: int = 1,
    page_size: int = 10,
    nature: ArticleNatureEnum | None = None,
) -> PaginatedRecords[ArticlePublic]:
    results = article_repository.find_all_by(
        session,
        user_uid=user_uid,
        page=page,
        page_size=page_size,
        nature=nature,
    )

    return PaginatedRecords[ArticlePublic].create(
        records=[ArticlePublic.model_validate(article) for article in results.records],
        page=results.page,
        page_size=results.page_size,
        total_count=results.total_count,
    )


def find_by(session: Session, user_uid: str, **kwargs) -> ArticlePublic | None:
    record = article_repository.find_by(session, user_uid, **kwargs)

    if record is None:
        return None

    return ArticlePublic.model_validate(record)


def find_by_or_fail(session: Session, user_uid: str, **kwargs) -> ArticlePublic:
    record = find_by(session, user_uid, **kwargs)

    if record is None:
        raise RecordNotFoundError("Article", **kwargs)

    return record


class CreateArticleInputDto(ArticleInputBase):
    nature: ArticleNatureEnum | None = Field(default=None, max_length=255)


def create(
    session: Session,
    user_uid: str,
    input: CreateArticleInputDto,
) -> ArticlePublic:
    validator = BaseValidator()

    if article_repository.find_by(session, user_uid, title=input.title) is not None:
        validator.add(
            "unique",
            ["body", "title"],
            "Title must be unique for the user",
            input.title,
        )

    validator.raise_if_invalid()

    record = article_repository.create(
        session,
        user_uid=user_uid,
        title=input.title,
        content=input.content,
        nature=input.nature or ArticleNatureEnum.STANDARD,
    )

    session.commit()
    session.refresh(record)

    return ArticlePublic.model_validate(record)


class UpdateArticleInputDto(ArticleInputBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(
        default=None, sa_type=Text, min_length=1, max_length=255
    )
    nature: ArticleNatureEnum | None = Field(default=None, max_length=255)


def update(
    session: Session,
    user_uid: str,
    id: int,
    input: UpdateArticleInputDto,
) -> ArticlePublic:
    record = article_repository.find_by(session, user_uid, id=id)

    if record is None:
        raise RecordNotFoundError("Article", id=id)

    record.title = input.title if input.title is not None else record.title
    record.content = input.content if input.content is not None else record.content
    record.nature = input.nature if input.nature is not None else record.nature
    record.updated_at = datetime.now(UTC)

    article_repository.save(session, record)
    session.commit()
    session.refresh(record)

    return ArticlePublic.model_validate(record)


def delete_by(session: Session, user_uid: str, **kwargs) -> bool:
    record = article_repository.find_by(session, user_uid, **kwargs)

    if record is None:
        return False

    article_repository.delete(session, record)
    session.commit()

    return True


def delete_by_or_fail(session: Session, user_uid, **kwargs) -> bool:
    result = delete_by(session, user_uid, **kwargs)

    if result is False:
        raise RecordNotFoundError("Article", **kwargs)

    return result
