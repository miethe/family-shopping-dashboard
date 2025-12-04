"""WebSocket event schemas for real-time updates."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class WSEvent(BaseSchema):
    """
    WebSocket event structure for real-time updates.

    Sent from server to client when entities change. Includes topic-based routing
    and typed event payloads for proper state synchronization.

    Example:
        event = WSEvent(
            topic="list:123",
            event="STATUS_CHANGED",
            data={
                "entity_id": "456",
                "payload": {"id": 456, "status": "purchased"},
                "user_id": "789",
                "timestamp": "2025-11-26T10:30:00Z"
            }
        )

    Attributes:
        topic: Topic identifier for subscriptions (e.g., 'list:123', 'occasion:456')
        event: Event type describing the change
        data: Payload with entity_id, payload, user_id, and timestamp
    """

    topic: str = Field(
        ...,
        description="Topic identifier for subscription routing",
        examples=["list:123", "occasion:456", "list-items:all"],
    )
    event: Literal[
        "ADDED",
        "UPDATED",
        "DELETED",
        "STATUS_CHANGED",
        "ASSIGNED",
        "COMMENT_ADDED",
    ] = Field(
        ...,
        description="Event type describing the change",
    )
    data: dict[str, Any] = Field(
        ...,
        description="Event payload containing entity_id, payload, user_id, and timestamp",
        examples=[
            {
                "entity_id": "123",
                "payload": {"id": 123, "name": "Gift Name", "status": "purchased"},
                "user_id": "456",
                "timestamp": "2025-11-26T10:30:00Z",
            }
        ],
    )


class WSClientMessage(BaseSchema):
    """
    Message from client to server for subscription and connection management.

    Used for subscribing to topics, unsubscribing, and keepalive pings to maintain
    the WebSocket connection.

    Example:
        # Subscribe to a list
        msg = WSClientMessage(action="subscribe", topic="list:123")

        # Unsubscribe
        msg = WSClientMessage(action="unsubscribe", topic="list:123")

        # Keepalive ping
        msg = WSClientMessage(action="ping")

    Attributes:
        action: Client action (subscribe, unsubscribe, or ping)
        topic: Topic identifier for subscribe/unsubscribe actions (optional for ping)
    """

    action: Literal["subscribe", "unsubscribe", "ping"] = Field(
        ...,
        description="Client action",
    )
    topic: str | None = Field(
        None,
        description="Topic for subscribe/unsubscribe actions (required for subscribe/unsubscribe, ignored for ping)",
        examples=["list:123", "occasion:456", "list-items:all"],
    )
