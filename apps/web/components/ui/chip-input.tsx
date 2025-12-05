/**
 * ChipInput Component
 *
 * Multi-select chip input for tags/categories
 * Supports predefined options with autocomplete and custom values
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { X } from './icons';

export interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  maxVisible?: number;
  className?: string;
}

// Helper to format slug values to display labels
function formatLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ChipInput({
  value,
  onChange,
  options = [],
  placeholder = 'Type to add...',
  label,
  helperText,
  disabled = false,
  maxVisible = 10,
  className,
}: ChipInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  // Filter suggestions based on input
  const suggestions = options.filter(
    (option) =>
      !value.includes(option) &&
      option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleAdd = (newValue: string) => {
    const trimmed = newValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemove = (toRemove: string) => {
    onChange(value.filter((v) => v !== toRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last chip on backspace when input is empty
      handleRemove(value[value.length - 1]);
    }
  };

  const visibleChips = showAll ? value : value.slice(0, maxVisible);
  const overflowCount = value.length - maxVisible;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {/* Chips Display */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleChips.map((chip) => (
              <Badge
                key={chip}
                variant="default"
                className="text-xs px-2 py-1 pr-1 flex items-center gap-1"
              >
                {formatLabel(chip)}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(chip)}
                    className="ml-1 rounded-full p-0.5 hover:bg-warm-200 transition-colors min-h-[20px] min-w-[20px] flex items-center justify-center"
                    aria-label={`Remove ${formatLabel(chip)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!showAll && overflowCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-xs px-2 py-1 text-primary-600 hover:text-primary-700 font-medium min-h-[44px]"
              >
                +{overflowCount} more
              </button>
            )}
            {showAll && value.length > maxVisible && (
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-xs px-2 py-1 text-primary-600 hover:text-primary-700 font-medium min-h-[44px]"
              >
                Show less
              </button>
            )}
          </div>
        )}

        {/* Input Field */}
        {!disabled && (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => {
                // Delay to allow clicking suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full px-4 py-3 bg-white text-sm text-warm-900',
                'border-2 border-border-medium rounded-medium shadow-subtle',
                'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
                'transition-all duration-200 ease-out',
                'min-h-[44px]',
                'disabled:bg-warm-100 disabled:cursor-not-allowed'
              )}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-border-medium rounded-medium shadow-medium max-h-48 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAdd(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm text-warm-900 hover:bg-warm-50 transition-colors min-h-[44px]"
                  >
                    {formatLabel(suggestion)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-warm-600">{helperText}</p>
      )}
    </div>
  );
}
