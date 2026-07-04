from typing import Any

from pydantic import BaseModel


class ValidationError(BaseModel):
    loc: list[str | int]
    msg: str
    type: str
    input: Any
    ctx: object
