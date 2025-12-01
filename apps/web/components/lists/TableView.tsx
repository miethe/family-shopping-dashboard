/**
 * TableView Component
 *
 * Displays gift list items in a table format with:
 * - 7 columns: Gift Item, Recipient, Status, Price, Category, Added By, Actions
 * - Sticky header on scroll
 * - Row hover effects
 * - Status badges with icons
 * - Responsive horizontal scroll on mobile
 * - Click row to open detail modal
 */

'use client';

import Image from 'next/image';
import { Icon, IconNames } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface TableViewProps {
  items: ListItemWithGift[];
  onItemClick: (item: ListItemWithGift) => void;
}

// Status configuration matching the inspiration design
const STATUS_CONFIG: Record<
  ListItemStatus,
  { color: string; border: string; icon: string; label: string }
> = {
  idea: {
    color: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-200',
    icon: IconNames.idea,
    label: 'Idea',
  },
  selected: {
    color: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
    icon: IconNames.check,
    label: 'Selected',
  },
  to_buy: {
    color: 'bg-red-100 text-red-800',
    border: 'border-red-200',
    icon: IconNames.cart,
    label: 'To Buy',
  },
  purchased: {
    color: 'bg-green-100 text-green-800',
    border: 'border-green-200',
    icon: IconNames.check,
    label: 'Purchased',
  },
  received: {
    color: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-200',
    icon: IconNames.check,
    label: 'Received',
  },
  gifted: {
    color: 'bg-purple-100 text-purple-800',
    border: 'border-purple-200',
    icon: IconNames.volunteer,
    label: 'Gifted',
  },
};

/**
 * Format date string for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TableView({ items, onItemClick }: TableViewProps) {
  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <Icon name={IconNames.table} size="2xl" className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No items in this list</p>
          <p className="text-sm mt-2">Add your first gift to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1024px]">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Gift Item
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Recipient
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Status
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Price
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Category
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                Added By
              </th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onItemClick(item)}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
              >
                {/* Gift Item Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                      {item.gift.image_url ? (
                        <Image
                          src={item.gift.image_url}
                          alt={item.gift.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            name={IconNames.gift}
                            size="md"
                            className="text-slate-400"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.gift.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Added {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Recipient Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Icon
                        name={IconNames.people}
                        size="xs"
                        className="text-slate-500"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {/* TODO: Add recipient name when available */}
                      Not assigned
                    </span>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                      STATUS_CONFIG[item.status].color,
                      STATUS_CONFIG[item.status].border
                    )}
                  >
                    <Icon
                      name={STATUS_CONFIG[item.status].icon}
                      size="xs"
                      className="flex-shrink-0"
                    />
                    {STATUS_CONFIG[item.status].label}
                  </span>
                </td>

                {/* Price Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.gift.price ? `$${item.gift.price.toFixed(2)}` : '-'}
                  </span>
                </td>

                {/* Category Column */}
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                    {/* TODO: Add category when available in gift schema */}
                    General
                  </span>
                </td>

                {/* Added By Column */}
                <td className="px-6 py-4 text-sm text-slate-500">
                  {/* TODO: Add user name when available */}
                  You
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      // TODO: Open actions menu
                    }}
                    className="text-slate-400 hover:text-primary dark:hover:text-primary transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                    aria-label="More actions"
                  >
                    <Icon name={IconNames.more} size="md" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
