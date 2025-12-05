"""Group DTOs for organizing persons into groups."""

from pydantic import BaseModel, Field

from app.schemas.base import TimestampSchema


class GroupBase(BaseModel):
    """Base schema for group fields."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique group name",
        examples=["Immediate Family", "Kids", "Extended Family"],
    )
    description: str | None = Field(
        None,
        description="Optional description of the group's purpose",
        examples=["Children in the family", "Close relatives"],
    )
    color: str | None = Field(
        None,
        pattern=r"^#[0-9A-Fa-f]{6}$",
        description="Hex color code for UI display",
        examples=["#FF5733", "#4CAF50", "#2196F3"],
    )


class GroupCreate(GroupBase):
    """DTO for creating a new group."""

    pass


class GroupUpdate(BaseModel):
    """DTO for updating a group (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class GroupResponse(GroupBase, TimestampSchema):
    """DTO for group response."""

    id: int
    member_count: int = Field(
        default=0,
        description="Number of persons in this group",
    )


class GroupMinimal(BaseModel):
    """Lightweight group summary for nested responses."""

    id: int
    name: str
    color: str | None = None
