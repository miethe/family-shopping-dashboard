/**
 * Occasion Detail Page
 *
 * Displays comprehensive occasion information:
 * - Header with occasion details
 * - Budget progression meter (if budget set)
 * - Associated gift lists
 * - Edit and delete actions
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useOccasion, useDeleteOccasion } from '@/hooks/useOccasion';
import { useBudgetMeter, useBudgetWarning } from '@/hooks/useBudgetMeter';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OccasionDetail, OccasionLists } from '@/components/occasions';
import { AddOccasionModal } from '@/components/occasions/AddOccasionModal';
import { BudgetMeter, BudgetMeterSkeleton, BudgetWarningCard } from '@/components/budget';
import { Card, CardContent } from '@/components/ui/card';

interface OccasionDetailPageProps {
  params: Promise<{ id: string }>;
}

// Format date for page header subtitle
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function OccasionDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Detail card skeleton */}
      <div className="px-4 md:px-6">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>

      {/* Lists skeleton */}
      <div className="px-4 md:px-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function OccasionDetailPage({ params }: OccasionDetailPageProps) {
  const { id } = use(params);
  const occasionId = parseInt(id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: occasion, isLoading, error } = useOccasion(occasionId);
  const deleteMutation = useDeleteOccasion(occasionId);

  // Budget data - only fetch if occasion exists
  const { data: budgetData, isLoading: budgetLoading } = useBudgetMeter(occasionId);
  const { data: warningData } = useBudgetWarning(occasionId);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this occasion? All associated lists will remain but will no longer be linked to this occasion.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
      router.push('/occasions');
    } catch (err) {
      console.error('Failed to delete occasion:', err);
      alert('Failed to delete occasion. Please try again.');
    }
  };

  if (isLoading) {
    return <OccasionDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Occasion</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button variant="outline" onClick={() => router.push('/occasions')}>
              Back to Occasions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!occasion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Occasion Not Found</h2>
            <p className="text-gray-600 mb-4">
              The occasion you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button variant="outline" onClick={() => router.push('/occasions')}>
              Back to Occasions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader
        title={occasion.name}
        subtitle={formatDate(occasion.date)}
        backHref="/occasions"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Occasion Detail Card */}
        <OccasionDetail occasion={occasion} />

        {/* Budget Status Section */}
        {budgetData?.has_budget && (
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Budget Status</h3>
            {budgetLoading ? (
              <BudgetMeterSkeleton />
            ) : (
              <>
                <BudgetMeter data={budgetData} />
                {warningData && warningData.level !== 'none' && (
                  <BudgetWarningCard warning={warningData} className="mt-4" />
                )}
              </>
            )}
          </section>
        )}

        {/* Associated Lists */}
        <OccasionLists occasionId={occasion.id} />
      </div>

      {/* Edit Modal */}
      <AddOccasionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        occasionToEdit={occasion}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['occasion', occasionId] });
        }}
      />
    </div>
  );
}
