'use client';
import { useState } from 'react';
import { QuickAddModal } from '@/components/quick-add';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/ui/BrandMark';
export function Header() {
  const [capture, setCapture] = useState(false);
  const { user } = useAuth();
  return <><header className="club-phone-header">
    <Link href="/dashboard" className="club-brand"><BrandMark size={31}/>Family Gifting</Link>
    <button className="club-header-add" aria-label="Add an idea" onClick={()=>setCapture(true)}>+</button>
    <span className="club-user-avatar" aria-label="Your account">{user?.email.charAt(0).toUpperCase() || 'Y'}</span>
  </header><QuickAddModal isOpen={capture} onClose={()=>setCapture(false)}/></>;
}
