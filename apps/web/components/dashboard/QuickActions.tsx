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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link href="/gifts/new">
        <Button
          variant="default"
          className="w-full min-h-[44px] flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Idea
        </Button>
      </Link>

      <Link href="/lists">
        <Button
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2"
        >
          <ListIcon className="h-5 w-5" />
          View Lists
        </Button>
      </Link>

      <Link href="/lists?filter=assigned">
        <Button
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2"
        >
          <UserIcon className="h-5 w-5" />
          My Assignments
        </Button>
      </Link>
    </div>
  );
}
