"""Occasion DTOs for gifting events."""

import datetime
from typing import Any

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
    recurrence_rule: dict[str, Any] | None = Field(
        None,
        description="Recurrence rule for recurring occasions (e.g., {'month': 12, 'day': 25})",
        examples=[{"month": 12, "day": 25}, {"month": 3, "day": 15}],
    )
    is_active: bool = Field(
        True,
        description="Whether the occasion is currently active",
    )
    subtype: str | None = Field(
        None,
        max_length=50,
        description="Subtype for recurring occasions (e.g., 'birthday', 'anniversary')",
        examples=["birthday", "anniversary", "holiday"],
    )
    person_ids: list[int] = Field(
        default_factory=list,
        description="Optional list of person IDs to link to this occasion",
        examples=[[1, 2], [5]],
    )


class OccasionUpdate(BaseModel):
    """DTO for updating an occasion (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    type: OccasionType | None = None
    date: datetime.date | None = None
    description: str | None = None
    recurrence_rule: dict[str, Any] | None = None
    is_active: bool | None = None
    subtype: str | None = Field(None, max_length=50)
    person_ids: list[int] | None = None


class OccasionResponse(TimestampSchema):
    """DTO for occasion response."""

    id: int
    name: str
    type: OccasionType
    date: datetime.date
    description: str | None
    recurrence_rule: dict[str, Any] | None = None
    is_active: bool = True
    next_occurrence: datetime.date | None = None
    subtype: str | None = None
    person_ids: list[int] = Field(
        default_factory=list,
        description="IDs of persons linked to this occasion",
    )


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
