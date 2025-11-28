'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from './nav-config';
import { UserCircleIcon } from './icons';
import { cn } from '@/lib/utils';

/**
 * Sidebar navigation for desktop devices
 * - Translucent background with backdrop blur (macOS-style)
 * - Soft Modernity design system (warm colors, rounded corners)
 * - Active state highlighting with coral accent
 * - User profile section at bottom
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 bg-[rgba(250,248,245,0.8)] backdrop-blur-lg border-r border-border-subtle shadow-translucent overflow-y-auto flex flex-col"
      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
    >
      {/* Header */}
      <div className="p-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-warm-900">
          Family Gifting
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-large font-semibold transition-all duration-200 ease-out',
                isActive
                  ? 'bg-primary-100 text-primary-600 shadow-subtle'
                  : 'text-warm-700 hover:bg-warm-100 hover:text-warm-900'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <UserCircleIcon className="w-8 h-8 text-warm-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-900 truncate">
              {user?.email || 'User'}
            </p>
            <button
              onClick={logout}
              className="text-xs text-warm-600 hover:text-warm-900 transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
