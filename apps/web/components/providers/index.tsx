'use client'

import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'
import { HolidayTheme } from './HolidayTheme'
import { WebSocketProvider } from '@/lib/websocket/WebSocketProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <HolidayTheme />
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
