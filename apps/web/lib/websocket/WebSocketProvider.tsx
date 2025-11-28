/**
 * WebSocketProvider
 *
 * Context provider for WebSocket connection.
 * Makes WebSocket instance available throughout the app.
 *
 * Usage:
 * ```tsx
 * // app/layout.tsx
 * <AuthProvider>
 *   <WebSocketProvider>
 *     {children}
 *   </WebSocketProvider>
 * </AuthProvider>
 * ```
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, UseWebSocketReturn } from '@/hooks/useWebSocket';
import type { WSOptions } from './types';

const WebSocketContext = createContext<UseWebSocketReturn | undefined>(undefined);

export interface WebSocketProviderProps {
  children: ReactNode;
  options?: WSOptions;
}

export function WebSocketProvider({ children, options }: WebSocketProviderProps) {
  const webSocket = useWebSocket(options);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access WebSocket context
 * @throws Error if used outside WebSocketProvider
 */
export function useWebSocketContext(): UseWebSocketReturn {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
