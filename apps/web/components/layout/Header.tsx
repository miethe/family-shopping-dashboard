'use client';

import { useAuth } from '@/hooks/useAuth';
import { PlusIcon, UserCircleIcon } from './icons';
import { ConnectionIndicatorCompact } from '@/components/websocket/ConnectionIndicator';

/**
 * Mobile header component
 * - Sticky to top
 * - Safe area top padding
 * - Quick actions and user menu
 */
export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-glass sticky top-0 z-40" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
      {/* App Title */}
      <div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Family Gifting</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <ConnectionIndicatorCompact className="mr-1" />

        {/* Quick Add Button */}
        <button
          className="
            flex items-center justify-center
            min-w-touch min-h-touch
            w-10 h-10
            rounded-full
            bg-primary-500 text-white
            shadow-low hover:shadow-medium
            active:scale-95 transition-all duration-200
          "
          aria-label="Quick add"
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <button
          onClick={logout}
          className="
            flex items-center justify-center
            min-w-touch min-h-touch
            w-10 h-10
            rounded-full
            text-warm-500 hover:text-warm-900
            hover:bg-white/50
            active:scale-95 transition-all duration-200
          "
          aria-label="User menu"
        >
          <UserCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
}
