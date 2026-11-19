'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * Mobile header component
 * - Sticky to top with glassmorphism
 * - Safe area padding handled by parent wrapper in AppLayout
 * - Wordmark in the heading serif and deep green; explicit, labelled sign-out.
 * - The unexplained connection dot was removed (it meant nothing to a family member).
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
          <h1 className="text-xl font-bold whitespace-nowrap text-[#214d40]" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            Family Gifting
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={logout}
            className="
              min-h-touch px-3
              rounded-full
              text-sm font-semibold
              text-[#635a50] hover:text-[#2b2622]
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
