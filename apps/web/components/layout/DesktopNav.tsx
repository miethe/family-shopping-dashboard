'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from './nav-config';
import { UserCircleIcon } from './icons';

/**
 * Sidebar navigation for desktop devices
 * - Fixed width sidebar
 * - Active state highlighting
 * - User profile section at bottom
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-gray-50 border-r border-gray-200" style={{ paddingLeft: 'env(safe-area-inset-left)' }}>
      {/* Logo/Title */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Family Gifting</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={`
                flex items-center gap-3
                px-4 py-3
                rounded-lg
                transition-colors
                ${isActive
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'User'}
            </p>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
