'use client';

import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { QuickAddButton } from '@/components/quick-add';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout - Main application layout with fixed sidebar and responsive design
 *
 * Design System V2 Implementation:
 * - Fixed left sidebar (w-20 md:w-24) on desktop
 * - Top header on mobile with bottom navigation
 * - Max-width 1600px content container
 * - iOS safe-area support
 * - Dark mode ready with Tailwind dark: classes
 * - Fade-in animation on content load
 *
 * Mobile (< md):
 * - Top header with safe-area-top
 * - Bottom fixed navigation bar with safe-area-bottom
 * - Content area with proper padding
 * - 44px minimum touch targets
 *
 * Desktop (>= md):
 * - Fixed left sidebar navigation (w-20 md:w-24)
 * - Content area with ml-20 md:ml-24 offset
 * - Max-width 1600px centered container
 * - Smooth transitions and animations
 *
 * Features:
 * - iOS safe area support (notch, home indicator)
 * - Dynamic viewport height (100dvh fallback)
 * - Responsive breakpoints
 * - Dark mode transition support
 * - WCAG 2.1 AA compliant with skip navigation link
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-text-main-dark transition-colors duration-300">
      {/* ACCESSIBILITY: Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile Header - Hidden on desktop */}
      <div className="md:hidden sticky top-0 z-50 bg-surface-primary/80 dark:bg-background-dark/80 backdrop-blur-md safe-area-top border-b border-border-subtle dark:border-white/10 shadow-subtle">
        <Header />
      </div>

      {/* Desktop Sidebar - Fixed position handled in DesktopNav component */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 ml-0 md:ml-20 lg:ml-24 overflow-y-auto h-screen scroll-smooth transition-[margin] duration-300 ease-in-out"
      >
        {/* Max-width container with fade-in animation */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 pb-20 md:pb-8 min-h-screen fade-in">
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
