'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift, useDeleteGift } from '@/hooks/useGift';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { GiftDetail, GiftUsage, GiftDetailSkeleton, GiftEditModal } from '@/components/gifts';
import { PencilIcon, TrashIcon } from '@/components/layout/icons';
import { useToast } from '@/components/ui/use-toast';
import { useConfirmDialog } from '@/components/ui';

type Props = {
  params: Promise<{ id: string }>;
};

export default function GiftDetailPage({ params }: Props) {
  const { id } = use(params);
  const giftId = parseInt(id, 10);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: gift, isLoading, error } = useGift(giftId);
  const deleteMutation = useDeleteGift(giftId);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Gift?',
      description: 'Are you sure you want to delete this gift? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
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
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    toast({
      title: 'Success',
      description: 'Gift has been updated successfully.',
      variant: 'success',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading..."
          backHref="/gifts"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Gifts', href: '/gifts' },
            { label: 'Loading...' }
          ]}
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
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Gifts', href: '/gifts' },
            { label: 'Error' }
          ]}
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
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Gifts', href: '/gifts' },
            { label: 'Not Found' }
          ]}
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
    <>
      {dialog}
      <div className="space-y-6">
        <PageHeader
          title={gift.name}
          backHref="/gifts"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Gifts', href: '/gifts' },
            { label: gift.name }
          ]}
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

      {/* Edit Modal */}
      <GiftEditModal
        gift={gift}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
