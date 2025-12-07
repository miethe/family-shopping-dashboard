/**
 * OccasionRecipientsSection Component
 *
 * Displays people (recipients) linked to an occasion.
 * Features:
 * - Avatar grid/scroll of linked persons
 * - Click person to open PersonDetailModal
 * - Add button to link more people
 * - Responsive: horizontal scroll on mobile, grid on desktop
 * - Empty state if no recipients
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { PersonDetailModal, useEntityModal } from '@/components/modals';
import { usePersons } from '@/hooks/usePersons';
import { Plus } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { Person } from '@/types';

interface OccasionRecipientsSectionProps {
  personIds: number[];
  occasionId: number;
  onEditClick?: () => void;
}

/**
 * Mini person card for displaying in recipients section
 */
function PersonMiniCard({ person, onClick }: { person: Person; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-lg',
        'min-w-[100px] min-h-[120px]',
        'hover:bg-gray-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'cursor-pointer group'
      )}
      aria-label={`View details for ${person.display_name}`}
    >
      <Avatar
        size="md"
        className="ring-2 ring-gray-100 group-hover:ring-primary-300 transition-all"
      >
        {person.photo_url && (
          <AvatarImage src={person.photo_url} alt={person.display_name} />
        )}
        <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-gray-900 text-center line-clamp-2 max-w-[90px]">
        {person.display_name}
      </span>
    </button>
  );
}

export function OccasionRecipientsSection({
  personIds,
  occasionId,
  onEditClick,
}: OccasionRecipientsSectionProps) {
  const { data: personsData, isLoading, error } = usePersons();
  const { open, entityId, openModal, closeModal } = useEntityModal('person');

  // Filter persons by IDs
  const persons = personsData?.items.filter((p) => personIds.includes(p.id)) || [];

  // Don't render if no person IDs
  if (!personIds || personIds.length === 0) {
    return null;
  }

  return (
    <>
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recipients ({personIds.length})
            </h3>
            {onEditClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="min-h-[44px] min-w-[44px]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">
                Failed to load recipients. Please try again.
              </p>
            </div>
          )}

          {/* Recipients Grid/Scroll */}
          {!isLoading && !error && persons.length > 0 && (
            <div className={cn(
              // Mobile: horizontal scroll
              'flex gap-2 overflow-x-auto pb-2',
              'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
              // Desktop: grid layout
              'md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:overflow-visible'
            )}>
              {persons.map((person) => (
                <PersonMiniCard
                  key={person.id}
                  person={person}
                  onClick={() => openModal(String(person.id))}
                />
              ))}
            </div>
          )}

          {/* Empty State (if IDs exist but persons not found) */}
          {!isLoading && !error && persons.length === 0 && personIds.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Recipients could not be found.
              </p>
            </div>
          )}
        </CardContent>
      </section>

      {/* Person Detail Modal */}
      <PersonDetailModal
        personId={entityId}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
      />
    </>
  );
}
