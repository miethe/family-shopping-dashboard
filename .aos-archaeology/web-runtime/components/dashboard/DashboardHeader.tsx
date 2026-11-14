/**
 * Dashboard Header
 *
 * Shows occasion title and people carousel with navigation
 */

'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/layout/icons';
import { OccasionDetailModal } from '@/components/modals/OccasionDetailModal';
import type { DashboardOccasionSummary, PersonSummaryDashboard } from '@/types';

interface DashboardHeaderProps {
  occasion?: DashboardOccasionSummary;
  people: PersonSummaryDashboard[];
}

export function DashboardHeader({ occasion, people }: DashboardHeaderProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const maxScroll = Math.max(0, people.length - 4);

  const handleScrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const handleScrollRight = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + 1));
  };

  // Generate a deterministic color for each person based on their ID
  const getColorRing = (id: number) => {
    const colors = ['#E07A5F', '#81B29A', '#DDBEA9', '#F4A261', '#E76F51', '#2A9D8F'];
    return colors[id % colors.length];
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Occasion Title */}
        <div>
          {occasion ? (
            <button
              onClick={() => setIsOccasionModalOpen(true)}
              className="text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
            >
              <h1 className="text-4xl md:text-display-small font-extrabold text-charcoal tracking-tight">
                {occasion.name}{' '}
                <span className="text-salmon">{formatDate(occasion.date)}</span>
              </h1>
              <p className="text-sm text-warm-600 mt-1">
                {occasion.days_until === 0 ? 'Today!' : occasion.days_until === 1 ? '1 day left' : `${occasion.days_until} days left`}
              </p>
            </button>
          ) : (
            <div>
              <h1 className="text-4xl md:text-display-small font-extrabold text-charcoal tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-warm-600 mt-1">
                No upcoming occasions in the next 90 days
              </p>
            </div>
          )}
        </div>

      {/* People Carousel */}
      {people.length > 0 && (
        <div className="flex items-center gap-3 md:gap-4 bg-white/40 backdrop-blur-sm p-2 rounded-full pl-4 md:pl-6 shadow-subtle">
          <span className="text-xs md:text-sm font-bold text-charcoal/70 mr-1 md:mr-2 hidden sm:inline">
            People Needing Gifts
          </span>

          {/* Left Arrow */}
          {people.length > 4 && (
            <button
              onClick={handleScrollLeft}
              disabled={scrollPosition === 0}
              className="p-1 hover:bg-white rounded-full transition-colors text-charcoal/40 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}

          {/* Avatar Grid */}
          <div className="flex -space-x-2 overflow-hidden">
            {people.slice(scrollPosition, scrollPosition + 4).map((person) => (
              <div
                key={person.id}
                className="flex flex-col items-center group cursor-pointer relative"
              >
                <div className="p-[3px] rounded-full bg-white shadow-sm z-10 transition-transform group-hover:-translate-y-1">
                  <div
                    className="w-12 h-12 rounded-full p-[2px]"
                    style={{ backgroundColor: getColorRing(person.id) }}
                  >
                    <Avatar size="md" className="w-full h-full border-2 border-white">
                      {person.photo_url && (
                        <AvatarImage src={person.photo_url} alt={person.display_name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {getInitials(person.display_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {people.length > 4 && (
            <button
              onClick={handleScrollRight}
              disabled={scrollPosition >= maxScroll}
              className="p-1 hover:bg-white rounded-full transition-colors text-charcoal/40 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      </div>

      {/* Occasion Detail Modal */}
      <OccasionDetailModal
        occasionId={occasion?.id ? String(occasion.id) : null}
        open={isOccasionModalOpen}
        onOpenChange={setIsOccasionModalOpen}
      />
    </>
  );
}
