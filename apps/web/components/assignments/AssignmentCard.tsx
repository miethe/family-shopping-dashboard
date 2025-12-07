'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@/components/ui';
import { GiftIcon, CheckCircleIcon, ShoppingCartIcon, LightbulbIcon } from '@/components/layout/icons';
import { GiftTitleLink } from '@/components/common/GiftTitleLink';
import { formatPrice } from '@/lib/utils';
import type { AssignmentItem } from '@/hooks/useMyAssignments';
import type { ListItemStatus } from '@/types';

export interface AssignmentCardProps {
  assignment: AssignmentItem;
}

/**
 * Get badge variant based on item status
 */
function getStatusBadgeVariant(status: ListItemStatus): 'default' | 'info' | 'warning' | 'success' {
  switch (status) {
    case 'idea':
      return 'default';
    case 'selected':
      return 'info';
    case 'purchased':
      return 'warning';
    case 'received':
      return 'success';
    default:
      return 'default';
  }
}

/**
 * Get status label text
 */
function getStatusLabel(status: ListItemStatus): string {
  switch (status) {
    case 'idea':
      return 'Idea';
    case 'selected':
      return 'Selected';
    case 'purchased':
      return 'Purchased';
    case 'received':
      return 'Received';
    default:
      return status;
  }
}

/**
 * Get status icon component
 */
function getStatusIcon(status: ListItemStatus) {
  switch (status) {
    case 'idea':
      return LightbulbIcon;
    case 'selected':
      return GiftIcon;
    case 'purchased':
      return ShoppingCartIcon;
    case 'received':
      return CheckCircleIcon;
    default:
      return GiftIcon;
  }
}

/**
 * Assignment Card Component
 *
 * Displays a single gift assignment with:
 * - Gift image or placeholder
 * - Gift name
 * - Person name (whose list it's on)
 * - Status badge
 * - Click to navigate to list detail
 *
 * Mobile-optimized with 44px minimum touch target
 */
export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const StatusIcon = getStatusIcon(assignment.status);
  const listHref = `/lists/${assignment.list_id}` as const;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={listHref} className="block">
        <div className="flex gap-3 p-3">
          {/* Image */}
          <div className="flex-shrink-0">
            {assignment.gift.image_url ? (
              <div className="w-16 h-16 relative bg-gray-100 rounded">
                <Image
                  src={assignment.gift.image_url}
                  alt={assignment.gift.name}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <GiftIcon className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Gift name */}
            <h3 className="font-medium text-sm md:text-base line-clamp-2">
              <GiftTitleLink name={assignment.gift.name} url={assignment.gift.url} />
            </h3>

            {/* Person name */}
            <p className="text-xs text-gray-500 truncate">
              For: {assignment.list?.person_name || 'Unknown'}
            </p>

            {/* Status badge */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={getStatusBadgeVariant(assignment.status)}
                size="sm"
                className="flex items-center gap-1"
              >
                <StatusIcon className="w-3 h-3" />
                {getStatusLabel(assignment.status)}
              </Badge>
              {assignment.gift.price !== null && assignment.gift.price !== undefined && (
                <span className="text-sm font-semibold text-gray-700">
                  ${formatPrice(assignment.gift.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
