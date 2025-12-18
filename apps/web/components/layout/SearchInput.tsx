'use client';

import { useState } from 'react';
import { SearchIcon, XIcon } from './icons';

export interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Search input component with glassmorphism styling
 * - Expandable on mobile (optional)
 * - Clear button when input has value
 * - Design System V2 styled with warm colors
 * - 44px minimum touch target for mobile
 *
 * Usage:
 * <SearchInput
 *   placeholder="Search gifts..."
 *   onSearch={(query) => console.log(query)}
 * />
 */
export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  className = '',
  autoFocus = false,
}: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Search Icon */}
        <SearchIcon className="absolute left-3 w-5 h-5 text-warm-500 dark:text-warm-400 pointer-events-none" />

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            w-full
            min-h-[44px] h-11
            pl-10 pr-10
            bg-white/70 dark:bg-warm-900/50
            backdrop-blur-xl
            border border-white/20 dark:border-warm-700/30
            rounded-large
            text-body-medium text-warm-900 dark:text-warm-100
            placeholder:text-warm-500 dark:placeholder:text-warm-500
            shadow-subtle
            transition-all duration-200
            focus:outline-none
            focus:ring-2 focus:ring-primary-500/30 dark:focus:ring-primary-400/30
            focus:border-primary-500/50 dark:focus:border-primary-400/50
            hover:bg-white/80 dark:hover:bg-warm-900/60
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-1
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              text-warm-500 hover:text-warm-700
              dark:text-warm-400 dark:hover:text-warm-200
              rounded-full
              hover:bg-warm-200/50 dark:hover:bg-warm-700/50
              transition-all duration-200
              active:scale-95
            "
            aria-label="Clear search"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
