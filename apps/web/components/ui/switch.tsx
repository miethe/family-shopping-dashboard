/**
 * Switch Component
 *
 * Toggle switch using Radix UI primitives
 * Follows the design system with mobile-first touch targets (44px minimum)
 */

'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}: SwitchProps) {
  return (
    <div className={cn('flex items-center gap-3 min-h-[44px]', className)}>
      <SwitchPrimitives.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          // Base styles
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',

          // States
          'data-[state=checked]:bg-primary-500',
          'data-[state=unchecked]:bg-warm-300',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
            'data-[state=checked]:translate-x-5',
            'data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitives.Root>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-warm-900 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-warm-600 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
