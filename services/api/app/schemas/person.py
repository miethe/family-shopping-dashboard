"""Person DTOs for gift recipients."""

from typing import Any

from pydantic import BaseModel, Field

from app.schemas.base import TimestampSchema


class PersonCreate(BaseModel):
    """DTO for creating a new person."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Person's name",
        examples=["Mom", "Dad", "Sarah"],
    )
    interests: list[str] | None = Field(
        None,
        description="List of interests/hobbies",
        examples=[["Reading", "Hiking", "Photography"]],
    )
    sizes: dict[str, Any] | None = Field(
        None,
        description="Clothing/shoe sizes",
        examples=[{"shirt": "M", "pants": "32x30", "shoe": "10"}],
    )


class PersonUpdate(BaseModel):
    """DTO for updating a person (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=100)
    interests: list[str] | None = None
    sizes: dict[str, Any] | None = None


class PersonResponse(TimestampSchema):
    """DTO for person response."""

    id: int
    name: str
    interests: list[str] | None
    sizes: dict[str, Any] | None


class PersonSummary(BaseModel):
    """Lightweight person summary for lists."""

    id: int
    name: str
