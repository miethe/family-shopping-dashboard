/**
 * GiftForm Component
 *
 * Reusable form component for creating and editing gifts.
 * Supports two modes: Create (empty form) and Edit (pre-filled).
 * Features URL detection with auto-populate, validation, and image preview.
 */

'use client';

import { useState, useEffect } from 'react';
import { Gift, GiftCreate, GiftUpdate, GiftPriority } from '@/types';
import { useCreateGift, useUpdateGift, useGiftFromUrl } from '@/hooks/useGifts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { UrlListInput } from '@/components/common/UrlListInput';
import { StoreMultiSelect } from '@/components/gifts/StoreMultiSelect';
import { PeopleMultiSelect } from '@/components/common/PeopleMultiSelect';
import { cn } from '@/lib/utils';

export interface GiftFormProps {
  /** If provided, form operates in edit mode with pre-filled data */
  gift?: Gift;
  /** Callback fired on successful create/update */
  onSuccess?: (gift: Gift) => void;
  /** Callback fired when user cancels */
  onCancel?: () => void;
}

const GIFT_SOURCES = ['Amazon', 'Target', 'Etsy', 'Other'] as const;

export function GiftForm({ gift, onSuccess, onCancel }: GiftFormProps) {
  const isEditMode = !!gift;

  // Mutations - always call hooks unconditionally
  const createMutation = useCreateGift();
  // Always call useUpdateGift with a fallback ID (0) to satisfy hooks rules
  // We'll only actually use it if gift exists
  const updateMutation = useUpdateGift(gift?.id || 0);
  const urlMutation = useGiftFromUrl();

  // Form state
  const [formData, setFormData] = useState<GiftCreate>({
    name: gift?.name || '',
    url: gift?.url || '',
    price: gift?.price || undefined,
    image_url: gift?.image_url || '',
    source: gift?.source || '',
    description: gift?.description || '',
    notes: gift?.notes || '',
    priority: gift?.priority || GiftPriority.MEDIUM,
    quantity: gift?.quantity || 1,
    sale_price: gift?.sale_price || undefined,
    purchase_date: gift?.purchase_date || undefined,
    additional_urls: gift?.additional_urls || [],
    store_ids: gift?.stores?.map(s => s.id) || [],
    person_ids: gift?.person_ids || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GiftCreate, string>>>({});
  const [urlInput, setUrlInput] = useState(gift?.url || '');
  const [showUrlDetection, setShowUrlDetection] = useState(false);

  // Detect if user enters a URL
  useEffect(() => {
    if (!urlInput) {
      setShowUrlDetection(false);
      return;
    }

    try {
      const url = new URL(urlInput);
      // Show URL detection if valid URL and not in edit mode
      if (!isEditMode && (url.protocol === 'http:' || url.protocol === 'https:')) {
        setShowUrlDetection(true);
      }
    } catch {
      setShowUrlDetection(false);
    }
  }, [urlInput, isEditMode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GiftCreate, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.url) {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (formData.price !== undefined && formData.price !== null) {
      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle auto-populate from URL
  const handleAutoPopulate = async () => {
    if (!urlInput) return;

    try {
      const giftData = await urlMutation.mutateAsync(urlInput);

      // Update form with fetched data
      setFormData({
        name: giftData.name,
        url: giftData.url || urlInput,
        price: giftData.price,
        image_url: giftData.image_url || '',
        source: giftData.source || '',
      });

      setShowUrlDetection(false);

      toast({
        title: 'Gift details loaded',
        description: 'Successfully populated gift information from URL',
      });
    } catch (error) {
      toast({
        title: 'Failed to load gift details',
        description: error instanceof Error ? error.message : 'Could not fetch gift information from URL',
        variant: 'error',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let result: Gift;

      if (isEditMode && gift) {
        // Edit mode: only send changed fields
        const updates: GiftUpdate = {};
        if (formData.name !== gift.name) updates.name = formData.name;
        if (formData.url !== gift.url) updates.url = formData.url || undefined;
        if (formData.price !== gift.price) updates.price = formData.price;
        if (formData.image_url !== gift.image_url) updates.image_url = formData.image_url || undefined;
        if (formData.source !== gift.source) updates.source = formData.source || undefined;
        if (formData.description !== gift.description) updates.description = formData.description || undefined;
        if (formData.notes !== gift.notes) updates.notes = formData.notes || undefined;
        if (formData.priority !== gift.priority) updates.priority = formData.priority;
        if (formData.quantity !== gift.quantity) updates.quantity = formData.quantity;
        if (formData.sale_price !== gift.sale_price) updates.sale_price = formData.sale_price;
        if (formData.purchase_date !== gift.purchase_date) updates.purchase_date = formData.purchase_date;
        if (JSON.stringify(formData.additional_urls) !== JSON.stringify(gift.additional_urls)) {
          updates.additional_urls = formData.additional_urls;
        }
        if (JSON.stringify(formData.store_ids) !== JSON.stringify(gift.stores?.map(s => s.id) || [])) {
          updates.store_ids = formData.store_ids;
        }
        if (JSON.stringify(formData.person_ids) !== JSON.stringify(gift.person_ids)) {
          updates.person_ids = formData.person_ids;
        }

        result = await updateMutation.mutateAsync(updates);

        toast({
          title: 'Gift updated',
          description: 'Gift has been successfully updated',
        });
      } else {
        // Create mode
        result = await createMutation.mutateAsync(formData);

        toast({
          title: 'Gift created',
          description: 'New gift has been added',
        });
      }

      onSuccess?.(result);
    } catch (error) {
      toast({
        title: isEditMode ? 'Failed to update gift' : 'Failed to create gift',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  // Field change handlers
  const handleFieldChange = (field: keyof GiftCreate, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || urlMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <Input
        label="Gift Name"
        placeholder="e.g., LEGO Star Wars Set"
        value={formData.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        error={errors.name}
        required
        disabled={isLoading}
      />

      {/* URL Input with Detection */}
      <div>
        <Input
          label="Product URL"
          placeholder="https://..."
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            handleFieldChange('url', e.target.value);
          }}
          error={errors.url}
          helperText="Optional - link to product page"
          disabled={isLoading}
        />

        {showUrlDetection && (
          <div className="mt-3 p-3 bg-primary-50 border-2 border-primary-200 rounded-medium">
            <p className="text-sm text-primary-900 mb-2">
              Auto-populate gift details from this URL?
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleAutoPopulate}
              isLoading={urlMutation.isPending}
              disabled={urlMutation.isPending}
              className="w-full sm:w-auto"
            >
              {urlMutation.isPending ? 'Loading...' : 'Fetch Gift Details'}
            </Button>
          </div>
        )}
      </div>

      {/* Price Input */}
      <Input
        label="Price"
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
        value={formData.price !== undefined && formData.price !== null ? formData.price : ''}
        onChange={(e) => {
          const value = e.target.value ? parseFloat(e.target.value) : undefined;
          handleFieldChange('price', value);
        }}
        error={errors.price}
        helperText="Optional - estimated or actual price"
        disabled={isLoading}
      />

      {/* Image URL Input with Preview */}
      <div>
        <Input
          label="Image URL"
          placeholder="https://..."
          type="url"
          value={formData.image_url || ''}
          onChange={(e) => handleFieldChange('image_url', e.target.value)}
          error={errors.image_url}
          helperText="Optional - direct link to product image"
          disabled={isLoading}
        />

        {/* Image Preview */}
        {formData.image_url && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-warm-800 uppercase tracking-wide mb-2">
              Preview
            </p>
            <div className="relative w-32 h-32 rounded-medium overflow-hidden border-2 border-border-medium bg-warm-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.image_url}
                alt="Gift preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Show fallback icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-warm-400">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Source Dropdown */}
      <div>
        <label htmlFor="source" className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
          Source
        </label>
        <select
          id="source"
          value={formData.source || ''}
          onChange={(e) => handleFieldChange('source', e.target.value)}
          disabled={isLoading}
          className={cn(
            'w-full px-4 py-3 bg-white text-base text-warm-900 font-normal',
            'min-h-[44px]',
            'border-2 border-border-medium rounded-medium shadow-subtle',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'transition-all duration-200 ease-out',
            'disabled:bg-warm-100 disabled:text-warm-500 disabled:border-warm-300 disabled:cursor-not-allowed'
          )}
        >
          <option value="">Select a source (optional)</option>
          {GIFT_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-warm-600">
          Optional - where to purchase this gift
        </p>
      </div>

      {/* Description Textarea */}
      <Textarea
        label="Description"
        placeholder="Describe the gift..."
        value={formData.description || ''}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        rows={3}
        helperText="Optional - detailed description of the gift"
        disabled={isLoading}
      />

      {/* Notes Textarea (internal) */}
      <Textarea
        label="Notes (Internal)"
        placeholder="Private notes about this gift..."
        value={formData.notes || ''}
        onChange={(e) => handleFieldChange('notes', e.target.value)}
        rows={2}
        helperText="Optional - private notes for your reference only"
        disabled={isLoading}
      />

      {/* Priority & Quantity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={formData.priority || GiftPriority.MEDIUM}
          onChange={(value) => handleFieldChange('priority', value as GiftPriority)}
          options={[
            { value: GiftPriority.LOW, label: 'Low' },
            { value: GiftPriority.MEDIUM, label: 'Medium' },
            { value: GiftPriority.HIGH, label: 'High' },
          ]}
          disabled={isLoading}
        />
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={formData.quantity || 1}
          onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
          helperText="How many items"
          disabled={isLoading}
        />
      </div>

      {/* Sale Price */}
      <Input
        label="Sale Price"
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
        value={formData.sale_price !== undefined && formData.sale_price !== null ? formData.sale_price : ''}
        onChange={(e) => {
          const value = e.target.value ? parseFloat(e.target.value) : undefined;
          handleFieldChange('sale_price', value);
        }}
        helperText="Optional - discounted or sale price"
        disabled={isLoading}
      />

      {/* Purchase Date */}
      <Input
        label="Purchase Date"
        type="date"
        value={formData.purchase_date || ''}
        onChange={(e) => handleFieldChange('purchase_date', e.target.value || undefined)}
        helperText="Optional - when the gift was purchased"
        disabled={isLoading}
      />

      {/* Additional URLs */}
      <UrlListInput
        label="Additional URLs"
        value={formData.additional_urls || []}
        onChange={(urls) => setFormData(prev => ({ ...prev, additional_urls: urls }))}
        helperText="Add more product links or references"
        disabled={isLoading}
      />

      {/* Stores Multi-Select */}
      <StoreMultiSelect
        label="Stores"
        value={formData.store_ids || []}
        onChange={(ids) => setFormData(prev => ({ ...prev, store_ids: ids }))}
        stores={gift?.stores}
        helperText="Select stores where this gift can be purchased"
      />

      {/* People Multi-Select */}
      <div>
        <label className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
          For (People)
        </label>
        <PeopleMultiSelect
          value={formData.person_ids || []}
          onChange={(ids) => setFormData(prev => ({ ...prev, person_ids: ids }))}
        />
        <p className="mt-1.5 text-xs text-warm-600">
          Optional - who is this gift for
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="flex-1 sm:flex-initial"
        >
          {isLoading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
            ? 'Update Gift'
            : 'Create Gift'}
        </Button>
      </div>
    </form>
  );
}
