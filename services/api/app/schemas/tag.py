"""Tag Pydantic schemas."""

from app.schemas.base import BaseSchema, TimestampSchema


class TagCreate(BaseSchema):
    """Schema for creating a tag."""

    name: str
    description: str | None = None


class TagUpdate(BaseSchema):
    """Schema for updating a tag."""

    name: str | None = None
    description: str | None = None


class TagResponse(TimestampSchema):
    """Schema for tag response."""

    id: int
    name: str
    description: str | None = None
