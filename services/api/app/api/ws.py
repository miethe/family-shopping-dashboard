"""WebSocket endpoint for real-time updates with JWT authentication."""

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
import json

from app.services.auth import AuthService
from app.services.ws_manager import manager
from app.schemas.ws import WSClientMessage

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT token for authentication"),
) -> None:
    """
    WebSocket endpoint for real-time updates with topic-based subscriptions.

    This endpoint provides real-time event streaming to clients using WebSocket
    connections. Clients authenticate with a JWT token via query parameter and
    subscribe to topics for entity updates (lists, gifts, occasions, etc.).

    Authentication:
        JWT token is passed as query parameter: /ws?token=xxx
        The token is validated on connection; invalid tokens are rejected.

    Client Protocol:
        1. Connect with JWT token in query string
        2. Send subscription messages in JSON format:
           - {"action": "subscribe", "topic": "list:123"}
           - {"action": "unsubscribe", "topic": "list:123"}
           - {"action": "ping"}
        3. Receive server events in JSON format:
           - {"topic": "list:123", "event": "ADDED", "data": {...}}
           - {"action": "subscribed", "topic": "list:123"}
           - {"action": "unsubscribed", "topic": "list:123"}
           - {"action": "pong"}

    Supported Topics:
        - list:{id} - Updates for a specific shopping list
        - occasion:{id} - Updates for a specific occasion
        - list-items:all - Notifications for all list item changes
        - gifts:all - Notifications for all gift changes

    Example Client Code (JavaScript):
        ```javascript
        const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

        ws.onopen = () => {
            // Subscribe to a list
            ws.send(JSON.stringify({action: "subscribe", topic: "list:123"}));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.event === "ADDED") {
                // Handle new item
            }
        };

        // Send keepalive ping every 30 seconds
        setInterval(() => {
            ws.send(JSON.stringify({action: "ping"}));
        }, 30000);
        ```

    Args:
        websocket: FastAPI WebSocket connection object
        token: JWT token for authentication (query parameter)

    Raises:
        WebSocketDisconnect: When client disconnects
        Any exceptions during message handling are caught and reported to client

    Connection Lifecycle:
        1. Validate JWT token
        2. If invalid: close with 4001 (Unauthorized)
        3. If valid: accept connection
        4. Process client messages until disconnect
        5. Clean up all subscriptions on disconnect
    """
    # Validate JWT token and extract user ID
    auth = AuthService()
    user_id = auth.decode_token(token)

    if user_id is None:
        # Invalid or expired token - close connection with 4001 code (Unauthorized)
        await websocket.close(code=4001, reason="Unauthorized")
        return

    # Accept the WebSocket connection
    # Note: Connection is accepted without initial topic subscription
    # Clients must send "subscribe" message to subscribe to topics
    await websocket.accept()

    try:
        while True:
            # Wait for and receive text message from client
            data = await websocket.receive_text()

            # Parse JSON message
            try:
                message = WSClientMessage.model_validate_json(data)
            except ValueError as e:
                # Invalid JSON or validation error - send error response
                await websocket.send_json(
                    {
                        "error": "Invalid message format",
                        "details": str(e),
                    }
                )
                continue

            # Handle subscription request
            if message.action == "subscribe":
                if not message.topic:
                    await websocket.send_json(
                        {
                            "error": "Topic is required for subscribe action",
                        }
                    )
                    continue

                manager.subscribe(websocket, message.topic)
                await websocket.send_json(
                    {
                        "action": "subscribed",
                        "topic": message.topic,
                    }
                )

            # Handle unsubscription request
            elif message.action == "unsubscribe":
                if not message.topic:
                    await websocket.send_json(
                        {
                            "error": "Topic is required for unsubscribe action",
                        }
                    )
                    continue

                manager.unsubscribe(websocket, message.topic)
                await websocket.send_json(
                    {
                        "action": "unsubscribed",
                        "topic": message.topic,
                    }
                )

            # Handle keepalive ping
            elif message.action == "ping":
                await websocket.send_json(
                    {
                        "action": "pong",
                    }
                )

    except WebSocketDisconnect:
        # Client disconnected - clean up all subscriptions
        manager.disconnect(websocket)
    except Exception as e:
        # Unexpected error - attempt to notify client and clean up
        try:
            await websocket.send_json(
                {
                    "error": "Internal server error",
                }
            )
        except Exception:
            # Connection already closed or unable to send
            pass
        finally:
            manager.disconnect(websocket)
