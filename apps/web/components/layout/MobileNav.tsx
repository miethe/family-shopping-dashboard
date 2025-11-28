'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-config';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation bar for mobile devices
 * - Translucent with backdrop blur
 * - Fixed to bottom of screen
 * - 44px minimum touch targets
 * - Safe area bottom padding
 * - Active state indication with coral accent
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-[rgba(250,248,245,0.8)] backdrop-blur-lg border-t border-border-subtle shadow-high"
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
                'rounded-large',
                'transition-all duration-200 ease-out',
                isActive
                  ? 'text-primary-500'
                  : 'text-warm-500 hover:text-warm-700'
              )}
            >
              <Icon className="w-6 h-6" />
              <span
                className={cn(
                  'text-[10px] font-semibold mt-1',
                  isActive ? 'text-primary-600' : 'text-warm-600'
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
