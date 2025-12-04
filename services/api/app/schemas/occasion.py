"""Occasion DTOs for gifting events."""

import datetime

from pydantic import BaseModel, Field

from app.models.occasion import OccasionType
from app.schemas.base import TimestampSchema


class OccasionCreate(BaseModel):
    """DTO for creating a new occasion."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Occasion name",
        examples=["Christmas 2024", "Mom's Birthday", "Anniversary"],
    )
    type: OccasionType = Field(
        ...,
        description="Type of occasion",
    )
    date: datetime.date = Field(
        ...,
        description="Date when the occasion occurs",
    )
    description: str | None = Field(
        None,
        description="Optional description of the occasion",
    )


class OccasionUpdate(BaseModel):
    """DTO for updating an occasion (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    type: OccasionType | None = None
    date: datetime.date | None = None
    description: str | None = None


class OccasionResponse(TimestampSchema):
    """DTO for occasion response."""

    id: int
    name: str
    type: OccasionType
    date: datetime.date
    description: str | None


class OccasionSummary(BaseModel):
    """Lightweight occasion summary with list count."""

    id: int
    name: str
    type: OccasionType
    date: datetime.date
    list_count: int = Field(
        ...,
        description="Number of lists associated with this occasion",
    )
