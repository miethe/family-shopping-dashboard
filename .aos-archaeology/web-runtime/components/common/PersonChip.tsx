/**
 * PersonChip Component
 *
 * Mini-card/chip for displaying a person with avatar and name.
 * Used in multi-select scenarios with selected/unselected states.
 *
 * Features:
 * - Small Avatar (24px, "xs" size)
 * - Person name display
 * - Selected/unselected visual states
 * - Tooltip with person details (PersonSnapshotCard integration ready)
 * - 44px minimum touch target for mobile
 * - Soft Modernity design system compliant
 */

'use client';

import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PersonSnapshotCard } from './PersonSnapshotCard';
import type { Person } from '@/types';

export interface PersonChipProps {
  person: Person;
  selected?: boolean;
  onToggle?: (id: number) => void;
  showTooltip?: boolean;
  className?: string;
}

/**
 * PersonChip
 *
 * Displays a person as a compact chip with avatar and name.
 * Supports selection states and tooltip on hover.
 *
 * @example
 * ```tsx
 * <PersonChip
 *   person={person}
 *   selected={selectedIds.includes(person.id)}
 *   onToggle={(id) => handleToggleSelection(id)}
 * />
 * ```
 */
export function PersonChip({
  person,
  selected = false,
  onToggle,
  showTooltip = true,
  className,
}: PersonChipProps) {
  const handleClick = () => {
    if (onToggle) {
      onToggle(person.id);
    }
  };

  const chipContent = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!onToggle}
      className={cn(
        // Base styles
        'inline-flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all',
        'min-h-[44px]', // Mobile touch target
        // Unselected state
        !selected && 'bg-muted/50 hover:bg-muted border border-transparent',
        // Selected state
        selected && 'bg-primary/10 border-primary/30 ring-1 ring-primary/20',
        // Disabled state
        !onToggle && 'cursor-default opacity-60',
        className
      )}
      aria-label={`${selected ? 'Deselect' : 'Select'} ${person.display_name}`}
      aria-pressed={selected}
    >
      {/* Avatar */}
      <Avatar size="xs" ariaLabel={person.display_name}>
        {person.photo_url && (
          <AvatarImage src={person.photo_url} alt={person.display_name} />
        )}
        <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
      </Avatar>

      {/* Name */}
      <span className="text-sm font-medium text-gray-900 truncate">
        {person.display_name}
      </span>
    </button>
  );

  // If tooltip is disabled, return chip only
  if (!showTooltip) {
    return chipContent;
  }

  // Wrap with tooltip
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{chipContent}</TooltipTrigger>
        <TooltipContent className="p-0">
          <PersonSnapshotCard person={person} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
