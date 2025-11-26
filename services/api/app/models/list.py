"""List model for gift lists (wishlists, ideas, assigned lists)."""

from enum import Enum

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ListType(str, Enum):
    """Type of gift list."""

    wishlist = "wishlist"  # Person's own wishlist
    ideas = "ideas"  # Ideas for someone else
    assigned = "assigned"  # Gifts assigned to purchase


class ListVisibility(str, Enum):
    """Visibility level for gift list."""

    private = "private"  # Only owner can see
    family = "family"  # Family members can see
    public = "public"  # Everyone can see


class List(BaseModel):
    """
    Gift list model.

    A list represents a collection of gift items organized by:
    - Type (wishlist, ideas, assigned)
    - Visibility (private, family, public)
    - Owner (user who created the list)
    - Person (who the list is for) - optional
    - Occasion (event context) - optional

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: List name (required)
        type: List type enum (wishlist/ideas/assigned)
        visibility: Visibility level (private/family/public)
        user_id: Foreign key to User (list owner)
        person_id: Foreign key to Person (who the list is for) - nullable
        occasion_id: Foreign key to Occasion (event context) - nullable
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "lists"

    # Core fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[ListType] = mapped_column(nullable=False)
    visibility: Mapped[ListVisibility] = mapped_column(nullable=False)

    # Foreign keys
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    person_id: Mapped[int | None] = mapped_column(
        ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
    )
    occasion_id: Mapped[int | None] = mapped_column(
        ForeignKey("occasions.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships (using string references to avoid circular imports)
    user: Mapped["User"] = relationship(
        "User",
        back_populates="lists",
        lazy="select",
    )
    person: Mapped["Person | None"] = relationship(
        "Person",
        back_populates="lists",
        lazy="select",
    )
    occasion: Mapped["Occasion | None"] = relationship(
        "Occasion",
        back_populates="lists",
        lazy="select",
    )
    gifts: Mapped[list["Gift"]] = relationship(
        "Gift",
        back_populates="list",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Table arguments for indexes
    __table_args__ = (
        Index("ix_lists_user_id", "user_id"),
        Index("ix_lists_person_id", "person_id"),
        Index("ix_lists_occasion_id", "occasion_id"),
        Index("ix_lists_type", "type"),
        Index("ix_lists_visibility", "visibility"),
        # Composite index for common queries
        Index("ix_lists_user_type", "user_id", "type"),
    )

    def __repr__(self) -> str:
        """String representation of List."""
        return f"<List(id={self.id}, name='{self.name}', type={self.type.value})>"
