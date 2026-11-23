'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { navItems, isDestinationActive } from './nav-config';
import { NavIcon } from './NavIcon';
const primary = ['/dashboard','/people','/gifts','/events'];
export function MobileNav() {
  const pathname = usePathname();
  const [open,setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { user, logout } = useAuth();
  const more = navItems.filter(item => !primary.includes(item.href));
  return <>
    <nav className="club-bottom-nav" aria-label="Main navigation">
      {primary.map(href => { const item = navItems.find(i => i.href === href)!; return <Link key={href} href={item.href} prefetch={false} aria-current={isDestinationActive(pathname,href) ? 'page' : undefined}><NavIcon name={item.icon}/><span>{item.label}</span></Link>; })}
      <button ref={trigger} onClick={()=>setOpen(true)} aria-current={more.some(i=>isDestinationActive(pathname,i.href)) ? 'page' : undefined} aria-label="More" aria-haspopup="dialog" aria-expanded={open} data-active={more.some(i=>isDestinationActive(pathname,i.href))}><NavIcon name="more"/><span>More</span></button>
    </nav>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="club-more-sheet" onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus();}}>
        <div className="sheet-handle" aria-hidden="true"/>
        <DialogTitle>A little more</DialogTitle>
        <DialogDescription>Everything in your family space.</DialogDescription>
        <div className="club-more-grid">{more.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}><NavIcon name={item.icon}/>{item.label}</Link>)}</div>
        <div className="club-theme-note"><strong>Seasonal themes</strong><p>A little celebration when a saved holiday is near.</p><p className="christmas-only">Christmas is ready to party.</p></div>
        <div className="club-sheet-user"><span>{user?.email.split('@')[0] || 'You'} · Your family</span><button onClick={logout}>Sign out</button></div>
      </DialogContent>
    </Dialog>
  </>;
}
