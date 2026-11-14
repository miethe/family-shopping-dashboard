/**
 * New Person Page
 *
 * Allows users to add a new person to the family database with demographic
 * and relationship information.
 */

'use client';

import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { PersonForm } from '@/components/people';

export default function NewPersonPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Person"
        subtitle="Add a person to your family"
        backHref="/people"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'People', href: '/people' },
          { label: 'Add Person' }
        ]}
      />

      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6">
          <PersonForm />
        </CardContent>
      </Card>
    </div>
  );
}
