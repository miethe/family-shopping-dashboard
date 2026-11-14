/**
 * PersonDropdown Component
 *
 * Searchable dropdown for selecting persons with inline "Add New Person" option.
 * Supports both single and multi-select modes with compact and default variants.
 *
 * Features:
 * - Search/filter by name
 * - "Add New Person" action at bottom
 * - Inline person creation modal
 * - Mobile: Bottom sheet on small screens
 * - Keyboard navigation (up/down, enter, escape)
 * - Touch targets 44px minimum
 * - Loading/error states
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersons } from '@/hooks/usePersons';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { ChevronDown, Plus, User, X } from '@/components/ui/icons';
import { PersonQuickCreateModal } from '@/components/modals/PersonQuickCreateModal';
import type { Person } from '@/types';

export interface PersonDropdownProps {
  value: number | number[] | null;
  onChange: (value: number | number[] | null) => void;
  label?: string;
  variant?: 'compact' | 'default';
  multiSelect?: boolean;
  allowNew?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * PersonDropdown Component
 *
 * Dropdown selector for choosing one or more persons.
 */
export function PersonDropdown({
  value,
  onChange,
  label,
  variant = 'default',
  multiSelect = false,
  allowNew = true,
  placeholder = 'Select person...',
  error,
  disabled = false,
  className,
}: PersonDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data: personsData, isLoading, error: fetchError } = usePersons();

  // Memoize persons array to maintain stable reference
  const persons = React.useMemo(
    () => personsData?.items ?? [],
    [personsData?.items]
  );

  // Filter persons by search query
  const filteredPersons = React.useMemo(() => {
    if (!searchQuery.trim()) return persons;
    const query = searchQuery.toLowerCase();
    return persons.filter((person) =>
      person.display_name.toLowerCase().includes(query)
    );
  }, [persons, searchQuery]);

  // Get selected persons
  const selectedPersons = React.useMemo(() => {
    if (multiSelect && Array.isArray(value)) {
      return persons.filter((p) => value.includes(p.id));
    } else if (!multiSelect && typeof value === 'number') {
      return persons.filter((p) => p.id === value);
    }
    return [];
  }, [persons, value, multiSelect]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery('');
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (person: Person) => {
    if (multiSelect) {
      const currentValue = Array.isArray(value) ? value : [];
      const isSelected = currentValue.includes(person.id);

      if (isSelected) {
        onChange(currentValue.filter((id) => id !== person.id));
      } else {
        onChange([...currentValue, person.id]);
      }
    } else {
      onChange(person.id);
      setIsOpen(false);
    }
  };

  const handleRemove = (personId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (multiSelect && Array.isArray(value)) {
      onChange(value.filter((id) => id !== personId));
    } else {
      onChange(null);
    }
  };

  const handleAddNew = () => {
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  const handlePersonCreated = (person: Person) => {
    // Add newly created person to selection
    if (multiSelect) {
      const currentValue = Array.isArray(value) ? value : [];
      onChange([...currentValue, person.id]);
    } else {
      onChange(person.id);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    const totalOptions = filteredPersons.length + (allowNew ? 1 : 0);

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          if (focusedIndex < filteredPersons.length) {
            handleSelect(filteredPersons[focusedIndex]);
          } else if (allowNew) {
            handleAddNew();
          }
        }
        break;
    }
  };

  // Variant-specific styles
  const heightClass = variant === 'compact' ? 'min-h-[32px]' : 'min-h-[44px]';
  const paddingClass = variant === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';
  const textClass = variant === 'compact' ? 'text-xs' : 'text-sm';

  return (
    <>
      <div className={cn('relative', className)} ref={dropdownRef}>
        {label && (
          <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide mb-2">
            {label}
          </label>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full rounded-medium border transition-all duration-200',
            'flex items-center justify-between gap-2',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            heightClass,
            paddingClass,
            textClass,

            // Normal state
            'border-border-light text-warm-900 bg-warm-50',

            // Focus state
            'focus:border-warm-400 focus:ring-warm-200',

            // Error state
            error && 'border-status-warning-500 focus:border-status-warning-600 focus:ring-status-warning-100',

            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed bg-warm-100',

            // Hover state
            !disabled && 'hover:border-warm-300'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label || 'Select person'}
        >
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            {selectedPersons.length === 0 ? (
              <span className="text-warm-500">{placeholder}</span>
            ) : multiSelect ? (
              <div className="flex flex-wrap gap-1">
                {selectedPersons.map((person) => (
                  <span
                    key={person.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-small text-xs font-medium"
                  >
                    <span className="truncate max-w-[120px]">{person.display_name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(person.id, e)}
                      className="hover:text-primary-900 min-h-[20px] min-w-[20px] flex items-center justify-center"
                      aria-label={`Remove ${person.display_name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar size="xs">
                  {selectedPersons[0].photo_url && (
                    <AvatarImage src={selectedPersons[0].photo_url} alt={selectedPersons[0].display_name} />
                  )}
                  <AvatarFallback>{getInitials(selectedPersons[0].display_name)}</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">{selectedPersons[0].display_name}</span>
              </div>
            )}
          </div>

          <ChevronDown
            className={cn(
              'w-4 h-4 text-warm-600 transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-status-warning-700 mt-1.5" role="alert">
            {error}
          </p>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-2 w-full',
              'bg-white border border-warm-200 rounded-large shadow-diffused',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
              'max-h-[300px] overflow-hidden flex flex-col',
              // Mobile: Bottom sheet on small screens
              'md:relative md:top-auto',
              'fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto',
              'rounded-t-large md:rounded-large'
            )}
            role="listbox"
            aria-label="Select person"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-warm-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search persons..."
                className={cn(
                  'w-full px-3 py-2 rounded-medium border border-warm-200',
                  'text-sm text-warm-900 placeholder-warm-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'min-h-[44px]'
                )}
                aria-label="Search persons"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-warm-600">
                Loading persons...
              </div>
            )}

            {/* Error State */}
            {fetchError && (
              <div className="p-4 text-center text-sm text-status-warning-700">
                Failed to load persons
              </div>
            )}

            {/* Person List */}
            {!isLoading && !fetchError && (
              <div className="overflow-y-auto flex-1">
                {filteredPersons.length === 0 ? (
                  <div className="p-4 text-center text-sm text-warm-600">
                    No persons found
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredPersons.map((person, index) => {
                      const isSelected = multiSelect
                        ? Array.isArray(value) && value.includes(person.id)
                        : value === person.id;
                      const isFocused = focusedIndex === index;

                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => handleSelect(person)}
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            'w-full px-3 py-2 flex items-center gap-3',
                            'transition-colors duration-200',
                            'hover:bg-warm-100',
                            'min-h-[44px]',
                            isSelected && 'bg-primary-50',
                            isFocused && 'bg-warm-100'
                          )}
                        >
                          <Avatar size="sm">
                            {person.photo_url && (
                              <AvatarImage src={person.photo_url} alt={person.display_name} />
                            )}
                            <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 text-left overflow-hidden">
                            <div className="font-medium text-sm text-warm-900 truncate">
                              {person.display_name}
                            </div>
                            {person.relationship && (
                              <div className="text-xs text-warm-600 truncate">
                                {person.relationship}
                              </div>
                            )}
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add New Person Action */}
            {allowNew && !isLoading && !fetchError && (
              <button
                type="button"
                onClick={handleAddNew}
                className={cn(
                  'w-full px-3 py-3 flex items-center gap-3',
                  'border-t border-warm-200',
                  'hover:bg-primary-50 transition-colors duration-200',
                  'text-primary-600 font-medium text-sm',
                  'min-h-[44px]',
                  focusedIndex === filteredPersons.length && 'bg-primary-50'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-primary-600" />
                </div>
                <span>Add New Person</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Person Quick Create Modal */}
      <PersonQuickCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePersonCreated}
      />
    </>
  );
}
