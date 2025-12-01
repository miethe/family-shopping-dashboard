'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation bar for mobile devices
 * - Glassmorphism design matching desktop sidebar
 * - Fixed to bottom of screen with safe-area padding
 * - 44px minimum touch targets (iOS guidelines)
 * - Active state with coral color (#E57373)
 * - Material Symbols icons
 * - Dark mode support
 * - WCAG 2.1 AA compliant with aria-current support
 */

interface NavItem {
  href: string;
  label: string;
  icon: string; // Material Symbols icon name
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'home'
  },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: 'list_alt'
  },
  {
    href: '/people',
    label: 'People',
    icon: 'groups'
  },
  {
    href: '/occasions',
    label: 'Occasions',
    icon: 'calendar_month'
  },
  {
    href: '/gifts',
    label: 'Gifts',
    icon: 'card_giftcard'
  }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        // Glassmorphism matching sidebar
        'bg-white/60 dark:bg-black/20',
        'backdrop-blur-md',
        'border-t border-white/50 dark:border-white/10',
        'shadow-glass',
        // Fixed positioning
        'fixed bottom-0 left-0 right-0 z-50'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                // Layout
                'flex flex-col items-center justify-center',
                // 44px minimum touch target (iOS guidelines)
                'min-w-[44px] min-h-[44px]',
                'px-3 py-2',
                // Border radius matching design tokens
                'rounded-2xl',
                // Transitions and interactions
                'transition-all duration-300 ease-out',
                'active:scale-95',
                // Active state - coral/salmon primary color
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-warm-500 dark:text-warm-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-primary dark:hover:text-primary'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}${isActive ? ' - current page' : ''}`}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[24px]',
                  // Filled style for active state
                  isActive && 'filled'
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold mt-1',
                  isActive
                    ? 'text-white'
                    : 'text-warm-600 dark:text-warm-500'
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
