/**
 * New Gift Page
 *
 * Allows users to add a new gift either from a URL (with automatic parsing)
 * or manually with a form. Uses tabs for switching between methods.
 */

'use client';

import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { UrlGiftForm, ManualGiftForm } from '@/components/gifts';

export default function NewGiftPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Gift"
        subtitle="Add a gift to your catalog"
        backHref="/gifts"
      />

      <Tabs defaultValue="url" className="max-w-lg mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">From URL</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card>
            <CardContent className="p-6">
              <UrlGiftForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardContent className="p-6">
              <ManualGiftForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
