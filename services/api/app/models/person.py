"""Person model representing gift recipients (family members and friends)."""

from typing import Any

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

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
        JSONB,
        nullable=True,
        default=None,
    )

    sizes: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        default=None,
    )

    def __repr__(self) -> str:
        """String representation of Person."""
        return f"<Person(id={self.id}, name='{self.name}')>"
