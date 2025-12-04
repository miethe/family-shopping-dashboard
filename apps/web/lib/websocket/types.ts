/**
 * WebSocket Types
 *
 * Type definitions for WebSocket events and messages
 * aligned with backend WebSocket implementation.
 */

/**
 * WebSocket event types
 */
export type WSEventType =
  | 'ADDED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED';

/**
 * WebSocket event message structure
 */
export interface WSEvent<T = unknown> {
  topic: string;
  event: WSEventType;
  data: {
    entity_id: string;
    payload: T;
    user_id: string;
    timestamp: string;
  };
  trace_id?: string;
}

/**
 * WebSocket connection state
 */
export type WSConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

/**
 * WebSocket subscription
 */
export interface WSSubscription {
  topic: string;
  handler: (event: WSEvent) => void;
}

/**
 * WebSocket connection options
 */
export interface WSOptions {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectMaxInterval?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

/**
 * WebSocket message types
 */
export interface WSSubscribeMessage {
  action: 'subscribe';
  topic: string;
}

export interface WSUnsubscribeMessage {
  action: 'unsubscribe';
  topic: string;
}

export interface WSPingMessage {
  action: 'ping';
}

export type WSOutgoingMessage =
  | WSSubscribeMessage
  | WSUnsubscribeMessage
  | WSPingMessage;
