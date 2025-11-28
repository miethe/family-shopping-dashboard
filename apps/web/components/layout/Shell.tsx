'use client';

import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { QuickAddButton } from '@/components/quick-add';
import { ConnectionIndicatorCompact } from '@/components/websocket/ConnectionIndicator';

interface ShellProps {
  children: React.ReactNode;
}

/**
 * Main app shell component with responsive layout
 *
 * Mobile (< md):
 * - Top header with title and actions
 * - Bottom fixed navigation bar
 * - Content area with safe area padding
 *
 * Desktop (>= md):
 * - Left sidebar navigation
 * - Content area fills remaining space
 * - No bottom navigation
 *
 * Features:
 * - iOS safe area support (notch, home indicator)
 * - Dynamic viewport height (100dvh)
 * - Responsive breakpoints
 */
export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row overflow-hidden">
      {/* Mobile Header - Hidden on desktop */}
      <div className="md:hidden sticky top-0 z-50 bg-surface-primary/80 backdrop-blur-md safe-area-top border-b border-border-subtle shadow-subtle">
        <Header />
      </div>

      {/* Desktop Sidebar - Fixed position handled in component */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto md:pl-64 transition-[padding] duration-300 ease-in-out">
        {/* Content wrapper with padding and safe areas */}
        <div className="pb-20 md:pb-0 min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav />
      </div>

      {/* Quick Add FAB - Available on all authenticated pages */}
      <QuickAddButton variant="fab" />
    </div>
  );
}
