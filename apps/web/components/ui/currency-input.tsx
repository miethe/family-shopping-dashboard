import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  error?: string;
  helperText?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const [displayValue, setDisplayValue] = React.useState<string>('');

    // Update display value when external value changes
    React.useEffect(() => {
      if (value === null) {
        setDisplayValue('');
      } else {
        setDisplayValue(value.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow empty input
      if (input === '') {
        setDisplayValue('');
        onChange(null);
        return;
      }

      // Only allow numeric input with optional decimal point
      // Regex allows: digits, single decimal point, and up to 2 decimal places
      const validInput = /^\d*\.?\d{0,2}$/.test(input);

      if (validInput) {
        setDisplayValue(input);

        // Convert to number if valid, otherwise keep as null
        const numValue = parseFloat(input);
        onChange(isNaN(numValue) ? null : numValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format to 2 decimal places on blur if we have a valid number
      if (displayValue && !isNaN(parseFloat(displayValue))) {
        const formatted = parseFloat(displayValue).toFixed(2);
        setDisplayValue(formatted);
        onChange(parseFloat(formatted));
      }

      // Call parent onBlur if provided
      props.onBlur?.(e);
    };

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
        <div className="relative">
          <span
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2',
              'text-base text-warm-600 font-normal pointer-events-none',
              props.disabled && 'text-warm-400'
            )}
          >
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            id={inputId}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              // Base
              'w-full pl-8 pr-4 py-3 bg-white text-base text-warm-900 font-normal',
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
            aria-describedby={cn(error && errorId, helperText && helperId)}
            {...props}
          />
        </div>
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
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
