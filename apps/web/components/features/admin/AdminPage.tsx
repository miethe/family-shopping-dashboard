'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EntityTab } from './EntityTab';

/**
 * Entity configuration for admin tabs
 */
type EntityType = 'person' | 'gift' | 'occasion' | 'list';

interface EntityConfig {
  id: EntityType;
  label: string;
  description: string;
}

const ENTITIES: EntityConfig[] = [
  {
    id: 'person',
    label: 'Person',
    description: 'Preferences, hobbies, interests, dietary restrictions, etc.',
  },
  {
    id: 'gift',
    label: 'Gift',
    description: 'Gift priorities, status options',
  },
  {
    id: 'occasion',
    label: 'Occasion',
    description: 'Occasion types and categories',
  },
  {
    id: 'list',
    label: 'List',
    description: 'List types and visibility settings',
  },
];

/**
 * Admin Page Container
 *
 * Manages field options for all entities (Person, Gift, Occasion, List).
 * Provides tabbed interface for entity selection and CRUD operations.
 */
export function AdminPage() {
  const [activeEntity, setActiveEntity] = useState<EntityType>('person');

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-warm-900">
            Admin Settings
          </h1>
          <p className="text-warm-600 mt-2">
            Manage field options for Persons, Gifts, Occasions, and Lists
          </p>
        </div>

        {/* Entity Tabs */}
        <Tabs
          value={activeEntity}
          onValueChange={(value) => setActiveEntity(value as EntityType)}
          className="w-full"
        >
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto p-2">
            {ENTITIES.map((entity) => (
              <TabsTrigger
                key={entity.id}
                value={entity.id}
                className="min-h-[44px] text-sm md:text-base"
              >
                {entity.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {ENTITIES.map((entity) => (
            <TabsContent
              key={entity.id}
              value={entity.id}
              className="mt-6"
            >
              <div className="bg-white rounded-2xlarge border border-warm-200 p-6 shadow-sm">
                {/* Entity Description */}
                <div className="mb-6 pb-4 border-b border-warm-100">
                  <h2 className="text-lg font-semibold text-warm-900">
                    {entity.label} Fields
                  </h2>
                  <p className="text-sm text-warm-500 mt-1">
                    {entity.description}
                  </p>
                </div>

                {/* Fields List */}
                <EntityTab entity={entity.id} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
