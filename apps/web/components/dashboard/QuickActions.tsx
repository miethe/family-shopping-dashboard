/**
 * Quick Actions
 *
 * Quick action buttons for common dashboard tasks.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { PlusIcon, ListIcon, UserIcon } from '@/components/layout/icons';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
      <Link href="/gifts/new" className="group">
        <Button
          variant="default"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 lift-effect press-effect"
        >
          <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          Add Idea
        </Button>
      </Link>

      <Link href="/lists" className="group">
        <Button
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 lift-effect press-effect"
        >
          <ListIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          View Lists
        </Button>
      </Link>

      <Link href="/lists?filter=assigned" className="group">
        <Button
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 lift-effect press-effect"
        >
          <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          My Assignments
        </Button>
      </Link>
    </div>
  );
}
