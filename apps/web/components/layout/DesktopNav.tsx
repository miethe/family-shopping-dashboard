'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from './nav-config';
import { GiftIcon } from './icons';
import { cn } from '@/lib/utils';

/**
 * Icon-only sidebar navigation for desktop devices
 * - Fixed left sidebar (w-20 lg:w-24)
 * - Glassmorphism design with backdrop blur
 * - Icon-only navigation with tooltips
 * - Active state with salmon color and left border indicator
 * - Profile avatar at bottom
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-20 lg:w-24 flex-shrink-0 flex flex-col items-center py-8 h-screen fixed left-0 top-0 z-50 bg-white/40 backdrop-blur-xl border-r border-white/50"
      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
    >
      {/* Brand Icon */}
      <Link
        href="/dashboard"
        className="mb-12 p-3 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-2xl shadow-lg shadow-orange-100 cursor-pointer hover:scale-105 transition-transform duration-200"
      >
        <GiftIcon className="text-white w-6 h-6" />
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 w-full items-center flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'p-3 rounded-2xl transition-all duration-300 group relative',
                isActive
                  ? 'bg-salmon text-white shadow-lg shadow-salmon/30'
                  : 'text-gray-400 hover:bg-white/50 hover:text-salmon'
              )}
              title={item.label}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />

              {/* Active indicator - left border */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-salmon rounded-r-full -ml-4 lg:-ml-6" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Avatar */}
      <div className="mt-auto">
        <button
          onClick={logout}
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors group"
          title={user?.email || 'Profile'}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white group-hover:ring-salmon transition-all duration-200">
            {user?.email ? (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 font-bold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover" />
            )}
          </div>
        </button>
      </div>
    </aside>
  );
}
