import itertools

import pytest
from sqlmodel import Session

from your_project_name.models import PostNatureEnum, PostPublic
from your_project_name.repositories import posts as post_repository
from your_project_name.services import posts
from your_project_name.services.posts import CreatePostInputDto

_title_counter = itertools.count(1)


def post_payload(
    *,
    title: str = "New Post",
    nature: PostNatureEnum = PostNatureEnum.STANDARD,
    content: str = "Hello World",
) -> dict:
    return {
        "title": title,
        "nature": nature.value if isinstance(nature, PostNatureEnum) else nature,
        "content": content,
    }


def create_post(
    session: Session,
    user_uid: str,
    *,
    title: str | None = None,
    nature: PostNatureEnum = PostNatureEnum.STANDARD,
    content: str = "Hello World!",
) -> PostPublic:
    if title is None:
        title = f"New Post {next(_title_counter)}"

    record = posts.create(
        session,
        user_uid=user_uid,
        input=CreatePostInputDto(
            title=title,
            content=content,
            nature=nature,
        ),
    )

    post = post_repository.find_by(session, user_uid=user_uid, id=record.id)
    assert post is not None

    post_repository.save(session, post)
    session.commit()
    return PostPublic.model_validate(post)


@pytest.fixture()
def post_factory(test_session):
    def _create_post(
        user_uid: str,
        *,
        title: str | None = None,
        nature: PostNatureEnum = PostNatureEnum.JOURNAL,
        content: str = "Hello again, World!",
    ) -> PostPublic:
        return create_post(
            test_session,
            user_uid,
            title=title,
            nature=nature,
            content=content,
        )

    return _create_post
