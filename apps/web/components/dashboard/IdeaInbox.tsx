/**
 * Idea Inbox
 *
 * Shows suggested gift ideas with "Add to List" buttons
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { GiftImage } from '@/components/common/GiftImage';
import { useIdeaInbox, type IdeaItem } from '@/hooks/useIdeas';
import { AddToListModal } from '@/components/modals/AddToListModal';
import { formatDistanceToNow } from 'date-fns';

export function IdeaInbox() {
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useIdeaInbox(10);

  const handleAddToList = (idea: IdeaItem) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedIdea(null);
  };

  const handleSuccess = () => {
    // Modal will handle closing and showing success toast
  };

  return (
    <>
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm h-full">
        <h3 className="text-xl font-bold text-charcoal mb-6 ml-2">Idea Inbox</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-warm-600 text-sm">Failed to load ideas</p>
          </div>
        ) : !data || data.ideas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-warm-600 text-sm">No ideas yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex items-center justify-between group p-2 hover:bg-white rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <GiftImage
                    src={idea.image_url}
                    alt={idea.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    fallbackClassName="w-12 h-12 rounded-xl flex-shrink-0"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-charcoal font-semibold text-sm truncate block">
                      {idea.name}
                    </span>
                    <span className="text-warm-600 text-xs">
                      {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddToList(idea)}
                  className="px-4 py-2 bg-warm-100 text-charcoal text-sm font-bold rounded-full hover:bg-warm-200 transition-colors border-0 min-h-[44px] flex-shrink-0"
                >
                  Add to List
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        idea={selectedIdea}
        onSuccess={handleSuccess}
      />
    </>
  );
}
