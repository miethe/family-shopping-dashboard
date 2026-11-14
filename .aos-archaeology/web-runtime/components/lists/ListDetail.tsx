/**
 * ListDetail Component
 *
 * Displays list header with name, type, visibility, and related entities.
 * Shows person link if person_id exists, occasion link if occasion_id exists.
 * Mobile-first with 44px touch targets.
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HeartIcon,
  LightbulbIcon,
  CheckIcon,
  EyeOffIcon,
  GlobeIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
} from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import type { GiftList, ListType, ListVisibility } from '@/types';

interface ListDetailProps {
  list: GiftList;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Icon mapping by list type
const listTypeIcons: Record<ListType, typeof HeartIcon> = {
  wishlist: HeartIcon,
  ideas: LightbulbIcon,
  assigned: CheckIcon,
};

// Color scheme by list type
const listTypeColors: Record<ListType, string> = {
  wishlist: 'bg-purple-100 text-purple-600',
  ideas: 'bg-yellow-100 text-yellow-600',
  assigned: 'bg-blue-100 text-blue-600',
};

// Badge variant by list type
const listTypeBadgeVariant: Record<ListType, 'default' | 'success' | 'warning' | 'info'> = {
  wishlist: 'default',
  ideas: 'warning',
  assigned: 'info',
};

// Visibility icons
const visibilityIcons: Record<ListVisibility, typeof EyeOffIcon> = {
  private: EyeOffIcon,
  family: UsersIcon,
  public: GlobeIcon,
};

export function ListDetail({ list, onEdit, onDelete }: ListDetailProps) {
  const TypeIcon = listTypeIcons[list.type];
  const VisibilityIcon = visibilityIcons[list.visibility];

  return (
    <Card variant="elevated" padding="lg">
      <CardContent>
        {/* Header with Icon and Name */}
        <div className="flex items-start gap-4 mb-4">
          {/* Type Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
              listTypeColors[list.type]
            )}
          >
            <TypeIcon className="w-7 h-7" />
          </div>

          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{list.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Badge */}
              <Badge variant={listTypeBadgeVariant[list.type]} size="default">
                {list.type}
              </Badge>

              {/* Visibility Badge */}
              <Badge variant="default" size="default">
                <div className="flex items-center gap-1">
                  <VisibilityIcon className="w-3 h-3" />
                  <span>{list.visibility}</span>
                </div>
              </Badge>
            </div>
          </div>
        </div>

        {/* Related Entities */}
        {(list.person_id || list.occasion_id) && (
          <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
            {/* Person Link */}
            {list.person_id && (
              <Link
                href={`/people/${list.person_id}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]"
              >
                <UserIcon className="w-4 h-4" />
                <span>View Person Profile</span>
              </Link>
            )}

            {/* Occasion Link */}
            {list.occasion_id && (
              <Link
                href={`/occasions/${list.occasion_id}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Occasion Details</span>
              </Link>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="flex-1">
                Edit List
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} className="flex-1">
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
