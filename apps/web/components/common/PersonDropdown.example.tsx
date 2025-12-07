/**
 * PersonDropdown Usage Examples
 *
 * Demonstrates various use cases for the PersonDropdown component.
 */

'use client';

import { useState } from 'react';
import { PersonDropdown } from './PersonDropdown';

export function PersonDropdownExamples() {
  // Single select
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);

  // Multi-select
  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);

  // Compact variant for cards
  const [cardPerson, setCardPerson] = useState<number | null>(null);

  return (
    <div className="space-y-8 p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-warm-900">PersonDropdown Examples</h1>

      {/* Example 1: Basic Single Select */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">1. Basic Single Select</h2>
        <p className="text-sm text-warm-600">
          Default dropdown for selecting a single person. Used in forms like GiftForm.
        </p>
        <PersonDropdown
          label="Recipient"
          value={selectedPerson}
          onChange={(value) => setSelectedPerson(value as number | null)}
          placeholder="Select a recipient..."
        />
        <p className="text-xs text-warm-600">
          Selected: {selectedPerson || 'None'}
        </p>
      </section>

      {/* Example 2: Multi-Select Mode */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">2. Multi-Select Mode</h2>
        <p className="text-sm text-warm-600">
          Select multiple persons at once. Used in BulkActionBar.
        </p>
        <PersonDropdown
          label="Assign to multiple people"
          value={selectedPersons}
          onChange={(value) => setSelectedPersons(value as number[])}
          multiSelect
          placeholder="Select people..."
        />
        <p className="text-xs text-warm-600">
          Selected: {selectedPersons.length} people
        </p>
      </section>

      {/* Example 3: Compact Variant */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">3. Compact Variant (32px)</h2>
        <p className="text-sm text-warm-600">
          Smaller dropdown for use in cards or dense layouts.
        </p>
        <PersonDropdown
          label="For"
          value={cardPerson}
          onChange={(value) => setCardPerson(value as number | null)}
          variant="compact"
          placeholder="Select..."
        />
      </section>

      {/* Example 4: Without "Add New" */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">4. Read-Only Selection</h2>
        <p className="text-sm text-warm-600">
          Disable inline person creation when not needed.
        </p>
        <PersonDropdown
          label="Filter by person"
          value={selectedPerson}
          onChange={(value) => setSelectedPerson(value as number | null)}
          allowNew={false}
          placeholder="Filter..."
        />
      </section>

      {/* Example 5: With Validation Error */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">5. With Validation Error</h2>
        <p className="text-sm text-warm-600">
          Shows validation feedback in forms.
        </p>
        <PersonDropdown
          label="Required Recipient"
          value={null}
          onChange={(value) => setSelectedPerson(value as number | null)}
          error="Please select at least one recipient"
        />
      </section>

      {/* Example 6: Disabled State */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">6. Disabled State</h2>
        <p className="text-sm text-warm-600">
          Prevent interaction when appropriate.
        </p>
        <PersonDropdown
          label="Recipient"
          value={selectedPerson}
          onChange={(value) => setSelectedPerson(value as number | null)}
          disabled
          placeholder="Not available"
        />
      </section>

      {/* Use Case: GiftCard */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">Use Case: GiftCard</h2>
        <p className="text-sm text-warm-600">
          Compact dropdown for quick person assignment in gift cards.
        </p>
        <div className="border border-warm-200 rounded-large p-4 bg-white shadow-low">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-warm-100 rounded-medium" />
            <div className="flex-1">
              <h3 className="font-semibold text-warm-900">LEGO Star Wars Set</h3>
              <p className="text-sm text-warm-600">$59.99</p>
              <div className="mt-2">
                <PersonDropdown
                  label="For"
                  value={cardPerson}
                  onChange={(value) => setCardPerson(value as number | null)}
                  variant="compact"
                  placeholder="Assign..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case: Form */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-warm-800">Use Case: Gift Form</h2>
        <p className="text-sm text-warm-600">
          Full-size dropdown with multi-select for forms.
        </p>
        <div className="border border-warm-200 rounded-large p-6 bg-white shadow-low">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide mb-2">
                Gift Name
              </label>
              <input
                type="text"
                placeholder="Enter gift name..."
                className="w-full px-4 py-3 min-h-[44px] border border-border-light rounded-medium text-warm-900 bg-warm-50"
              />
            </div>

            <PersonDropdown
              label="Recipients"
              value={selectedPersons}
              onChange={(value) => setSelectedPersons(value as number[])}
              multiSelect
              placeholder="Who is this gift for?"
            />

            <button className="w-full min-h-[44px] bg-primary-500 text-white rounded-medium font-semibold hover:bg-primary-600 transition-colors">
              Save Gift
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
