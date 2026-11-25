'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/ui/BrandMark';
import { navItems, isDestinationActive } from './nav-config';
import { NavIcon } from './NavIcon';
import { HouseholdSwitcher } from './HouseholdSwitcher';
export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const name = user?.email.split('@')[0] || 'You';
  return <aside className="club-sidebar">
    <Link href="/dashboard" className="club-brand"><BrandMark />Family Gifting</Link>
    <HouseholdSwitcher />
    <nav aria-label="Desktop navigation">
      {navItems.map(item => <Link key={item.href} href={item.href} prefetch={false} aria-label={item.label} aria-current={isDestinationActive(pathname,item.href) ? 'page' : undefined} className={`club-nav-item min-h-[44px] ${item.href === '/admin' ? 'club-admin' : ''}`}><NavIcon name={item.icon}/><span>{item.label}</span></Link>)}
    </nav>
    <div className="club-user"><span className="club-user-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><p>Family space · <button onClick={logout}>Sign out</button></p></div></div>
  </aside>;
}
