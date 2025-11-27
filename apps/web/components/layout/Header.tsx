'use client';

import { useAuth } from '@/hooks/useAuth';
import { PlusIcon, UserCircleIcon } from './icons';

/**
 * Mobile header component
 * - Sticky to top
 * - Safe area top padding
 * - Quick actions and user menu
 */
export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
      {/* App Title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Family Gifting</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button - Placeholder for now */}
        <button
          className="
            flex items-center justify-center
            min-w-touch min-h-touch
            w-10 h-10
            rounded-full
            bg-primary-600 text-white
            hover:bg-primary-700
            transition-colors
          "
          aria-label="Quick add"
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* User Menu - Simple for now */}
        <button
          onClick={logout}
          className="
            flex items-center justify-center
            min-w-touch min-h-touch
            w-10 h-10
            rounded-full
            text-gray-600 hover:text-gray-900
            transition-colors
          "
          aria-label="User menu"
        >
          <UserCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
}
