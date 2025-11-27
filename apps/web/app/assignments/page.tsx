'use client';

import { useState } from 'react';
import { useMyAssignments } from '@/hooks/useMyAssignments';
import { PageHeader } from '@/components/layout/PageHeader';
import { AssignmentList } from '@/components/assignments';
import { Button, Skeleton } from '@/components/ui';
import { CheckCircleIcon, ShoppingCartIcon, LightbulbIcon, GiftIcon } from '@/components/layout/icons';
import type { ListItemStatus } from '@/types';

type GroupByOption = 'list' | 'person';
type FilterOption = 'all' | ListItemStatus;

/**
 * My Assignments Page
 *
 * Shows all list items assigned to the current user.
 * Features:
 * - Filter by status (all, idea, selected, purchased, received)
 * - Group by list or person
 * - Empty state when no assignments
 * - Mobile-first responsive design
 */
export default function AssignmentsPage() {
  const [groupBy, setGroupBy] = useState<GroupByOption>('list');
  const [filter, setFilter] = useState<FilterOption>('all');

  const { data: assignments = [], isLoading, error } = useMyAssignments({
    status: filter === 'all' ? undefined : filter,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="My Assignments"
        subtitle="Gifts assigned to you across all lists"
      />

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            icon={GiftIcon}
          >
            All
          </FilterButton>
          <FilterButton
            active={filter === 'idea'}
            onClick={() => setFilter('idea')}
            icon={LightbulbIcon}
          >
            Ideas
          </FilterButton>
          <FilterButton
            active={filter === 'selected'}
            onClick={() => setFilter('selected')}
            icon={GiftIcon}
          >
            Selected
          </FilterButton>
          <FilterButton
            active={filter === 'purchased'}
            onClick={() => setFilter('purchased')}
            icon={ShoppingCartIcon}
          >
            Purchased
          </FilterButton>
          <FilterButton
            active={filter === 'received'}
            onClick={() => setFilter('received')}
            icon={CheckCircleIcon}
          >
            Received
          </FilterButton>
        </div>

        {/* Group By Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setGroupBy('list')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              min-h-[44px]
              ${groupBy === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            By List
          </button>
          <button
            onClick={() => setGroupBy('person')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              min-h-[44px]
              ${groupBy === 'person'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            By Person
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {!isLoading && assignments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={assignments.length}
            variant="default"
          />
          <StatCard
            label="Ideas"
            value={assignments.filter((a) => a.status === 'idea').length}
            variant="default"
          />
          <StatCard
            label="Selected"
            value={assignments.filter((a) => a.status === 'selected').length}
            variant="info"
          />
          <StatCard
            label="Purchased"
            value={assignments.filter((a) => a.status === 'purchased').length}
            variant="success"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="text-center py-12">
          <p className="text-red-600 font-medium">Error loading assignments</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      ) : assignments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            {filter === 'all'
              ? "You don't have any gift assignments at the moment."
              : `No assignments with status "${filter}".`}
          </p>
          {filter !== 'all' && (
            <Button onClick={() => setFilter('all')} variant="outline">
              Show all assignments
            </Button>
          )}
        </div>
      ) : (
        /* Assignments List */
        <AssignmentList assignments={assignments} groupBy={groupBy} />
      )}
    </div>
  );
}

/**
 * Filter Button Component
 */
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, icon: Icon, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-colors min-h-[44px]
        ${active
          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'info' | 'success' | 'warning';
}

function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'bg-gray-50 text-gray-900',
    info: 'bg-blue-50 text-blue-900',
    success: 'bg-green-50 text-green-900',
    warning: 'bg-yellow-50 text-yellow-900',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[variant]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
