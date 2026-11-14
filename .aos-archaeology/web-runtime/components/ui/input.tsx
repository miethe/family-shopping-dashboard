import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    // Generate ID unconditionally (hooks must be called in same order)
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide"
          >
            {label}
            {props.required && <span className="text-status-warning-600 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            // Base
            'w-full px-4 py-3 bg-white text-base text-warm-900 font-normal',
            'placeholder:text-warm-400',
            'min-h-[44px]', // Touch target
            // Border
            'border-2 border-border-medium rounded-medium shadow-subtle',
            // Focus
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            // Transitions
            'transition-all duration-200 ease-out',
            // Error state
            error && 'border-status-warning-500 focus:ring-status-warning-200',
            // Disabled
            'disabled:bg-warm-100 disabled:text-warm-500 disabled:border-warm-300 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-status-warning-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-warm-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
