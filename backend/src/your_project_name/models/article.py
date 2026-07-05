from datetime import UTC, datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Text


class ArticleNatureEnum(str, Enum):
    SCIENTIFIC = "scientific"
    STANDARD = "standard"
    JOURNAL = "journal"


def utc_now() -> datetime:
    return datetime.now(UTC)


class ArticleInputBase(SQLModel):
    title: str = Field(min_length=1, max_length=255, nullable=False)
    content: str = Field(
        sa_type=Text,
        nullable=False,
        min_length=1,
        max_length=255,
    )
    nature: ArticleNatureEnum = Field(
        min_length=1,
        max_length=255,
        nullable=False,
    )


class ArticleBase(ArticleInputBase):
    user_uid: str = Field(min_length=1, max_length=255, nullable=False)


class Article(ArticleBase, table=True):
    __tablename__ = "articles"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)


class ArticlePublic(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime
