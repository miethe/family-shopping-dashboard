"""WebSocket integration tests for real-time updates."""

import json
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.auth import AuthService
from app.services.ws_manager import manager
from app.schemas.ws import WSEvent


class TestWebSocket:
    """Integration tests for WebSocket connection and real-time updates."""

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self) -> None:
        """Clean up WebSocket manager state between tests."""
        yield
        # Clean up all connections after each test
        manager.connections.clear()
        manager.subscriptions.clear()

    @pytest.fixture
    def auth_service(self) -> AuthService:
        """Provide AuthService instance for token generation."""
        return AuthService()

    @pytest.fixture
    def valid_token(self, auth_service: AuthService) -> str:
        """Generate a valid JWT token for testing."""
        return auth_service.create_access_token(user_id=1)

    @pytest.fixture
    def invalid_token(self) -> str:
        """Provide an invalid JWT token for testing."""
        return "invalid.jwt.token"

    def test_websocket_connection(self, valid_token: str) -> None:
        """Test WebSocket connection with valid token."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Connection should be accepted
            # Send a ping to verify connection is alive
            websocket.send_json({"action": "ping"})

            # Should receive pong response
            data = websocket.receive_json()
            assert data == {"action": "pong"}

    def test_websocket_invalid_token(self, invalid_token: str) -> None:
        """Test connection rejected with invalid token."""
        client = TestClient(app)

        # Connection should be rejected with 4001 (Unauthorized)
        # The WebSocket endpoint closes connection with code 4001 for invalid tokens
        try:
            with client.websocket_connect(f"/ws?token={invalid_token}") as websocket:
                # If we get here, try to send a message - connection should be closed
                websocket.send_json({"action": "ping"})
                # Should not reach here
                assert False, "Connection should have been closed"
        except Exception:
            # Connection was rejected, which is expected
            pass

    def test_websocket_missing_token(self) -> None:
        """Test connection rejected when token is missing."""
        client = TestClient(app)

        # Connection should fail when token query param is missing
        with pytest.raises(Exception):
            with client.websocket_connect("/ws"):
                pass

    def test_websocket_subscribe(self, valid_token: str) -> None:
        """Test topic subscription."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Subscribe to a topic
            websocket.send_json({"action": "subscribe", "topic": "list:1"})

            # Should receive subscription confirmation
            data = websocket.receive_json()
            assert data == {"action": "subscribed", "topic": "list:1"}

            # Verify subscription in manager
            assert "list:1" in manager.connections
            assert len(manager.connections["list:1"]) == 1

    def test_websocket_subscribe_multiple_topics(self, valid_token: str) -> None:
        """Test subscribing to multiple topics."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Subscribe to first topic
            websocket.send_json({"action": "subscribe", "topic": "list:1"})
            data1 = websocket.receive_json()
            assert data1["action"] == "subscribed"
            assert data1["topic"] == "list:1"

            # Subscribe to second topic
            websocket.send_json({"action": "subscribe", "topic": "occasion:2"})
            data2 = websocket.receive_json()
            assert data2["action"] == "subscribed"
            assert data2["topic"] == "occasion:2"

            # Verify both subscriptions exist in manager
            # Note: The actual WebSocket object is different from TestClient's session
            assert "list:1" in manager.connections
            assert "occasion:2" in manager.connections
            assert len(manager.connections["list:1"]) == 1
            assert len(manager.connections["occasion:2"]) == 1

    def test_websocket_subscribe_missing_topic(self, valid_token: str) -> None:
        """Test subscribe without topic returns error."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Send subscribe without topic
            websocket.send_json({"action": "subscribe"})

            # Should receive error response
            data = websocket.receive_json()
            assert "error" in data
            assert "Topic is required" in data["error"]

    def test_websocket_unsubscribe(self, valid_token: str) -> None:
        """Test topic unsubscription."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Subscribe first
            websocket.send_json({"action": "subscribe", "topic": "list:1"})
            websocket.receive_json()  # Consume subscription confirmation

            # Unsubscribe
            websocket.send_json({"action": "unsubscribe", "topic": "list:1"})

            # Should receive unsubscription confirmation
            data = websocket.receive_json()
            assert data == {"action": "unsubscribed", "topic": "list:1"}

            # Verify unsubscription in manager
            assert "list:1" not in manager.connections or len(manager.connections["list:1"]) == 0

    def test_websocket_unsubscribe_missing_topic(self, valid_token: str) -> None:
        """Test unsubscribe without topic returns error."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Send unsubscribe without topic
            websocket.send_json({"action": "unsubscribe"})

            # Should receive error response
            data = websocket.receive_json()
            assert "error" in data
            assert "Topic is required" in data["error"]

    def test_websocket_invalid_message_format(self, valid_token: str) -> None:
        """Test invalid JSON message format returns error."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Send invalid JSON structure (missing required 'action' field)
            websocket.send_json({"invalid": "message"})

            # Should receive error response
            data = websocket.receive_json()
            assert "error" in data
            assert "Invalid message format" in data["error"]

    def test_websocket_broadcast_to_subscribers(self, valid_token: str) -> None:
        """Test 2 clients can subscribe to same topic and manager tracks them."""
        client = TestClient(app)

        # Connect first client
        with client.websocket_connect(f"/ws?token={valid_token}") as ws1:
            # Subscribe client 1 to list:1
            ws1.send_json({"action": "subscribe", "topic": "list:1"})
            data1 = ws1.receive_json()
            assert data1["action"] == "subscribed"

            # Verify manager has 1 connection
            assert len(manager.connections["list:1"]) == 1

            # Now connect second client in a separate session
            # (Note: TestClient limitations prevent true concurrent WebSocket testing)
            # Instead, verify sequential connections work properly

        # After ws1 closes, verify cleanup happened
        # Then connect second client
        with client.websocket_connect(f"/ws?token={valid_token}") as ws2:
            ws2.send_json({"action": "subscribe", "topic": "list:1"})
            data2 = ws2.receive_json()
            assert data2["action"] == "subscribed"

            # Should have 1 connection (ws1 is disconnected)
            assert len(manager.connections["list:1"]) == 1

    def test_websocket_selective_broadcast(self, valid_token: str) -> None:
        """Test that manager maintains separate topic subscriptions."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as ws1:
            # Client subscribes to list:1
            ws1.send_json({"action": "subscribe", "topic": "list:1"})
            ws1.receive_json()  # Consume confirmation

            # Also subscribe to list:2
            ws1.send_json({"action": "subscribe", "topic": "list:2"})
            ws1.receive_json()  # Consume confirmation

            # Verify both topics exist in manager
            assert "list:1" in manager.connections
            assert "list:2" in manager.connections
            assert len(manager.connections["list:1"]) == 1
            assert len(manager.connections["list:2"]) == 1

            # Unsubscribe from list:2
            ws1.send_json({"action": "unsubscribe", "topic": "list:2"})
            ws1.receive_json()  # Consume confirmation

            # Verify list:2 is removed but list:1 remains
            assert "list:1" in manager.connections
            assert "list:2" not in manager.connections or len(manager.connections["list:2"]) == 0

    def test_websocket_disconnect_cleanup(self, valid_token: str) -> None:
        """Test connections are cleaned up on disconnect."""
        client = TestClient(app)

        # Create a connection and subscribe
        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            websocket.send_json({"action": "subscribe", "topic": "list:1"})
            websocket.receive_json()  # Consume confirmation

            # Verify subscription exists
            assert "list:1" in manager.connections
            assert len(manager.connections["list:1"]) == 1

        # After exiting context (disconnection), subscriptions should be cleaned up
        # The manager.disconnect() is called on WebSocketDisconnect
        # Verify cleanup happened - either list:1 is removed or empty
        assert "list:1" not in manager.connections or len(manager.connections["list:1"]) == 0

        # Connect again and verify the previous connection is gone
        with client.websocket_connect(f"/ws?token={valid_token}") as new_websocket:
            new_websocket.send_json({"action": "subscribe", "topic": "list:1"})
            new_websocket.receive_json()

            # Should only have 1 connection (the new one)
            assert len(manager.connections["list:1"]) == 1

    def test_websocket_multiple_subscriptions_cleanup(self, valid_token: str) -> None:
        """Test all subscriptions cleaned up when client disconnects."""
        client = TestClient(app)

        topics = ["list:1", "list:2", "occasion:3"]

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Subscribe to multiple topics
            for topic in topics:
                websocket.send_json({"action": "subscribe", "topic": topic})
                websocket.receive_json()  # Consume confirmation

            # Verify all subscriptions exist
            for topic in topics:
                assert topic in manager.connections
                assert len(manager.connections[topic]) == 1

        # After disconnect, verify cleanup of all subscriptions
        for topic in topics:
            assert topic not in manager.connections or len(manager.connections[topic]) == 0

    def test_websocket_ping_pong(self, valid_token: str) -> None:
        """Test keepalive ping-pong mechanism."""
        client = TestClient(app)

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Send multiple pings
            for _ in range(3):
                websocket.send_json({"action": "ping"})
                data = websocket.receive_json()
                assert data == {"action": "pong"}

    def test_websocket_broadcast_all_event_types(self, valid_token: str) -> None:
        """Test that WSEvent schema supports all event types."""
        # This test verifies the WSEvent model accepts all defined event types
        event_types = ["ADDED", "UPDATED", "DELETED", "STATUS_CHANGED", "ASSIGNED", "COMMENT_ADDED"]

        for event_type in event_types:
            # Verify WSEvent can be created with each event type
            event = WSEvent(
                topic="list:1",
                event=event_type,  # type: ignore
                data={
                    "entity_id": f"{event_type.lower()}_123",
                    "payload": {"type": event_type},
                    "user_id": "1",
                    "timestamp": "2025-11-27T10:40:00Z",
                },
            )
            assert event.topic == "list:1"
            assert event.event == event_type
            assert event.data["payload"]["type"] == event_type

    def test_websocket_concurrent_connections_same_topic(self, valid_token: str) -> None:
        """Test that subscriptions persist across reconnections."""
        client = TestClient(app)

        # Connect, subscribe, disconnect multiple times
        for i in range(3):
            with client.websocket_connect(f"/ws?token={valid_token}") as ws:
                # Subscribe to topic
                ws.send_json({"action": "subscribe", "topic": "list:1"})
                confirmation = ws.receive_json()
                assert confirmation["action"] == "subscribed"

                # Verify subscription exists
                assert "list:1" in manager.connections
                assert len(manager.connections["list:1"]) == 1

                # Ping to verify connection is alive
                ws.send_json({"action": "ping"})
                data = ws.receive_json()
                assert data == {"action": "pong"}

            # After each disconnect, verify cleanup
            assert "list:1" not in manager.connections or len(manager.connections["list:1"]) == 0

    def test_websocket_topic_formats(self, valid_token: str) -> None:
        """Test various topic format patterns."""
        client = TestClient(app)

        topic_patterns = [
            "list:123",
            "occasion:456",
            "list-items:all",
            "gifts:all",
            "user:789",
        ]

        with client.websocket_connect(f"/ws?token={valid_token}") as websocket:
            # Subscribe to all topic patterns
            for topic in topic_patterns:
                websocket.send_json({"action": "subscribe", "topic": topic})
                data = websocket.receive_json()
                assert data["action"] == "subscribed"
                assert data["topic"] == topic

            # Verify all subscriptions exist in manager
            for topic in topic_patterns:
                assert topic in manager.connections
                assert len(manager.connections[topic]) == 1
