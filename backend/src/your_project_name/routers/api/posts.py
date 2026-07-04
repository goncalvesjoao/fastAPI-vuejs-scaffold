from fastapi import APIRouter, Query, Response, status

from your_project_name.dependencies import GetAuthContext, GetSession
from your_project_name.exceptions import (
    NotFoundError,
    UnauthorizedError,
    UnprocessableContentError,
)
from your_project_name.models import PaginatedRecords, PostNatureEnum, PostPublic
from your_project_name.services.posts import (
    CreatePostInputDto,
    UpdatePostInputDto,
    create,
    delete_by_or_fail,
    find_all_by,
    find_by_or_fail,
    update,
)

router = APIRouter(
    prefix="/posts",
    responses=UnauthorizedError.RESPONSE,
)


@router.get(
    path="",
    responses=UnprocessableContentError.RESPONSE,
)
def get_posts(
    auth_context: GetAuthContext,
    session: GetSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nature: PostNatureEnum | None = None,
) -> PaginatedRecords[PostPublic]:
    return find_all_by(
        session,
        user_uid=auth_context.user_uid,
        page=page,
        page_size=page_size,
        nature=nature,
    )


@router.post(
    path="",
    responses=UnprocessableContentError.RESPONSE,
)
def create_post(
    input: CreatePostInputDto,
    auth_context: GetAuthContext,
    session: GetSession,
) -> PostPublic:
    return create(session, user_uid=auth_context.user_uid, input=input)


@router.get(
    path="/{id}",
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def get_post(
    id: int,
    auth_context: GetAuthContext,
    session: GetSession,
) -> PostPublic:
    return find_by_or_fail(session, user_uid=auth_context.user_uid, id=id)


@router.patch(
    path="/{id}",
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def update_post(
    id: int,
    input: UpdatePostInputDto,
    auth_context: GetAuthContext,
    session: GetSession,
) -> PostPublic:
    return update(session, user_uid=auth_context.user_uid, id=id, input=input)


@router.delete(
    path="/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def delete_post(
    id: int,
    auth_context: GetAuthContext,
    session: GetSession,
) -> Response:
    delete_by_or_fail(session, user_uid=auth_context.user_uid, id=id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
