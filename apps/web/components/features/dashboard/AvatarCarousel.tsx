'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';

interface Person {
  id: string;
  display_name: string;
  avatarUrl?: string;
  giftCount: number;
  needsAttention?: boolean;
}

interface AvatarCarouselProps {
  people: Person[];
  onPersonClick?: (personId: string) => void;
}

export function AvatarCarousel({ people, onPersonClick }: AvatarCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Left Arrow - Desktop only */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface-primary shadow-medium hover:shadow-high transition-shadow"
        aria-label="Scroll left"
      >
        <svg
          className="w-5 h-5 text-warm-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2 py-2 -mx-2"
      >
        {people.map((person) => (
          <button
            key={person.id}
            onClick={() => onPersonClick?.(person.id)}
            className="flex flex-col items-center gap-2 snap-start flex-shrink-0 min-w-[80px] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-medium"
            aria-label={`View ${person.display_name}'s profile`}
          >
            <div className="relative">
              {/* Attention ring - pulsing terracotta */}
              {person.needsAttention && (
                <div
                  className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-status-warning-400 to-status-warning-600 animate-pulse"
                  aria-hidden="true"
                />
              )}
              <Avatar size="lg" badge={person.giftCount > 0 ? person.giftCount : undefined}>
                <AvatarImage src={person.avatarUrl} alt={person.display_name} />
                <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium text-warm-700 text-center truncate max-w-[72px]">
              {person.display_name?.split(' ')[0] || 'User'}
            </span>
          </button>
        ))}
      </div>

      {/* Right Arrow - Desktop only */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface-primary shadow-medium hover:shadow-high transition-shadow"
        aria-label="Scroll right"
      >
        <svg
          className="w-5 h-5 text-warm-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export type { Person, AvatarCarouselProps };
