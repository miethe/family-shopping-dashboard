"""Comment Pydantic schemas."""

from app.models.comment import CommentParentType
from app.schemas.base import BaseSchema, TimestampSchema


class CommentCreate(BaseSchema):
    """Schema for creating a comment."""

    content: str
    parent_type: CommentParentType
    parent_id: int


class CommentUpdate(BaseSchema):
    """Schema for updating a comment."""

    content: str


class CommentResponse(TimestampSchema):
    """Schema for comment response."""

    id: int
    content: str
    author_id: int
    parent_type: CommentParentType
    parent_id: int
