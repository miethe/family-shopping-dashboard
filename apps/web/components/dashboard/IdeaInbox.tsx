/**
 * Idea Inbox
 *
 * Shows suggested gift ideas with "Add to List" buttons
 */

'use client';

import Image from 'next/image';
import { Button } from '@/components/ui';

// Mock data for now - replace with real data when available
const mockIdeas = [
  {
    id: '1',
    name: 'Wireless Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Smart Watch',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Coffee Maker',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=100&h=100&fit=crop',
  },
];

export function IdeaInbox() {
  const handleAddToList = (ideaId: string) => {
    // TODO: Implement add to list functionality
    console.log('Add to list:', ideaId);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm h-full">
      <h3 className="text-xl font-bold text-charcoal mb-6 ml-2">Idea Inbox</h3>
      <div className="space-y-4">
        {mockIdeas.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group p-2 hover:bg-white rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                unoptimized
              />
              <span className="text-charcoal font-semibold text-sm truncate">
                {item.name}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => handleAddToList(item.id)}
              className="px-4 py-2 bg-warm-100 text-charcoal text-sm font-bold rounded-full hover:bg-warm-200 transition-colors border-0 min-h-[44px] flex-shrink-0"
            >
              Add to List
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
