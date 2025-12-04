'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from './nav-config';
import { cn } from '@/lib/utils';

/**
 * Icon-only sidebar navigation for desktop devices (V2 Design)
 * - Fixed left sidebar (w-20 lg:w-24)
 * - Warm terracotta/rust background design
 * - Material Symbols icons with hover tooltips
 * - Active state with white highlight and left border indicator
 * - Profile avatar and FAB button at bottom
 */
export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-20 lg:w-24 flex-shrink-0 flex flex-col items-center py-8 h-screen fixed left-0 top-0 z-50 bg-[#B67352] transition-all duration-300"
      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
    >
      {/* Brand Icon */}
      <Link
        href="/dashboard"
        className="mb-12 p-3 bg-white/20 rounded-2xl shadow-lg cursor-pointer hover:scale-105 hover:bg-white/30 transition-all duration-200"
      >
        <span className="material-symbols-outlined text-white text-2xl">
          card_giftcard
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 w-full items-center flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              prefetch={false}
              className={cn(
                'p-3 rounded-2xl transition-all duration-300 group relative',
                isActive
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/20 hover:text-white'
              )}
            >
              <span className={cn(
                'material-symbols-outlined text-2xl',
                isActive ? 'font-semibold' : ''
              )}>
                {item.icon}
              </span>

              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>

              {/* Active indicator - left border */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-4 lg:-ml-6" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Avatar and FAB */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          onClick={logout}
          className="text-white/70 hover:text-white transition-colors group"
          title={user?.email || 'Profile'}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-200">
            {user?.email ? (
              <div className="w-full h-full bg-white/30 flex items-center justify-center text-white font-bold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Image src="https://picsum.photos/100/100" alt="Profile" width={100} height={100} className="w-full h-full object-cover" unoptimized />
            )}
          </div>
        </button>

        {/* FAB Button */}
        <button
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200"
          title="Quick Add"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </aside>
  );
}
