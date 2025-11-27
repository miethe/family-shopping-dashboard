'use client';

import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';

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
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      {/* Mobile Header - Hidden on desktop */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <Header />
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <DesktopNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Content wrapper with padding and safe areas */}
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <MobileNav />
      </div>
    </div>
  );
}
