'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-config';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation bar for mobile devices
 * - Glassmorphism design matching desktop sidebar
 * - Fixed to bottom of screen
 * - 44px minimum touch targets
 * - Safe area bottom padding
 * - Active state with salmon color
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white/40 backdrop-blur-xl border-t border-white/50 shadow-glass z-50 fixed bottom-0 left-0 right-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[44px] min-h-[44px]',
                'px-3 py-2',
                'rounded-2xl',
                'transition-all duration-300 ease-out active:scale-95',
                isActive
                  ? 'bg-salmon text-white shadow-lg shadow-salmon/30'
                  : 'text-gray-400 hover:bg-white/50 hover:text-salmon'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
              <span
                className={cn(
                  'text-[10px] font-bold mt-1',
                  isActive ? 'text-white' : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
