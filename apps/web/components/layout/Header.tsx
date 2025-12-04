'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PlusIcon, UserCircleIcon, BellIcon, SearchIcon } from './icons';
import { ConnectionIndicatorCompact } from '@/components/websocket/ConnectionIndicator';
import { SearchInput } from './SearchInput';

/**
 * Mobile header component
 * - Sticky to top with glassmorphism
 * - Safe area top padding for iOS
 * - Quick actions: search toggle, notifications, quick add, user menu
 * - Expandable search bar
 * - Design System V2 styled
 */
export function Header() {
  const { user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/70 dark:bg-warm-900/70 backdrop-blur-xl border-b border-white/20 dark:border-warm-700/20 shadow-glass"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
      {/* Main header bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* App Title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
            Family Gifting
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <ConnectionIndicatorCompact className="mr-1" />

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="
              flex items-center justify-center
              min-w-touch min-h-touch
              w-10 h-10
              rounded-full
              text-warm-600 hover:text-warm-900
              dark:text-warm-400 dark:hover:text-warm-100
              hover:bg-white/50 dark:hover:bg-warm-800/50
              active:scale-95 transition-all duration-200
            "
            aria-label="Toggle search"
            aria-expanded={showSearch}
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            className="
              relative
              flex items-center justify-center
              min-w-touch min-h-touch
              w-10 h-10
              rounded-full
              text-warm-600 hover:text-warm-900
              dark:text-warm-400 dark:hover:text-warm-100
              hover:bg-white/50 dark:hover:bg-warm-800/50
              active:scale-95 transition-all duration-200
            "
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {/* Notification badge (example) */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-warm-900" />
          </button>

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
              dark:text-warm-400 dark:hover:text-warm-100
              hover:bg-white/50 dark:hover:bg-warm-800/50
              active:scale-95 transition-all duration-200
            "
            aria-label="User menu"
          >
            <UserCircleIcon className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 animate-slide-up-fade">
          <SearchInput
            placeholder="Search gifts, lists, people..."
            onSearch={handleSearch}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
