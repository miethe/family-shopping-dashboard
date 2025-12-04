"""Activity log model for tracking user actions."""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.user import User

from app.models.base import BaseModel


class ActivityLog(BaseModel):
    """
    Activity log for tracking user actions across the application.

    Captures all significant user actions for displaying in the Recent Activity feed.
    Uses denormalized entity_name for display efficiency (avoids joins when showing feed).

    Attributes:
        id: Primary key (inherited from BaseModel)
        action: Type of action performed (e.g., "GIFT_ADDED", "STATUS_CHANGED")
        actor_id: Foreign key to User who performed the action
        entity_type: Type of entity affected (e.g., "list_item", "list", "person")
        entity_id: ID of the affected entity
        entity_name: Denormalized name of the entity for display
        extra_data: Additional context as JSON (e.g., old/new status, occasion details)
        created_at: Timestamp of action (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "activity_logs"

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="Type of action performed",
    )

    actor_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User who performed the action",
    )

    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="Type of entity affected",
    )

    entity_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="ID of the affected entity",
    )

    entity_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Denormalized entity name for display",
    )

    extra_data: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="Additional context (old/new values, etc.)",
    )

    # Relationships
    actor: Mapped["User"] = relationship(
        "User",
        back_populates="activity_logs",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_activity_logs_created_at", "created_at"),
        Index("ix_activity_logs_actor_entity", "actor_id", "entity_type"),
        {
            "comment": "Activity log for tracking user actions and displaying recent activity feed"
        },
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<ActivityLog(id={self.id}, action={self.action}, actor_id={self.actor_id}, entity={self.entity_type}:{self.entity_id})>"
