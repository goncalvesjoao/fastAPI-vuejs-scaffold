from pathlib import Path

from sqlmodel import Session, SQLModel
from your_project_name.db import engine
from your_project_name.models import ArticleNatureEnum
from your_project_name.services.articles import CreateArticleInputDto, create


def seed() -> None:
    database_path = Path(engine.url.database or "")
    if database_path.exists():
        database_path.unlink()

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        for title, nature, content in (
            (
                "Scientific Article1",
                ArticleNatureEnum.SCIENTIFIC,
                "This is a scientific article",
            ),
            (
                "Journal Article1",
                ArticleNatureEnum.JOURNAL,
                "This is a journal article",
            ),
        ):
            create(
                session,
                user_uid="current_user",
                input=CreateArticleInputDto(
                    title=title, nature=nature, content=content
                ),
            )


if __name__ == "__main__":
    seed()
