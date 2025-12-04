"""User model for authentication and profile management."""

from typing import TYPE_CHECKING

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.activity import ActivityLog
    from app.models.comment import Comment
    from app.models.list import List
    from app.models.list_item import ListItem

from app.models.base import BaseModel


class User(BaseModel):
    """
    User entity for the Family Gifting Dashboard.

    Single-tenant application (2-3 family members), so no multi-tenancy complexity.

    Attributes:
        id: Primary key (inherited from BaseModel)
        email: Unique email address for login
        password_hash: Bcrypt hashed password
        created_at: Timestamp of account creation (inherited)
        updated_at: Timestamp of last update (inherited)
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(320),  # RFC 5321 max email length
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),  # Bcrypt hash length
        nullable=False,
    )

    # Relationships
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="author",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    lists: Mapped[list["List"]] = relationship(
        "List",
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    assigned_items: Mapped[list["ListItem"]] = relationship(
        "ListItem",
        back_populates="assignee",
        lazy="selectin",
    )

    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="actor",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
        {"comment": "Family members with authentication credentials"},
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<User(id={self.id}, email={self.email})>"
