'use client';

import { useAuth } from '@/hooks/useAuth';
import { ConnectionIndicatorCompact } from '@/components/websocket/ConnectionIndicator';

/**
 * Mobile header component
 * - Sticky to top with glassmorphism
 * - Safe area padding handled by parent wrapper in AppLayout
 * - Live-connection dot and an explicit, labelled sign-out control.
 * - Quick add lives in the floating button (one capture entry point, not two).
 * - Search and notifications were removed from this release: neither had a
 *   working feature behind it, so showing them was a dead control.
 */
export function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-white/70 dark:bg-warm-900/70 backdrop-blur-xl border-b border-white/20 dark:border-warm-700/20 shadow-glass">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 pr-2">
          <h1 className="text-lg font-bold whitespace-nowrap bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
            Family Gifting
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ConnectionIndicatorCompact />
          <button
            onClick={logout}
            className="
              min-h-touch px-3
              rounded-full
              text-sm font-semibold
              text-warm-700 hover:text-warm-900
              dark:text-warm-300 dark:hover:text-warm-100
              hover:bg-white/50 dark:hover:bg-warm-800/50
              active:scale-95 transition-all duration-200
            "
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
