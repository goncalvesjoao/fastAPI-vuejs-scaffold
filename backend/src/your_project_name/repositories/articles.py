from sqlalchemy import func
from sqlmodel import Session, col, select

from your_project_name.models import PaginatedRecords, Article, ArticleNatureEnum


def find_all_by(
    session: Session,
    user_uid: str,
    page: int = 1,
    page_size: int = 10,
    nature: ArticleNatureEnum | None = None,
) -> PaginatedRecords[Article]:
    offset = (page - 1) * page_size

    statement = select(Article).where(Article.user_uid == user_uid)
    total_count_statement = (
        select(func.count()).select_from(Article).where(Article.user_uid == user_uid)
    )

    if nature is not None:
        statement = statement.where(Article.nature == nature)
        total_count_statement = total_count_statement.where(Article.nature == nature)

    statement = (
        statement.order_by(col(Article.updated_at).desc(), col(Article.id).desc())
        .offset(offset)
        .limit(page_size)
    )

    records = list(session.exec(statement).all())
    total_count = int(session.exec(total_count_statement).one())

    return PaginatedRecords[Article].create(
        records=records,
        page=page,
        page_size=page_size,
        total_count=total_count,
    )


def find_by(session: Session, user_uid: str, **kwargs) -> Article | None:
    statement = select(Article).filter_by(user_uid=user_uid, **kwargs)

    return session.exec(statement).first()


def create(
    session: Session,
    user_uid: str,
    title: str,
    content: str,
    nature: ArticleNatureEnum,
) -> Article:
    record = Article(
        user_uid=user_uid,
        title=title,
        content=content,
        nature=nature,
    )

    return save(session, record)


def delete(session: Session, record: Article) -> None:
    session.delete(record)
    session.flush()


def save(session: Session, record: Article) -> Article:
    session.add(record)
    session.flush()

    return record
