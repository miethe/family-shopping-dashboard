"""Person DTOs for gift recipients."""

from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.base import TimestampSchema
from app.schemas.group import GroupMinimal


class PersonCreate(BaseModel):
    """DTO for creating a new person."""

    display_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Person's display name",
        examples=["Mom", "Dad", "Sarah"],
    )
    relationship: str | None = Field(
        None,
        max_length=100,
        description="Relationship to user",
        examples=["Mom", "Sister", "Friend", "Colleague"],
    )
    birthdate: date | None = Field(
        None,
        description="Person's birthdate",
        examples=["1985-03-15"],
    )
    anniversary: date | None = Field(
        None,
        description="Person's anniversary date",
        examples=["2010-06-20"],
    )
    notes: str | None = Field(
        None,
        description="Additional notes about the person",
        examples=["Loves mystery novels and gardening"],
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
    constraints: str | None = Field(
        None,
        description="Gift constraints or restrictions",
        examples=["Allergic to nuts", "Prefers sustainable products only"],
    )
    photo_url: str | None = Field(
        None,
        max_length=500,
        description="URL to person's photo",
        examples=["https://example.com/photos/person.jpg"],
    )
    group_ids: list[int] = Field(
        default_factory=list,
        description="List of group IDs to link this person to",
        examples=[[1, 2], []],
    )


class PersonUpdate(BaseModel):
    """DTO for updating a person (all fields optional)."""

    display_name: str | None = Field(None, min_length=1, max_length=100)
    relationship: str | None = Field(None, max_length=100)
    birthdate: date | None = None
    anniversary: date | None = None
    notes: str | None = None
    interests: list[str] | None = None
    sizes: dict[str, Any] | None = None
    constraints: str | None = None
    photo_url: str | None = Field(None, max_length=500)
    group_ids: list[int] | None = Field(
        None,
        description="List of group IDs to link this person to (None means don't change)",
    )


class PersonResponse(TimestampSchema):
    """DTO for person response."""

    id: int
    display_name: str
    relationship: str | None
    birthdate: date | None
    anniversary: date | None
    notes: str | None
    interests: list[str] | None
    sizes: dict[str, Any] | None
    constraints: str | None
    photo_url: str | None
    groups: list[GroupMinimal] = Field(
        default_factory=list,
        description="Groups this person belongs to",
    )
    occasion_ids: list[int] = Field(
        default_factory=list,
        description="IDs of occasions linked to this person",
    )


class PersonSummary(BaseModel):
    """Lightweight person summary for lists."""

    id: int
    display_name: str
