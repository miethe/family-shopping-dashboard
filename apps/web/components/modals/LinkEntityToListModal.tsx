/**
 * LinkEntityToListModal
 *
 * Standardized modal for linking a list to an existing or newly created
 * person/occasion. Uses the same existing/new tab structure as other linkers.
 */

'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useUpdateList } from '@/hooks/useLists';
import { AddPersonModal } from '@/components/people/AddPersonModal';
import { AddOccasionModal } from '@/components/occasions/AddOccasionModal';
import type { Occasion, Person } from '@/types';
import { useToast } from '@/components/ui/use-toast';

type EntityType = 'person' | 'occasion';
type TabMode = 'existing' | 'new';

interface LinkEntityToListModalProps {
  listId: number;
  entityType: EntityType;
  isOpen: boolean;
  onClose: () => void;
  onLinked?: () => void;
}

export function LinkEntityToListModal({
  listId,
  entityType,
  isOpen,
  onClose,
  onLinked,
}: LinkEntityToListModalProps) {
  const { toast } = useToast();
  const updateList = useUpdateList(listId);
  const [activeTab, setActiveTab] = useState<TabMode>('existing');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: personsResponse, isLoading: isLoadingPersons } = usePersons(undefined, { enabled: isOpen });
  const { data: occasionsResponse, isLoading: isLoadingOccasions } = useOccasions(undefined, { enabled: isOpen });

  const options = useMemo(() => {
    if (entityType === 'person') {
      return (personsResponse?.items || []).map((person: Person) => ({
        id: person.id,
        label: person.display_name,
        meta: person.relationship,
      }));
    }

    return (occasionsResponse?.items || []).map((occasion: Occasion) => ({
      id: occasion.id,
      label: occasion.name,
      meta: occasion.date,
    }));
  }, [entityType, occasionsResponse?.items, personsResponse?.items]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const resetState = () => {
    setActiveTab('existing');
    setSelectedId(null);
    setSearchQuery('');
    setError(null);
  };

  const handleLink = async (id: number) => {
    setError(null);

    const payload =
      entityType === 'person'
        ? { person_id: id }
        : { occasion_id: id };

    try {
      await updateList.mutateAsync(payload);
      toast({
        title: 'Linked successfully',
        description: `List updated with ${entityType === 'person' ? 'recipient' : 'occasion'}.`,
      });
      onLinked?.();
      onClose();
      resetState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update the list.';
      setError(message);
    }
  };

  const handleExistingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select an option to link.');
      return;
    }
    handleLink(selectedId);
  };

  const handleCreateSuccess = (entity: Person | Occasion) => {
    handleLink(entity.id);
    setShowCreateModal(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {entityType === 'person' ? 'Link Recipient' : 'Link Occasion'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabMode)}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="existing" className="flex-1">
                Add Existing
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1">
                Create New
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 mb-3">
                {error}
              </div>
            )}

            <TabsContent value="existing" className="space-y-4">
              <Input
                label="Search"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <form onSubmit={handleExistingSubmit} className="space-y-4">
                <div className="border border-slate-200 rounded-lg max-h-[240px] overflow-y-auto divide-y divide-slate-100">
                  {entityType === 'person' && isLoadingPersons && (
                    <div className="p-3 text-center text-slate-500">Loading people...</div>
                  )}
                  {entityType === 'occasion' && isLoadingOccasions && (
                    <div className="p-3 text-center text-slate-500">Loading occasions...</div>
                  )}
                  {!isLoadingPersons && !isLoadingOccasions && filteredOptions.length === 0 && (
                    <div className="p-3 text-center text-slate-500">No matches found.</div>
                  )}
                  {filteredOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="linked-entity"
                        className="h-4 w-4"
                        checked={selectedId === option.id}
                        onChange={() => setSelectedId(option.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{option.label}</div>
                        {option.meta && (
                          <div className="text-xs text-slate-600">{option.meta}</div>
                        )}
                      </div>
                      <Badge variant="default" className="text-xs capitalize">
                        {entityType}
                      </Badge>
                    </label>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Link {entityType === 'person' ? 'Recipient' : 'Occasion'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-slate-700 bg-slate-50">
                <p className="font-medium mb-1">
                  Create a new {entityType === 'person' ? 'person' : 'occasion'}
                </p>
                <p className="text-sm text-slate-600">
                  We&apos;ll link it to this list automatically after creation.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="w-full"
              >
                Create {entityType === 'person' ? 'Person' : 'Occasion'}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {entityType === 'person' && showCreateModal && (
        <AddPersonModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          mode="create"
        />
      )}

      {entityType === 'occasion' && showCreateModal && (
        <AddOccasionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          mode="create"
        />
      )}
    </>
  );
}
