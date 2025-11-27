'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-config';

/**
 * Bottom navigation bar for mobile devices
 * - Fixed to bottom of screen
 * - 44px minimum touch targets
 * - Safe area bottom padding
 * - Active state indication
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around bg-white border-t border-gray-200 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href as any}
            className={`
              flex flex-col items-center justify-center
              min-w-touch min-h-touch
              py-2 px-3
              transition-colors
              ${isActive
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
