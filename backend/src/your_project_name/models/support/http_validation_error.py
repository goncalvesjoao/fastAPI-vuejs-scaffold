from pydantic import BaseModel, Field

from your_project_name.models.support.validation_error import ValidationError


class HTTPValidationError(BaseModel):
    detail: list[ValidationError] = Field(
        examples=[
            [
                {
                    "type": "missing",
                    "loc": ["body", "title"],
                    "msg": "Field required",
                    "input": {},
                },
            ]
        ]
    )
