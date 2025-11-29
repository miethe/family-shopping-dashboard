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
      className="fixed left-0 top-0 bottom-0 w-64 bg-white/60 backdrop-blur-xl border-r border-white/20 shadow-glass overflow-y-auto flex flex-col z-50"
      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
    >
      {/* Header */}
      <div className="p-6 flex-shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
          Family Gifting
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xlarge font-semibold transition-all duration-300 ease-out group relative overflow-hidden',
                isActive
                  ? 'bg-white/80 text-primary-600 shadow-low'
                  : 'text-warm-600 hover:bg-white/40 hover:text-warm-900 hover:shadow-subtle'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/20 flex-shrink-0 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3 rounded-large hover:bg-white/40 transition-colors duration-200 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-inner">
            <UserCircleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-warm-900 truncate group-hover:text-primary-700 transition-colors">
              {user?.email?.split('@')[0] || user?.name?.split(' ')[0] || 'User'}
            </p>
            <button
              onClick={logout}
              className="text-xs text-warm-500 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
