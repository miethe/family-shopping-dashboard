"""Group model and person-group association for organizing people into groups."""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.person import Person


class Group(BaseModel):
    """
    Group entity for organizing persons into logical collections.

    Groups allow organizing family members and friends into categories like
    "Immediate Family", "Extended Family", "Friends", "Kids", etc.

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Unique group name (required)
        description: Optional text describing the group's purpose
        color: Optional hex color code for UI display (e.g., "#FF5733")
        members: List of Person objects in this group (many-to-many)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)

    Examples:
        - Group(name="Immediate Family", color="#4CAF50")
        - Group(name="Kids", description="Children in the family", color="#2196F3")
        - Group(name="Extended Family", color="#FF9800")
    """

    __tablename__ = "groups"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,  # Group names must be unique
        index=True,  # Index for fast lookups
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    color: Mapped[Optional[str]] = mapped_column(
        String(7),  # Hex color format: "#RRGGBB"
        nullable=True,
    )

    # Many-to-many relationship to Person through person_groups
    members: Mapped[list["Person"]] = relationship(
        "Person",
        secondary="person_groups",
        back_populates="groups",
        lazy="select",
    )

    def __repr__(self) -> str:
        """String representation of Group."""
        return f"<Group(id={self.id}, name='{self.name}')>"


class PersonGroup(BaseModel):
    """
    Association entity linking persons to groups.

    This junction table enables many-to-many relationships between persons and groups,
    allowing persons to belong to multiple groups and groups to contain multiple persons.

    Attributes:
        id: Primary key (inherited from BaseModel)
        person_id: Foreign key to persons table
        group_id: Foreign key to groups table
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "person_groups"

    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )

    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships to parent entities
    person: Mapped["Person"] = relationship(
        "Person",
        foreign_keys=[person_id],
        lazy="select",
    )

    group: Mapped["Group"] = relationship(
        "Group",
        foreign_keys=[group_id],
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("person_id", "group_id", name="uq_person_group"),
    )

    def __repr__(self) -> str:
        """String representation of PersonGroup."""
        return f"<PersonGroup(id={self.id}, person_id={self.person_id}, group_id={self.group_id})>"
