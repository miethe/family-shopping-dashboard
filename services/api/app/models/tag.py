"""Tag model and gift-tag association table for organizing gifts."""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, ForeignKey, Index, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.gift import Gift


# Association table for many-to-many relationship between gifts and tags
# Using Table() with Column() for association tables (not ORM mapped classes)
gift_tags = Table(
    "gift_tags",
    Base.metadata,
    Column(
        "gift_id",
        Integer,
        ForeignKey("gifts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Tag(BaseModel):
    """
    Tag entity for categorizing and organizing gifts.

    Tags enable flexible categorization of gifts through a many-to-many relationship.
    Multiple gifts can share the same tag, and each gift can have multiple tags.

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Unique tag name (required, indexed)
        description: Optional text describing the tag's purpose
        gifts: List of associated Gift objects (many-to-many)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)

    Examples:
        - "Electronics", "Books", "Toys", "Clothing"
        - "Wishlist", "Birthday", "Holiday"
        - "Under $50", "Premium", "Budget"
    """

    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,  # Tag names must be unique
        index=True,  # Index for fast lookups
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Many-to-many relationship to Gift
    # Using string reference to avoid circular import
    gifts: Mapped[list["Gift"]] = relationship(
        "Gift",
        secondary=gift_tags,
        back_populates="tags",
        lazy="select",  # Load gifts when accessed
    )

    __table_args__ = (
        Index("ix_tags_name", "name"),  # Explicit name for unique index
    )

    def __repr__(self) -> str:
        """String representation of Tag."""
        return f"<Tag(id={self.id}, name='{self.name}')>"
