"""WebSocket connection manager for real-time updates."""

from typing import Dict, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    """
    Manages WebSocket connections with topic-based subscriptions.

    Supports pub/sub pattern where clients subscribe to topics like:
    - "list:123" - Updates for a specific list
    - "occasion:456" - Updates for a specific occasion
    - "list-items:all" - All list item updates

    Example:
        manager = ConnectionManager()
        await manager.connect(websocket, "list:123")
        await manager.broadcast_to_topic("list:123", event)
        manager.disconnect(websocket, "list:123")
    """

    def __init__(self):
        # topic -> set of websocket connections
        self.connections: Dict[str, Set[WebSocket]] = {}
        # websocket -> set of topics (for cleanup on disconnect)
        self.subscriptions: Dict[WebSocket, Set[str]] = {}

    async def connect(self, websocket: WebSocket, topic: str) -> None:
        """Accept connection and subscribe to topic."""
        await websocket.accept()
        self.subscribe(websocket, topic)

    def subscribe(self, websocket: WebSocket, topic: str) -> None:
        """Subscribe a websocket to a topic."""
        if topic not in self.connections:
            self.connections[topic] = set()
        self.connections[topic].add(websocket)

        if websocket not in self.subscriptions:
            self.subscriptions[websocket] = set()
        self.subscriptions[websocket].add(topic)

    def unsubscribe(self, websocket: WebSocket, topic: str) -> None:
        """Unsubscribe a websocket from a topic."""
        if topic in self.connections:
            self.connections[topic].discard(websocket)
            if not self.connections[topic]:
                del self.connections[topic]

        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(topic)

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove websocket from all topics."""
        if websocket in self.subscriptions:
            topics = list(self.subscriptions[websocket])
            for topic in topics:
                self.unsubscribe(websocket, topic)
            del self.subscriptions[websocket]

    async def broadcast_to_topic(self, topic: str, message: dict) -> None:
        """Broadcast message to all connections subscribed to topic."""
        if topic not in self.connections:
            return

        dead_connections = []
        for websocket in self.connections[topic]:
            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.append(websocket)

        # Clean up dead connections
        for websocket in dead_connections:
            self.disconnect(websocket)

    async def broadcast_event(self, event) -> None:
        """Broadcast a WSEvent to its topic."""
        # event has a topic attribute
        await self.broadcast_to_topic(event.topic, event.model_dump())


# Singleton instance
manager = ConnectionManager()
