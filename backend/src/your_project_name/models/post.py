from datetime import UTC, datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Text


class PostNatureEnum(str, Enum):
    SCIENTIFIC = "scientific"
    STANDARD = "standard"
    JOURNAL = "journal"


def utc_now() -> datetime:
    return datetime.now(UTC)


class PostInputBase(SQLModel):
    title: str = Field(min_length=1, max_length=255, nullable=False)
    content: str = Field(
        sa_type=Text,
        nullable=False,
        min_length=1,
        max_length=255,
    )
    nature: PostNatureEnum = Field(
        min_length=1,
        max_length=255,
        nullable=False,
    )


class PostBase(PostInputBase):
    user_uid: str = Field(min_length=1, max_length=255, nullable=False)


class Post(PostBase, table=True):
    __tablename__ = "posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)


class PostPublic(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime
