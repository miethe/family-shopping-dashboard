/**
 * Select Component
 *
 * Dropdown select component using Radix UI primitives
 * Follows the design system with mobile-first touch targets (44px minimum)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  className,
}: SelectProps) {
  const selectId = id || name;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-warm-800 uppercase tracking-wide"
        >
          {label}
          {required && <span className="text-status-warning-600 ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={cn(
          // Base styles
          'w-full rounded-medium border transition-all duration-200',
          'px-4 py-3 text-sm font-medium',
          'min-h-[44px]', // Mobile touch target
          'appearance-none bg-white',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',

          // Normal state
          'border-border-light text-warm-900',
          'bg-warm-50',

          // Focus state
          'focus:border-warm-400 focus:ring-warm-200',

          // Error state
          error && 'border-status-warning-500 focus:border-status-warning-600 focus:ring-status-warning-100',

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed bg-warm-100',

          // Hover state
          !disabled && 'hover:border-warm-300'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p className="text-xs text-warm-600 mt-1.5">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-status-warning-700 mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
