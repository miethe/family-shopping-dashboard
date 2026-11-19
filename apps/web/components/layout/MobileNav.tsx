'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { QuickAddModal } from '@/components/quick-add';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation bar for mobile devices
 * - Warm terracotta/rust background matching desktop sidebar
 * - Fixed to bottom of screen with safe-area padding
 * - 44px minimum touch targets (iOS guidelines)
 * - Active state with white highlight
 * - Material Symbols icons
 * - WCAG 2.1 AA compliant with aria-current support
 * - Safe area handled via CSS utility class
 */

interface NavItem {
  href: string;
  label: string;
  icon: string; // Material Symbols icon name
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Events', icon: 'calendar_month' },
  { href: '/people', label: 'People', icon: 'groups' },
  { href: '/ideas', label: 'Ideas', icon: 'lightbulb' },
  { href: '/budgets', label: 'Budget', icon: 'savings' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const left = navItems.slice(0, 2);
  const right = navItems.slice(2);

  const renderItem = (item: NavItem) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/') || (item.href === '/dashboard' && pathname?.startsWith('/events'));

          return (
            <Link
              key={item.href}
              href={item.href as any}
              prefetch={false}
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
                // Active state - white highlight
                isActive
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/20 hover:text-white'
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
                  'text-white'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        };

  return (
    <nav
      className={cn(
        // Warm terracotta/rust background matching sidebar
        'bg-[#B67352]',
        // Fixed positioning
        'fixed bottom-0 left-0 right-0 z-50',
        // Safe area bottom padding + horizontal for landscape
        'safe-area-fixed-bottom'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {left.map(renderItem)}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl text-white bg-[#214d40] active:scale-95 transition-all duration-300"
          aria-label="Quick add idea"
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">add</span>
          <span className="text-[10px] font-bold mt-1 text-white">Add idea</span>
        </button>
        {right.map(renderItem)}
      </div>
      <QuickAddModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </nav>
  );
}
