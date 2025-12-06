"""Comment model with polymorphic parent relationship."""

from enum import Enum

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class CommentVisibility(str, Enum):
    """Visibility scope for comments."""

    public = "public"
    private = "private"


class CommentParentType(str, Enum):
    """Types of entities that can have comments."""

    list_item = "list_item"  # Comment on a specific gift in a list
    list = "list"  # Comment on the list itself
    occasion = "occasion"  # Comment on an occasion
    person = "person"  # Comment on a person's profile
    gift = "gift"  # Comment on a gift


class Comment(BaseModel):
    """
    Comment entity with polymorphic parent relationship.

    Comments can be attached to multiple entity types (list_item, list, occasion, person).
    Uses a simple polymorphic pattern with parent_type enum and parent_id integer.

    Attributes:
        id: Primary key (inherited from BaseModel)
        content: Comment text content
        author_id: Foreign key to User (who wrote the comment)
        parent_type: Type of entity this comment is attached to
        parent_id: ID of the parent entity (not a foreign key for flexibility)
        created_at: Timestamp of creation (inherited)
        updated_at: Timestamp of last update (inherited)
    """

    __tablename__ = "comments"

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    author_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_type: Mapped[CommentParentType] = mapped_column(
        String(50),
        nullable=False,
    )

    parent_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    visibility: Mapped[CommentVisibility] = mapped_column(
        SAEnum(CommentVisibility),
        nullable=False,
        default=CommentVisibility.public,
        server_default=CommentVisibility.public.value,
    )

    # Relationships
    author: Mapped["User"] = relationship(
        "User",
        back_populates="comments",
        lazy="joined",
    )

    __table_args__ = (
        # Composite index for efficient queries by parent
        Index(
            "idx_comments_parent_type_parent_id_visibility",
            "parent_type",
            "parent_id",
            "visibility",
        ),
        # Index on author_id for user's comments
        Index("idx_comments_author_id", "author_id"),
        {"comment": "Comments on various entities (polymorphic parent relationship)"},
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<Comment(id={self.id}, author_id={self.author_id}, "
            f"parent_type={self.parent_type}, parent_id={self.parent_id})>"
        )
