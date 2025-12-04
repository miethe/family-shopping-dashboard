/**
 * ListCard Component
 *
 * Redesigned card display for a gift list with inspiration design.
 * Features rounded card with icon, owner badge, title, item count, and status.
 * Mobile-first with 44px touch targets and glassmorphism aesthetics.
 */

'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  HeartIcon,
  LightbulbIcon,
  CheckIcon,
  EyeOffIcon,
  GlobeIcon,
  UsersIcon,
} from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import { ListDetailModal, useEntityModal } from '@/components/modals';
import type { GiftList, ListType, ListVisibility } from '@/types';

interface ListCardProps {
  list: GiftList;
  ownerName?: string;
  ownerAvatar?: string;
}

// Icon mapping by list type
const listTypeIcons: Record<ListType, typeof HeartIcon> = {
  wishlist: HeartIcon,
  ideas: LightbulbIcon,
  assigned: CheckIcon,
};

// Color scheme by list type - matching inspiration
const listTypeColors: Record<ListType, { iconBg: string; textColor: string }> = {
  wishlist: { iconBg: 'bg-[#F4E3E1]', textColor: 'text-[#A65D57]' },
  ideas: { iconBg: 'bg-[#F2E8CF]', textColor: 'text-[#BC8A5F]' },
  assigned: { iconBg: 'bg-[#E1E5F2]', textColor: 'text-[#4A5D8A]' },
};

// Status badge colors by visibility
const visibilityStatusColors: Record<ListVisibility, string> = {
  private: 'bg-[#C07E75] text-white',
  family: 'bg-[#C8A166] text-white',
  public: 'bg-[#8DA9C4] text-white',
};

// Visibility labels
const visibilityLabels: Record<ListVisibility, string> = {
  private: 'Private',
  family: 'Family',
  public: 'Public',
};

export function ListCard({ list, ownerName, ownerAvatar }: ListCardProps) {
  const IconComponent = listTypeIcons[list.type];
  const colors = listTypeColors[list.type];
  const { open, entityId, openModal, closeModal } = useEntityModal('list');

  return (
    <>
      <button
        onClick={() => openModal(String(list.id))}
        className="w-full text-left group"
      >
        <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-salmon/20">
          {/* Top row: Icon and Owner Badge */}
          <div className="flex justify-between items-start mb-4">
            {/* List Type Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                colors.iconBg,
                colors.textColor
              )}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Owner Badge (if provided) */}
            {ownerName && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full min-h-[32px]">
                <Avatar size="xs">
                  {ownerAvatar && <AvatarImage src={ownerAvatar} alt={ownerName} />}
                  <AvatarFallback>{ownerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-gray-600">{ownerName}</span>
              </div>
            )}
          </div>

          {/* List Title and Item Count */}
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-salmon transition-colors">
            {list.name}
          </h3>
          <p className="text-gray-500 text-sm font-medium mb-6">
            {list.item_count || 0} items · {list.type}
          </p>

          {/* Bottom row: Status label and badge */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold text-sm">Status</span>
            <span
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold',
                visibilityStatusColors[list.visibility]
              )}
            >
              {visibilityLabels[list.visibility]}
            </span>
          </div>
        </div>
      </button>

      <ListDetailModal
        listId={entityId}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
      />
    </>
  );
}
