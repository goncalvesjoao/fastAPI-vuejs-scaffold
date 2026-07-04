from pydantic import BaseModel, Field


class HTTPErrorResponse(BaseModel):
    detail: str = Field(examples=["error message"])
