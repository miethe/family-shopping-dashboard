'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/ui/BrandMark';
export function Header() {
  const { user } = useAuth();
  return <header className="club-phone-header">
    <Link href="/dashboard" className="club-brand"><BrandMark size={31}/>Family Gifting</Link>
    <span className="club-user-avatar" aria-label="Your account">{user?.email.charAt(0).toUpperCase() || 'Y'}</span>
  </header>;
}
