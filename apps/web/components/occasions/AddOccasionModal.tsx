'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useCreateOccasion, useUpdateOccasion } from '@/hooks/useOccasions';
import { budgetKeys, useBudgetMeter } from '@/hooks/useBudgetMeter';
import { budgetsApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { OccasionType } from '@/types';
import type { Occasion, OccasionCreate, OccasionUpdate, RecurrenceRule } from '@/types';

interface AddOccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (occasion: Occasion) => void;
  mode?: 'create' | 'edit';
  occasionToEdit?: Occasion;
}

// Occasion type options
const OCCASION_TYPES = [
  { value: OccasionType.HOLIDAY, label: 'Holiday' },
  { value: OccasionType.RECURRING, label: 'Recurring' },
  { value: OccasionType.OTHER, label: 'Other' },
];

// Recurring subtype options
const RECURRING_SUBTYPES = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'custom', label: 'Custom Recurring' },
];

// Month options
const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export function AddOccasionModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  occasionToEdit
}: AddOccasionModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<OccasionType>(OccasionType.HOLIDAY);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number | null>(null);
  const [hasInitializedBudget, setHasInitializedBudget] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // New fields for recurring occasions
  const [subtype, setSubtype] = useState<string>('custom');
  const [recurrenceMonth, setRecurrenceMonth] = useState<number | null>(null);
  const [recurrenceDay, setRecurrenceDay] = useState<number | null>(null);

  const createMutation = useCreateOccasion();
  const updateMutation = useUpdateOccasion(occasionToEdit?.id || 0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isEditMode = mode === 'edit';
  const isPending = isSubmitting || (isEditMode ? updateMutation.isPending : createMutation.isPending);
  const shouldLoadBudgetMeter = isEditMode && isOpen && !!occasionToEdit?.id;
  const { data: budgetMeterData } = useBudgetMeter(shouldLoadBudgetMeter ? occasionToEdit?.id : undefined);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && occasionToEdit && isOpen) {
      setName(occasionToEdit.name);
      setType(occasionToEdit.type);
      setDate(occasionToEdit.date);
      setDescription(occasionToEdit.description || '');
      setBudget(occasionToEdit.budget ?? null);
      setHasInitializedBudget(false);
      setSubtype(occasionToEdit.subtype || 'custom');
      setRecurrenceMonth(occasionToEdit.recurrence_rule?.month || null);
      setRecurrenceDay(occasionToEdit.recurrence_rule?.day || null);
    } else if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setType(OccasionType.HOLIDAY);
      setDate('');
      setDescription('');
      setBudget(null);
      setHasInitializedBudget(false);
      setSubtype('custom');
      setRecurrenceMonth(null);
      setRecurrenceDay(null);
    }
  }, [isEditMode, occasionToEdit, isOpen]);

  // Load existing budget_total for edit mode so the currency field stays in sync with backend
  useEffect(() => {
    if (!shouldLoadBudgetMeter || !budgetMeterData || hasInitializedBudget) {
      return;
    }

    const existingBudget = budgetMeterData.budget_total;
    setBudget(existingBudget != null ? Number(existingBudget) : null);
    setHasInitializedBudget(true);
  }, [shouldLoadBudgetMeter, budgetMeterData, hasInitializedBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      return;
    }

    if (budget !== null && budget !== undefined && budget <= 0) {
      toast({
        title: 'Invalid budget',
        description: 'Budget must be greater than zero or left blank.',
        variant: 'error',
      });
      return;
    }

    const setBudgetIfNeeded = async (occasionId: number) => {
      if (budget == null) {
        return null;
      }

      try {
        const meterData = await budgetsApi.setOccasionBudget(occasionId, { budget_amount: budget });
        queryClient.setQueryData(budgetKeys.meter(occasionId), meterData);
        queryClient.invalidateQueries({ queryKey: budgetKeys.warning(occasionId) });
        queryClient.invalidateQueries({ queryKey: budgetKeys.entities(occasionId) });
        queryClient.invalidateQueries({ queryKey: ['occasions', occasionId] });
        return null;
      } catch (err) {
        return err instanceof Error ? err : new Error('Failed to save budget');
      }
    };

    setIsSubmitting(true);

    if (isEditMode && occasionToEdit) {
      // Build recurrence rule from date for birthday/anniversary, or from explicit inputs for custom
      let recurrence_rule: RecurrenceRule | null = null;
      if (type === OccasionType.RECURRING) {
        const dateObj = new Date(date);
        if (subtype === 'birthday' || subtype === 'anniversary') {
          // Auto-generate from date
          recurrence_rule = {
            month: dateObj.getMonth() + 1,
            day: dateObj.getDate(),
          };
        } else if (subtype === 'custom' && recurrenceMonth && recurrenceDay) {
          // Use explicit values
          recurrence_rule = {
            month: recurrenceMonth,
            day: recurrenceDay,
          };
        }
      }

      // Update occasion
      const updateData: OccasionUpdate = {
        name: name.trim(),
        type,
        date,
        description: description.trim() || undefined,
        budget: budget,
        recurrence_rule,
        is_active: true,
        subtype: type === OccasionType.RECURRING ? subtype : null,
      };

      try {
        const occasion = await updateMutation.mutateAsync(updateData);
        const budgetError = await setBudgetIfNeeded(occasion.id);

        if (budgetError) {
          toast({
            title: 'Occasion saved, but budget failed',
            description: budgetError.message || 'Budget could not be saved. Please try again.',
            variant: 'error',
          });
        } else {
          toast({
            title: 'Occasion updated!',
            description: `${occasion.name} has been updated.`,
            variant: 'success',
          });
        }

        // Call callbacks
        onSuccess?.(occasion);
        onClose();
      } catch (err: any) {
        toast({
          title: 'Failed to update occasion',
          description: err.message || 'An error occurred while updating the occasion.',
          variant: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Build recurrence rule from date for birthday/anniversary, or from explicit inputs for custom
      let recurrence_rule: RecurrenceRule | null = null;
      if (type === OccasionType.RECURRING) {
        const dateObj = new Date(date);
        if (subtype === 'birthday' || subtype === 'anniversary') {
          // Auto-generate from date
          recurrence_rule = {
            month: dateObj.getMonth() + 1,
            day: dateObj.getDate(),
          };
        } else if (subtype === 'custom' && recurrenceMonth && recurrenceDay) {
          // Use explicit values
          recurrence_rule = {
            month: recurrenceMonth,
            day: recurrenceDay,
          };
        }
      }

      // Create new occasion
      const occasionData: OccasionCreate = {
        name: name.trim(),
        type,
        date,
        description: description.trim() || undefined,
        budget: budget,
        recurrence_rule,
        is_active: true,
        subtype: type === OccasionType.RECURRING ? subtype : null,
      };

      try {
        const occasion = await createMutation.mutateAsync(occasionData);
        const budgetError = await setBudgetIfNeeded(occasion.id);

        if (budgetError) {
          toast({
            title: 'Occasion created, but budget failed',
            description: budgetError.message || 'Budget could not be saved. Please edit the occasion to retry.',
            variant: 'error',
          });
        } else {
          toast({
            title: 'Occasion created!',
            description: `${occasion.name} has been added.`,
            variant: 'success',
          });
        }

        // Call callbacks
        onSuccess?.(occasion);
        onClose();
      } catch (err: any) {
        toast({
          title: 'Failed to create occasion',
          description: err.message || 'An error occurred while creating the occasion.',
          variant: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setType(OccasionType.HOLIDAY);
    setDate('');
    setDescription('');
    setBudget(null);
    setHasInitializedBudget(false);
    setSubtype('custom');
    setRecurrenceMonth(null);
    setRecurrenceDay(null);
    onClose();
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="occasion"
      title={isEditMode ? "Edit Occasion" : "Add Occasion"}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={isPending || !name.trim() || !date}
          >
            {isPending
              ? (isEditMode ? 'Saving...' : 'Creating...')
              : (isEditMode ? 'Save Changes' : 'Create Occasion')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter occasion name"
          disabled={isPending}
        />

        <Select
          label="Type"
          value={type}
          onChange={(value) => setType(value as OccasionType)}
          options={OCCASION_TYPES}
          disabled={isPending}
          required
        />

        {type === OccasionType.RECURRING && (
          <Select
            label="Recurring Type"
            value={subtype}
            onChange={setSubtype}
            options={RECURRING_SUBTYPES}
            disabled={isPending}
            required
            helperText="Select the type of recurring occasion"
          />
        )}

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          helperText={type === OccasionType.RECURRING && (subtype === 'birthday' || subtype === 'anniversary')
            ? "This date will be used to set the recurring month and day"
            : "When is this occasion?"}
          disabled={isPending}
        />

        {type === OccasionType.RECURRING && subtype === 'custom' && (
          <div className="space-y-4 p-4 bg-warm-50 rounded-medium border border-warm-200">
            <p className="text-xs font-medium text-warm-700 uppercase tracking-wide">Recurrence Pattern</p>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                value={recurrenceMonth?.toString() || ''}
                onChange={(value) => setRecurrenceMonth(parseInt(value))}
                options={MONTHS}
                placeholder="Select month"
                required
              />
              <Input
                label="Day"
                type="number"
                min={1}
                max={31}
                value={recurrenceDay?.toString() || ''}
                onChange={(e) => setRecurrenceDay(parseInt(e.target.value))}
                placeholder="1-31"
                required
              />
            </div>
            <p className="text-xs text-warm-600">
              This occasion will repeat every year on this date.
            </p>
          </div>
        )}

        <div>
          <CurrencyInput
            label="Budget"
            value={budget}
            onChange={(value) => {
              setBudget(value);
              if (!hasInitializedBudget) {
                setHasInitializedBudget(true);
              }
            }}
            placeholder="0.00"
            helperText="Optional: Set a spending limit for this occasion"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-900 mb-2">
            Description
            <span className="text-warm-400 ml-1">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this occasion"
            disabled={isPending}
            className="w-full px-3 py-2 border border-warm-300 rounded-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[100px]"
          />
        </div>
      </form>
    </EntityModal>
  );
}
