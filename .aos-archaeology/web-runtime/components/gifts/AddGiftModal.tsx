/**
 * Add Gift Modal Component
 *
 * Modal dialog wrapper for adding gifts via URL or manual form.
 * Reuses existing UrlGiftForm and ManualGiftForm components with tabs.
 */

'use client';

import { useState } from 'react';
import { EntityModal } from '@/components/modals/EntityModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { UrlGiftForm } from './UrlGiftForm';
import { ManualGiftForm } from './ManualGiftForm';

export interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultListId?: number;
}

export function AddGiftModal({
  isOpen,
  onClose,
  onSuccess,
  defaultListId,
}: AddGiftModalProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="gift"
      title="Add Gift"
      size="lg"
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'manual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">From URL</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card>
            <CardContent className="p-6">
              <UrlGiftForm
                defaultListId={defaultListId}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardContent className="p-6">
              <ManualGiftForm
                defaultListId={defaultListId}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EntityModal>
  );
}
