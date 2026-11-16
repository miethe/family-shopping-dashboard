/**
 * Person Detail Page
 *
 * Displays complete person profile with tabs for info, lists, and history.
 * Mobile-first layout with responsive design and loading states.
 */

'use client';

import { use, useState } from 'react';
import { usePerson, useDeletePerson } from '@/hooks/usePersons';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PersonDetail,
  PersonInfo,
  PersonLists,
  PersonHistory,
} from '@/components/people';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AddPersonModal } from '@/components/people/AddPersonModal';
import { useConfirmDialog, useToast } from '@/components/ui';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Loading skeleton for person detail page
 */
function PersonDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default function PersonDetailPage({ params }: Props) {
  const { id } = use(params);
  const personId = parseInt(id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: person, isLoading, error } = usePerson(personId);
  const deleteMutation = useDeletePerson();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Person?',
      description: 'Are you sure you want to delete this person? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(personId);
      toast({
        title: 'Person deleted',
        description: 'The person has been successfully removed.',
        variant: 'success',
      });
      router.push('/people');
    } catch (error) {
      console.error('Failed to delete person:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete person. Please try again.',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return <PersonDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Error"
          backHref="/people"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'People', href: '/people' },
            { label: 'Error' }
          ]}
        />
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">
            Failed to load person details. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Not Found"
          backHref="/people"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'People', href: '/people' },
            { label: 'Not Found' }
          ]}
        />
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-yellow-800">Person not found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {dialog}
      <div className="space-y-6">
        <PageHeader
          title={person.display_name}
          backHref="/people"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'People', href: '/people' },
            { label: person.display_name }
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          }
        />

        <PersonDetail person={person} />

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <PersonInfo person={person} />
          </TabsContent>

          <TabsContent value="lists">
            <PersonLists personId={person.id} />
          </TabsContent>

          <TabsContent value="history">
            <PersonHistory personId={person.id} />
          </TabsContent>
        </Tabs>

        <AddPersonModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          personToEdit={person}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['person', personId] });
          }}
        />
      </div>
    </>
  );
}
