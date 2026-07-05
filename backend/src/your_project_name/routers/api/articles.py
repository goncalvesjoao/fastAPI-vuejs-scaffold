from fastapi import APIRouter, Query, Response, status

from your_project_name.dependencies import GetAuthContext, GetSession
from your_project_name.exceptions import (
    NotFoundError,
    UnauthorizedError,
    UnprocessableContentError,
)
from your_project_name.models import PaginatedRecords, ArticleNatureEnum, ArticlePublic
from your_project_name.services.articles import (
    CreateArticleInputDto,
    UpdateArticleInputDto,
    create,
    delete_by_or_fail,
    find_all_by,
    find_by_or_fail,
    update,
)

router = APIRouter(
    prefix="/articles",
    responses=UnauthorizedError.RESPONSE,
)


@router.get(
    path="",
    responses=UnprocessableContentError.RESPONSE,
)
def get_articles(
    auth_context: GetAuthContext,
    session: GetSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nature: ArticleNatureEnum | None = None,
) -> PaginatedRecords[ArticlePublic]:
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
def create_article(
    input: CreateArticleInputDto,
    auth_context: GetAuthContext,
    session: GetSession,
) -> ArticlePublic:
    return create(session, user_uid=auth_context.user_uid, input=input)


@router.get(
    path="/{id}",
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def get_article(
    id: int,
    auth_context: GetAuthContext,
    session: GetSession,
) -> ArticlePublic:
    return find_by_or_fail(session, user_uid=auth_context.user_uid, id=id)


@router.patch(
    path="/{id}",
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def update_article(
    id: int,
    input: UpdateArticleInputDto,
    auth_context: GetAuthContext,
    session: GetSession,
) -> ArticlePublic:
    return update(session, user_uid=auth_context.user_uid, id=id, input=input)


@router.delete(
    path="/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=NotFoundError.RESPONSE | UnprocessableContentError.RESPONSE,
)
def delete_article(
    id: int,
    auth_context: GetAuthContext,
    session: GetSession,
) -> Response:
    delete_by_or_fail(session, user_uid=auth_context.user_uid, id=id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
