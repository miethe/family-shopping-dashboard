'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useGift, useDeleteGift } from '@/hooks/useGift';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { GiftDetail, GiftUsage, GiftDetailSkeleton } from '@/components/gifts';
import { PencilIcon, TrashIcon } from '@/components/layout/icons';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  params: Promise<{ id: string }>;
};

export default function GiftDetailPage({ params }: Props) {
  const { id } = use(params);
  const giftId = parseInt(id, 10);
  const router = useRouter();
  const { toast } = useToast();

  const { data: gift, isLoading, error } = useGift(giftId);
  const deleteMutation = useDeleteGift(giftId);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gift? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
      toast({
        title: 'Gift deleted',
        description: 'The gift has been successfully removed.',
        variant: 'success',
      });
      router.push('/gifts');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete gift. Please try again.',
        variant: 'error',
      });
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast({
      title: 'Coming soon',
      description: 'Gift editing will be available in a future update.',
      variant: 'info',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading..."
          backHref="/gifts"
        />
        <GiftDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error"
          backHref="/gifts"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load gift details. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Not Found"
          backHref="/gifts"
        />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Gift not found. It may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={gift.name}
        backHref="/gifts"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="inline-flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </span>
            </Button>
          </div>
        }
      />

      <GiftDetail gift={gift} />

      <GiftUsage giftId={gift.id} />
    </div>
  );
}
