'use client';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { navItems, isDestinationActive } from './nav-config';
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname=usePathname();
  const label=navItems.find(i=>isDestinationActive(pathname,i.href))?.label || 'Your family';
  return <div className="club-shell">
    <a href="#main-content" className="club-skip">Skip to main content</a>
    <DesktopNav/>
    <div className="club-content min-w-0">
      <Header/>
      <main id="main-content">
        <div className="club-topline"><span>Your family &nbsp; / &nbsp; {label}</span><span>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})} &nbsp; · &nbsp; Just for your family</span></div>
        {children}
      </main>
      <MobileNav/>
    </div>
  </div>;
}
