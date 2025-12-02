/**
 * useWebSocket Hook
 *
 * Custom React hook for managing WebSocket connections with:
 * - Auto-reconnection with exponential backoff
 * - Topic-based subscriptions
 * - JWT authentication
 * - Connection state management
 * - Heartbeat/ping support
 *
 * Usage:
 * ```tsx
 * const { state, subscribe, unsubscribe } = useWebSocket();
 *
 * useEffect(() => {
 *   const unsubscribe = subscribe('gift-list:123', (event) => {
 *     console.log('Received:', event);
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type {
  WSEvent,
  WSConnectionState,
  WSSubscription,
  WSOptions,
  WSOutgoingMessage,
} from '@/lib/websocket/types';

const DEFAULT_OPTIONS: Required<WSOptions> = {
  // Fallback uses external port (8030) for Docker dev environment
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8030/ws',
  reconnect: true,
  reconnectInterval: 5000, // Start at 5s
  reconnectMaxInterval: 20000, // Max 20s
  heartbeatInterval: 30000, // 30s
  debug: process.env.NODE_ENV === 'development',
};

export interface UseWebSocketReturn {
  state: WSConnectionState;
  subscribe: (topic: string, handler: (event: WSEvent) => void) => () => void;
  unsubscribe: (topic: string) => void;
  send: (message: WSOutgoingMessage) => void;
  disconnect: () => void;
  connect: () => void;
}

export function useWebSocket(options: WSOptions = {}): UseWebSocketReturn {
  const { token, isAuthenticated } = useAuth();
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<WSConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<(event: WSEvent) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  const log = useCallback(
    (...args: any[]) => {
      if (config.debug) {
        console.log('[WebSocket]', ...args);
      }
    },
    [config.debug]
  );

  /**
   * Send message to WebSocket server
   */
  const send = useCallback((message: WSOutgoingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      log('Sent:', message);
    } else {
      log('Cannot send message, WebSocket not open:', message);
    }
  }, [log]);

  /**
   * Start heartbeat/ping
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      send({ action: 'ping' });
    }, config.heartbeatInterval);

    log('Heartbeat started');
  }, [send, config.heartbeatInterval, log]);

  /**
   * Stop heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      log('Heartbeat stopped');
    }
  }, [log]);

  /**
   * Calculate reconnect delay with exponential backoff
   */
  const getReconnectDelay = useCallback((): number => {
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(
      config.reconnectInterval * Math.pow(2, attempt),
      config.reconnectMaxInterval
    );
    return delay;
  }, [config.reconnectInterval, config.reconnectMaxInterval]);

  /**
   * Handle WebSocket connection
   */
  const connect = useCallback(() => {
    // Don't connect if manually disconnected or not authenticated
    if (isManualDisconnectRef.current || !isAuthenticated || !token) {
      log('Skipping connect: manual disconnect or not authenticated');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setState('connecting');
      log('Connecting to:', config.url);

      // Create WebSocket connection with JWT token
      const ws = new WebSocket(`${config.url}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        log('Connected');
        setState('connected');
        reconnectAttemptRef.current = 0;

        // Resubscribe to all topics
        subscriptionsRef.current.forEach((_, topic) => {
          send({ action: 'subscribe', topic });
        });

        // Start heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSEvent = JSON.parse(event.data);
          log('Received:', message);

          // Dispatch to topic handlers
          const handlers = subscriptionsRef.current.get(message.topic);
          if (handlers) {
            handlers.forEach((handler) => handler(message));
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setState('error');
      };

      ws.onclose = (event) => {
        log('Closed:', event.code, event.reason);
        stopHeartbeat();

        // Don't reconnect if manually disconnected
        if (isManualDisconnectRef.current) {
          setState('disconnected');
          return;
        }

        // Attempt reconnection with backoff
        if (config.reconnect) {
          setState('reconnecting');
          const delay = getReconnectDelay();
          log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current += 1;
            connect();
          }, delay);
        } else {
          setState('disconnected');
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connection failed:', err);
      setState('error');
    }
  }, [
    isAuthenticated,
    token,
    config.url,
    config.reconnect,
    send,
    startHeartbeat,
    stopHeartbeat,
    getReconnectDelay,
    log,
  ]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    log('Manual disconnect');
    isManualDisconnectRef.current = true;

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Stop heartbeat
    stopHeartbeat();

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState('disconnected');
  }, [stopHeartbeat, log]);

  /**
   * Subscribe to a topic
   */
  const subscribe = useCallback(
    (topic: string, handler: (event: WSEvent) => void): (() => void) => {
      log('Subscribe to:', topic);

      // Add handler to subscriptions
      if (!subscriptionsRef.current.has(topic)) {
        subscriptionsRef.current.set(topic, new Set());
      }
      subscriptionsRef.current.get(topic)!.add(handler);

      // Send subscribe message if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ action: 'subscribe', topic });
      }

      // Return unsubscribe function
      return () => {
        log('Unsubscribe from:', topic);
        const handlers = subscriptionsRef.current.get(topic);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            subscriptionsRef.current.delete(topic);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              send({ action: 'unsubscribe', topic });
            }
          }
        }
      };
    },
    [send, log]
  );

  /**
   * Unsubscribe from a topic
   */
  const unsubscribe = useCallback(
    (topic: string) => {
      log('Unsubscribe all from:', topic);
      subscriptionsRef.current.delete(topic);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ action: 'unsubscribe', topic });
      }
    },
    [send, log]
  );

  /**
   * Auto-connect when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      isManualDisconnectRef.current = false;
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  return {
    state,
    subscribe,
    unsubscribe,
    send,
    disconnect,
    connect,
  };
}
