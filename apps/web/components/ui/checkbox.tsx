import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={inputId}
          className={cn(
            // Base - larger for touch targets
            'w-5 h-5 mt-0.5 flex-shrink-0',
            'min-w-[20px] min-h-[20px]',
            // Colors
            'text-primary-600 bg-white border-2 border-border-medium rounded',
            // Focus
            'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500',
            // Transitions
            'transition-all duration-200 ease-out',
            // Disabled
            'disabled:bg-warm-100 disabled:border-warm-300 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          aria-describedby={helperText ? helperId : undefined}
          {...props}
        />
        {(label || helperText) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={inputId}
                className="block text-sm font-medium text-warm-900 cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {helperText && (
              <p id={helperId} className="mt-0.5 text-xs text-warm-600">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
