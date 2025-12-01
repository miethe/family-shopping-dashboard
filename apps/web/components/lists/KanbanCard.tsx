/**
 * KanbanCard Component (v2 Design)
 *
 * Displays a gift item card in the Kanban board with:
 * - Large product image with price overlay (top-right)
 * - Title
 * - Recipient avatar + name
 * - Hover effects: shadow-lg and translate-y
 * - Drag-and-drop support
 *
 * Mobile-first with 44px touch targets and touch-drag support.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface KanbanCardProps {
  item: ListItemWithGift;
  status: ListItemStatus;
  onDragStart: (item: ListItemWithGift) => void;
  onDragEnd: () => void;
}

export function KanbanCard({ item, status, onDragStart, onDragEnd }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle case where gift might not be loaded
  if (!item.gift) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm opacity-50">
        <div className="text-gray-400 text-sm">Loading gift...</div>
      </div>
    );
  }

  /**
   * Handle drag start
   */
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(item);

    // Set drag data for fallback (though we use state management)
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id.toString());

    // Create a ghost image with reduced opacity
    if (e.currentTarget instanceof HTMLElement) {
      const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
      ghost.style.opacity = '0.5';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-card cursor-move group',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
        'border border-transparent hover:border-slate-200 dark:hover:border-slate-600',
        'touch-manipulation', // Better touch handling on mobile
        isDragging && 'opacity-40 cursor-grabbing'
      )}
    >
      {/* Image with Price Overlay */}
      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-700 rounded-xl mb-3 overflow-hidden relative">
        {item.gift?.image_url ? (
          <Image
            src={item.gift.image_url}
            alt={item.gift.name}
            width={320}
            height={200}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">
              redeem
            </span>
          </div>
        )}
        {/* Price Badge Overlay (top-right) */}
        {item.gift?.price && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
            ${item.gift.price.toFixed(0)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-2">
          {item.gift?.name || 'Unnamed Gift'}
        </h3>

        {/* Footer: Recipient Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded-lg">
            {/* Avatar placeholder - in real app, fetch person data */}
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">
              ?
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {item.assigned_to ? `User ${item.assigned_to}` : 'Unassigned'}
            </span>
          </div>

          {/* Status Indicator Dot */}
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'idea' && 'bg-yellow-400',
              status === 'to_buy' && 'bg-red-400',
              status === 'purchased' && 'bg-green-400',
              status === 'gifted' && 'bg-purple-400',
              status === 'selected' && 'bg-blue-400',
              status === 'received' && 'bg-gray-400'
            )}
          ></span>
        </div>
      </div>
    </div>
  );
}
