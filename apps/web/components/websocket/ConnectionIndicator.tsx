/**
 * ConnectionIndicator
 *
 * Displays WebSocket connection status with visual feedback.
 * Shows connection state and provides manual reconnect option.
 *
 * Usage:
 * ```tsx
 * <ConnectionIndicator />
 * ```
 */

'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import type { WSConnectionState } from '@/lib/websocket/types';

interface ConnectionIndicatorProps {
  /**
   * Show indicator only when disconnected/error
   * Default: false (always show)
   */
  hideWhenConnected?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

const STATE_CONFIG: Record<
  WSConnectionState,
  { label: string; color: string; icon: string }
> = {
  connecting: {
    label: 'Connecting...',
    color: 'bg-yellow-500',
    icon: '⟳',
  },
  connected: {
    label: 'Connected',
    color: 'bg-green-500',
    icon: '✓',
  },
  reconnecting: {
    label: 'Reconnecting...',
    color: 'bg-yellow-500',
    icon: '⟳',
  },
  disconnected: {
    label: 'Disconnected',
    color: 'bg-gray-500',
    icon: '○',
  },
  error: {
    label: 'Connection Error',
    color: 'bg-red-500',
    icon: '✕',
  },
};

export function ConnectionIndicator({
  hideWhenConnected = false,
  className = '',
}: ConnectionIndicatorProps) {
  const { state, connect } = useWebSocket();
  const config = STATE_CONFIG[state];

  // Hide when connected if requested
  if (hideWhenConnected && state === 'connected') {
    return null;
  }

  const showReconnectButton = state === 'disconnected' || state === 'error';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full ${config.color}`} />

      {/* Status text */}
      <span className="text-sm text-gray-700">{config.label}</span>

      {/* Reconnect button */}
      {showReconnectButton && (
        <button
          onClick={connect}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}

/**
 * Compact connection indicator (icon only)
 */
export function ConnectionIndicatorCompact({ className = '' }: { className?: string }) {
  const { state } = useWebSocket();
  const config = STATE_CONFIG[state];

  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${className}`}
      title={config.label}
    >
      <div className={`w-3 h-3 rounded-full ${config.color}`} />
    </div>
  );
}
