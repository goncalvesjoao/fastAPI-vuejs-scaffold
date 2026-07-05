from sqlalchemy import func
from sqlmodel import Session, col, select

from your_project_name.models import PaginatedRecords, Post, PostNatureEnum


def find_all_by(
    session: Session,
    user_uid: str,
    page: int = 1,
    page_size: int = 10,
    nature: PostNatureEnum | None = None,
) -> PaginatedRecords[Post]:
    offset = (page - 1) * page_size

    statement = select(Post).where(Post.user_uid == user_uid)
    total_count_statement = (
        select(func.count()).select_from(Post).where(Post.user_uid == user_uid)
    )

    if nature is not None:
        statement = statement.where(Post.nature == nature)
        total_count_statement = total_count_statement.where(Post.nature == nature)

    statement = (
        statement.order_by(col(Post.updated_at).desc(), col(Post.id).desc())
        .offset(offset)
        .limit(page_size)
    )

    records = list(session.exec(statement).all())
    total_count = int(session.exec(total_count_statement).one())

    return PaginatedRecords[Post].create(
        records=records,
        page=page,
        page_size=page_size,
        total_count=total_count,
    )


def find_by(session: Session, user_uid: str, **kwargs) -> Post | None:
    statement = select(Post).filter_by(user_uid=user_uid, **kwargs)

    return session.exec(statement).first()


def create(
    session: Session,
    user_uid: str,
    title: str,
    content: str,
    nature: PostNatureEnum,
) -> Post:
    record = Post(
        user_uid=user_uid,
        title=title,
        content=content,
        nature=nature,
    )

    return save(session, record)


def delete(session: Session, record: Post) -> None:
    session.delete(record)
    session.flush()


def save(session: Session, record: Post) -> Post:
    session.add(record)
    session.flush()

    return record
