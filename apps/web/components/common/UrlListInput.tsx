/**
 * UrlListInput Component
 *
 * Allows adding and managing multiple URLs with add/remove functionality.
 * Features validation, external link preview, and keyboard support.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, XIcon, ExternalLinkIcon } from '@/components/layout/icons';

export interface UrlListInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function UrlListInput({
  value,
  onChange,
  placeholder = 'https://...',
  label,
  helperText,
  disabled = false,
}: UrlListInputProps) {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    const trimmed = newUrl.trim();

    if (!trimmed) {
      return;
    }

    if (!validateUrl(trimmed)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (value.includes(trimmed)) {
      setError('This URL has already been added');
      return;
    }

    onChange([...value, trimmed]);
    setNewUrl('');
    setError('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
    if (error) setError(''); // Clear error on input change
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Existing URLs */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2 bg-warm-50 border border-border-medium rounded-medium text-sm text-warm-800 truncate">
                {url}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                disabled={disabled}
                className="min-w-[44px] min-h-[44px] p-2"
                aria-label={`Open ${url} in new tab`}
              >
                <ExternalLinkIcon className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="min-w-[44px] min-h-[44px] p-2 text-status-warning-600 hover:text-status-warning-700 hover:bg-status-warning-50"
                aria-label={`Remove ${url}`}
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new URL */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder={placeholder}
            value={newUrl}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            error={error}
            disabled={disabled}
            aria-label="New URL"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={disabled || !newUrl.trim()}
          className="min-w-[44px] min-h-[44px]"
          aria-label="Add URL"
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>

      {helperText && !error && (
        <p className="text-xs text-warm-600">{helperText}</p>
      )}
    </div>
  );
}
