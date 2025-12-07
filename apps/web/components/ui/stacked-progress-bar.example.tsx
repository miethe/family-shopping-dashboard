/**
 * StackedProgressBar Example Usage
 *
 * This file demonstrates various use cases for the StackedProgressBar component.
 * Use these examples as reference when implementing in your application.
 */

import { StackedProgressBar } from './stacked-progress-bar';

// Sample gift data
const sampleGifts = [
  {
    id: 1,
    name: 'LEGO Star Wars Millennium Falcon',
    price: 159.99,
    status: 'purchased' as const,
    imageUrl: '/images/gifts/lego-falcon.jpg',
  },
  {
    id: 2,
    name: 'Nintendo Switch Game',
    price: 59.99,
    status: 'purchased' as const,
    imageUrl: '/images/gifts/switch-game.jpg',
  },
  {
    id: 3,
    name: 'Board Game Bundle',
    price: 89.99,
    status: 'planned' as const,
    imageUrl: '/images/gifts/board-games.jpg',
  },
  {
    id: 4,
    name: 'Art Supplies Set',
    price: 45.00,
    status: 'planned' as const,
  },
  {
    id: 5,
    name: 'Science Kit',
    price: 35.00,
    status: 'planned' as const,
    imageUrl: '/images/gifts/science-kit.jpg',
  },
];

export function StackedProgressBarExamples() {
  // Example handler for item clicks
  const handleGiftClick = (id: number | string) => {
    console.log('Gift clicked:', id);
    // Navigate to gift detail or open modal
  };

  return (
    <div className="space-y-12 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">
        StackedProgressBar Examples
      </h1>

      {/* Example 1: Basic usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">1. Basic Usage</h2>
        <p className="text-sm text-gray-600">
          Simple progress bar without label or amounts
        </p>
        <StackedProgressBar
          total={500}
          planned={300}
          purchased={150}
        />
      </section>

      {/* Example 2: With label */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">2. With Label</h2>
        <p className="text-sm text-gray-600">
          Progress bar with descriptive label
        </p>
        <StackedProgressBar
          total={500}
          planned={300}
          purchased={150}
          label="Gifts to Give"
        />
      </section>

      {/* Example 3: With amounts */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          3. With Label and Amounts
        </h2>
        <p className="text-sm text-gray-600">
          Full featured display with label and currency amounts
        </p>
        <StackedProgressBar
          total={500}
          planned={300}
          purchased={150}
          label="Gifts to Give"
          showAmounts
        />
      </section>

      {/* Example 4: With tooltip */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          4. With Interactive Tooltip
        </h2>
        <p className="text-sm text-gray-600">
          Hover to see gift details in tooltip
        </p>
        <StackedProgressBar
          total={500}
          planned={390}
          purchased={220}
          label="Gifts to Give"
          showAmounts
          tooltipItems={sampleGifts}
          onItemClick={handleGiftClick}
        />
      </section>

      {/* Example 5: Size variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">5. Size Variants</h2>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Small (6px height)</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={150}
            label="Small Size"
            size="sm"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Medium (8px height) - Default</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={150}
            label="Medium Size"
            size="md"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Large (12px height)</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={150}
            label="Large Size"
            size="lg"
          />
        </div>
      </section>

      {/* Example 6: Different scenarios */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          6. Different Progress Scenarios
        </h2>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">No purchases yet</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={0}
            label="Gifts to Give"
            showAmounts
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">All purchased</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={300}
            label="Gifts to Give"
            showAmounts
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Over budget (total exceeded)</p>
          <StackedProgressBar
            total={300}
            planned={500}
            purchased={250}
            label="Gifts to Give"
            showAmounts
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Minimal progress</p>
          <StackedProgressBar
            total={1000}
            planned={100}
            purchased={25}
            label="Gifts to Give"
            showAmounts
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Nearly complete</p>
          <StackedProgressBar
            total={500}
            planned={480}
            purchased={450}
            label="Gifts to Give"
            showAmounts
          />
        </div>
      </section>

      {/* Example 7: Recipient vs Purchaser variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          7. Recipient vs Purchaser Variants
        </h2>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Recipient variant (gifts to give)</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={150}
            label="Gifts to Give"
            variant="recipient"
            showAmounts
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Purchaser variant (gifts purchased)</p>
          <StackedProgressBar
            total={500}
            planned={300}
            purchased={150}
            label="Gifts Purchased"
            variant="purchaser"
            showAmounts
          />
        </div>
      </section>

      {/* Example 8: In card context */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          8. In Person Card Context
        </h2>
        <p className="text-sm text-gray-600">
          How it looks within a PersonCard component
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-warm-200 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">John Doe</h3>
              <p className="text-sm text-gray-500">Birthday: Dec 25</p>
            </div>
          </div>

          <div className="space-y-3">
            <StackedProgressBar
              total={500}
              planned={390}
              purchased={220}
              label="Gifts to Give"
              showAmounts
              variant="recipient"
              tooltipItems={sampleGifts}
              onItemClick={handleGiftClick}
            />

            <StackedProgressBar
              total={800}
              planned={600}
              purchased={450}
              label="Gifts Purchased"
              showAmounts
              variant="purchaser"
            />
          </div>
        </div>
      </section>

      {/* Example 9: Responsive behavior */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          9. Mobile-Friendly Example
        </h2>
        <p className="text-sm text-gray-600">
          Touch targets are automatically 44px minimum when interactive
        </p>
        <StackedProgressBar
          total={500}
          planned={300}
          purchased={150}
          label="Gifts to Give"
          showAmounts
          tooltipItems={sampleGifts}
          onItemClick={handleGiftClick}
        />
        <p className="text-xs text-gray-500 italic">
          The progress bar wrapper has min-h-[44px] when tooltipItems are provided
        </p>
      </section>

      {/* Example 10: Custom styling */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          10. With Custom Styling
        </h2>
        <p className="text-sm text-gray-600">
          Apply custom className for additional styling
        </p>
        <StackedProgressBar
          total={500}
          planned={300}
          purchased={150}
          label="Custom Styled Progress"
          showAmounts
          className="shadow-md border-2 border-warm-300"
        />
      </section>
    </div>
  );
}

/**
 * Real-world integration example with React Query
 */
export function PersonBudgetProgressExample() {
  // Mock data - in real app this would come from usePersonBudget hook
  const budgetData = {
    gifts_assigned_total: 390.98,
    gifts_assigned_count: 5,
    budget_cap: 500,
  };

  const purchasedTotal = 219.98; // From purchased gifts

  const giftItems = sampleGifts;

  return (
    <div className="p-6 bg-white rounded-lg border border-warm-200">
      <h3 className="text-lg font-semibold mb-4">Person Budget Overview</h3>

      <StackedProgressBar
        total={budgetData.budget_cap}
        planned={budgetData.gifts_assigned_total}
        purchased={purchasedTotal}
        label={`Gifts to Give (${budgetData.gifts_assigned_count} items)`}
        showAmounts
        variant="recipient"
        tooltipItems={giftItems}
        onItemClick={(id) => {
          // Navigate to gift detail
          console.log('Navigate to gift:', id);
        }}
      />

      <p className="mt-2 text-xs text-gray-500">
        ${(budgetData.budget_cap - budgetData.gifts_assigned_total).toFixed(2)} remaining in budget
      </p>
    </div>
  );
}
