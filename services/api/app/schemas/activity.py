"""Activity schemas for recent activity feed."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class ActivityEventType(str, Enum):
    """Types of activity events tracked in the system."""

    GIFT_ADDED = "gift_added"
    GIFT_PURCHASED = "gift_purchased"
    GIFT_RECEIVED = "gift_received"
    STATUS_CHANGED = "status_changed"
    LIST_CREATED = "list_created"
    PERSON_ADDED = "person_added"
    OCCASION_CREATED = "occasion_created"
    ASSIGNMENT_CHANGED = "assignment_changed"


class ActivityActor(BaseModel):
    """Actor who performed an action."""

    id: int
    email: str


class ActivityEvent(BaseSchema):
    """
    Single activity event for the activity feed.

    Represents a user action with all information needed for display,
    including actor details, entity information, and computed descriptions.
    """

    id: int
    action: str
    actor: ActivityActor
    entity_type: str
    entity_id: int
    entity_name: str
    extra_data: dict | None = None
    created_at: datetime

    @property
    def description(self) -> str:
        """
        Generate human-readable description of the activity.

        Returns:
            Formatted description string suitable for display in activity feed.

        Example:
            "Sarah added LEGO Star Wars to Christmas 2025 list"
            "Mom marked Harry Potter Book as purchased"
        """
        actor_name = self.actor.email.split("@")[0].capitalize()

        if self.action == ActivityEventType.GIFT_ADDED.value:
            return f"{actor_name} added {self.entity_name}"
        elif self.action == ActivityEventType.GIFT_PURCHASED.value:
            return f"{actor_name} marked {self.entity_name} as purchased"
        elif self.action == ActivityEventType.GIFT_RECEIVED.value:
            return f"{actor_name} marked {self.entity_name} as received"
        elif self.action == ActivityEventType.STATUS_CHANGED.value:
            old_status = self.extra_data.get("old_status", "unknown") if self.extra_data else "unknown"
            new_status = self.extra_data.get("new_status", "unknown") if self.extra_data else "unknown"
            return f"{actor_name} changed {self.entity_name} from {old_status} to {new_status}"
        elif self.action == ActivityEventType.LIST_CREATED.value:
            return f"{actor_name} created list {self.entity_name}"
        elif self.action == ActivityEventType.PERSON_ADDED.value:
            return f"{actor_name} added {self.entity_name} to gift recipients"
        elif self.action == ActivityEventType.OCCASION_CREATED.value:
            return f"{actor_name} created occasion {self.entity_name}"
        elif self.action == ActivityEventType.ASSIGNMENT_CHANGED.value:
            assignee_name = self.extra_data.get("assignee_name", "someone") if self.extra_data else "someone"
            return f"{actor_name} assigned {self.entity_name} to {assignee_name}"
        else:
            return f"{actor_name} performed {self.action} on {self.entity_name}"


class ActivityFeedResponse(BaseSchema):
    """
    Response containing recent activity events.

    Returns a list of activity events ordered by timestamp (most recent first)
    with pagination support.
    """

    events: list[ActivityEvent] = Field(default_factory=list)
    total: int = Field(default=0, description="Total number of events in the feed")


class CreateActivityLog(BaseModel):
    """Schema for creating a new activity log entry."""

    action: str
    actor_id: int
    entity_type: str
    entity_id: int
    entity_name: str
    extra_data: dict | None = None
