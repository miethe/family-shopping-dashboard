/**
 * New Occasion Page
 *
 * Allows users to create a new occasion with name, type, date, and optional description.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCreateOccasion } from '@/hooks/useOccasion';
import { useToast } from '@/components/ui/use-toast';
import { OccasionType } from '@/types';
import type { OccasionCreate, RecurrenceRule } from '@/types';

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

export default function NewOccasionPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState<OccasionType>(OccasionType.HOLIDAY);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [subtype, setSubtype] = useState<string>('custom');
  const [recurrenceMonth, setRecurrenceMonth] = useState<number | null>(null);
  const [recurrenceDay, setRecurrenceDay] = useState<number | null>(null);

  const { mutate, isPending } = useCreateOccasion();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      return;
    }

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

    const occasionData: OccasionCreate = {
      name: name.trim(),
      type,
      date,
      description: description.trim() || undefined,
      recurrence_rule,
      is_active: true,
      subtype: type === OccasionType.RECURRING ? subtype : null,
    };

    mutate(occasionData, {
      onSuccess: (occasion) => {
        toast({
          title: 'Occasion created!',
          description: `${occasion.name} has been added.`,
          variant: 'success',
        });
        router.push('/occasions');
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to create occasion',
          description: err.message || 'An error occurred while creating the occasion.',
          variant: 'error',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Occasion"
        subtitle="Create a new occasion"
        backHref="/occasions"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Occasions', href: '/occasions' },
          { label: 'Add Occasion' }
        ]}
      />

      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter occasion name"
            />

            <Select
              label="Type"
              value={type}
              onChange={(value) => setType(value as OccasionType)}
              options={OCCASION_TYPES}
              required
            />

            {type === OccasionType.RECURRING && (
              <Select
                label="Recurring Type"
                value={subtype}
                onChange={setSubtype}
                options={RECURRING_SUBTYPES}
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
            />

            {type === 'recurring' && subtype === 'custom' && (
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
              <label className="block text-sm font-medium mb-2">
                Description
                <span className="text-gray-400 ml-1">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this occasion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending || !name.trim() || !date}
              className="w-full"
            >
              {isPending ? 'Creating...' : 'Create Occasion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
