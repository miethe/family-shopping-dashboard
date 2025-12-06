"""Comment Pydantic schemas with visibility and compatibility aliases."""

from pydantic import ConfigDict, Field, model_validator

from app.models.comment import CommentParentType, CommentVisibility
from app.schemas.base import BaseSchema, TimestampSchema


class CommentCreate(BaseSchema):
    """Schema for creating a comment."""

    model_config = ConfigDict(populate_by_name=True)

    content: str | None = None
    text: str | None = Field(default=None, alias="text")
    parent_type: CommentParentType = Field(alias="entity_type")
    parent_id: int = Field(alias="entity_id")
    visibility: CommentVisibility = CommentVisibility.public

    @model_validator(mode="after")
    def normalize_content(self) -> "CommentCreate":
        """Ensure content/text is present and normalized."""
        chosen = (self.content or self.text or "").strip()
        if not chosen:
            raise ValueError("content must not be empty")
        self.content = chosen
        self.text = chosen
        return self


class CommentUpdate(BaseSchema):
    """Schema for updating a comment."""

    model_config = ConfigDict(populate_by_name=True)

    content: str | None = None
    text: str | None = Field(default=None, alias="text")
    visibility: CommentVisibility | None = None

    @model_validator(mode="after")
    def normalize_content(self) -> "CommentUpdate":
        """Normalize optional content/text if provided."""
        if self.content is None and self.text is None and self.visibility is None:
            raise ValueError("At least one field (content/text/visibility) is required")

        chosen = (self.content or self.text or "").strip()
        if chosen:
            self.content = chosen
            self.text = chosen
        return self


class CommentResponse(TimestampSchema):
    """Schema for comment response with compatibility aliases."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    content: str
    text: str
    visibility: CommentVisibility

    parent_type: CommentParentType
    parent_id: int
    entity_type: CommentParentType
    entity_id: int

    author_id: int
    user_id: int
    author_name: str
    user_name: str
    author_label: str
    can_edit: bool
