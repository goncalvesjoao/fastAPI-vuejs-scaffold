from math import ceil
from typing import Generic, Self, TypeVar

from pydantic import BaseModel

Record = TypeVar("Record")


class PaginatedRecords(BaseModel, Generic[Record]):
    page: int
    page_size: int
    total_count: int
    total_pages: int
    records: list[Record]

    @classmethod
    def create(
        cls,
        *,
        records: list[Record],
        page: int,
        page_size: int,
        total_count: int,
    ) -> Self:
        total_pages = ceil(total_count / page_size) if page_size > 0 else 0

        return cls(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=total_pages,
            records=records,
        )
