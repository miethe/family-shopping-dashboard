"""Person model representing gift recipients (family members and friends)."""

from datetime import date
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship as sa_relationship

if TYPE_CHECKING:
    from app.models.gift import Gift
    from app.models.group import Group
    from app.models.list import List
    from app.models.occasion import Occasion

from app.models.base import BaseModel


class Person(BaseModel):
    """
    Person entity for tracking gift recipients.

    A person can be a family member or friend who receives gifts.
    Stores personal preferences and sizing information to help with gift ideas.

    Attributes:
        id: Primary key (inherited from BaseModel)
        display_name: Person's display name (required, max 100 characters)
        relationship: Relationship to user (optional, e.g., "Mom", "Sister", "Friend")
        birthdate: Person's birthdate (optional)
        anniversary: Person's anniversary date (optional)
        notes: Additional notes about the person (optional)
        interests: JSON array of interests/hobbies (optional)
        sizes: JSON object of clothing/shoe sizes (optional)
        constraints: Gift constraints (optional, e.g., "allergic to nuts")
        photo_url: URL to person's photo (optional)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "persons"

    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,  # Index for faster lookups by name
    )

    relationship: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        default=None,
    )

    birthdate: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        default=None,
    )

    anniversary: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        default=None,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None,
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

    constraints: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None,
    )

    photo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        default=None,
    )

    # Relationships
    lists: Mapped[list["List"]] = sa_relationship(
        "List",
        back_populates="person",
        lazy="selectin",
    )

    occasions: Mapped[list["Occasion"]] = sa_relationship(
        "Occasion",
        secondary="person_occasions",
        back_populates="persons",
        lazy="selectin",
    )

    # Many-to-many relationship to Gift (gifts associated with this person)
    gifts: Mapped[list["Gift"]] = sa_relationship(
        "Gift",
        secondary="gift_people",
        back_populates="people",
        lazy="select",
    )

    # Many-to-many relationship to Group (groups this person belongs to)
    groups: Mapped[list["Group"]] = sa_relationship(
        "Group",
        secondary="person_groups",
        back_populates="members",
        lazy="select",
    )

    def __repr__(self) -> str:
        """String representation of Person."""
        return f"<Person(id={self.id}, display_name='{self.display_name}')>"


class PersonOccasion(BaseModel):
    """
    Association table linking persons to occasions.

    This many-to-many relationship allows tracking which persons are associated
    with which occasions (e.g., a person's birthday linked to a birthday occasion).

    Attributes:
        id: Primary key (inherited from BaseModel)
        person_id: Foreign key to persons table
        occasion_id: Foreign key to occasions table
        created_at: Timestamp of creation (inherited from BaseModel)
    """

    __tablename__ = "person_occasions"

    person_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )

    occasion_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("occasions.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("person_id", "occasion_id", name="uq_person_occasion"),
    )

    def __repr__(self) -> str:
        """String representation of PersonOccasion."""
        return f"<PersonOccasion(person_id={self.person_id}, occasion_id={self.occasion_id})>"
