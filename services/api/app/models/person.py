"""Person model representing gift recipients (family members and friends)."""

from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.list import List

from app.models.base import BaseModel


class Person(BaseModel):
    """
    Person entity for tracking gift recipients.

    A person can be a family member or friend who receives gifts.
    Stores personal preferences and sizing information to help with gift ideas.

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Person's name (required, max 100 characters)
        interests: JSON array of interests/hobbies (optional)
        sizes: JSON object of clothing/shoe sizes (optional)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "persons"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,  # Index for faster lookups by name
    )

    interests: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True,
        default=None,
    )

    sizes: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
        default=None,
    )

    # Relationships
    lists: Mapped[list["List"]] = relationship(
        "List",
        back_populates="person",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        """String representation of Person."""
        return f"<Person(id={self.id}, name='{self.name}')>"
