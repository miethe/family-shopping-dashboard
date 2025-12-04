/**
 * Stats Cards
 *
 * Three colored cards showing Ideas, To Buy, and Purchased counts with CTA button
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface StatsCardsProps {
  ideas: number;
  toBuy: number;
  purchased: number;
  occasionId?: number;
}

export function StatsCards({ ideas, toBuy, purchased, occasionId }: StatsCardsProps) {
  const router = useRouter();

  const stats = [
    {
      label: 'Ideas',
      count: ideas,
      bgColor: 'bg-mustard',
      textColor: 'text-status-idea-text',
      statusFilter: 'idea',
    },
    {
      label: 'To Buy',
      count: toBuy,
      bgColor: 'bg-salmon',
      textColor: 'text-white',
      statusFilter: 'selected',
    },
    {
      label: 'Purchased',
      count: purchased,
      bgColor: 'bg-sage',
      textColor: 'text-white',
      statusFilter: 'purchased',
    },
  ];

  const handleStatClick = (statusFilter: string) => {
    router.push(`/gifts?status=${statusFilter}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="flex gap-3 md:gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => handleStatClick(stat.statusFilter)}
            className={`flex-1 ${stat.bgColor} rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2`}
            aria-label={`View ${stat.label} gifts`}
          >
            <span className={`text-sm opacity-80 font-semibold mb-1 ${stat.textColor}`}>
              {stat.label}:
            </span>
            <span className={`text-4xl font-bold ${stat.textColor}`}>
              {stat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Big CTA Button */}
      {occasionId && (
        <Link href={`/occasions/${occasionId}`}>
          <Button
            variant="default"
            className="w-full py-6 bg-salmon hover:bg-salmon/90 text-white rounded-full text-xl font-bold shadow-xl shadow-salmon/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] min-h-[56px]"
          >
            View Occasion
          </Button>
        </Link>
      )}
    </div>
  );
}
