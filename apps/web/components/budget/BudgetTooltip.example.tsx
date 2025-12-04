/**
 * BudgetTooltip Usage Example
 *
 * This file demonstrates how to use the BudgetTooltip component
 * in your application.
 */

'use client';

import { useState, useRef } from 'react';
import { BudgetTooltip } from './BudgetTooltip';

export function BudgetTooltipExample() {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  // Example gift data
  const gifts = [
    {
      id: 1,
      name: 'LEGO Star Wars Set',
      price: 89.99,
      recipient: 'John',
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      price: 129.99,
      recipient: 'Sarah',
    },
    {
      id: 3,
      name: 'Coffee Maker',
      price: 79.99,
      recipient: 'Mom',
    },
    {
      id: 4,
      name: 'Board Game Collection',
      price: 45.50,
      recipient: 'Family',
    },
    {
      id: 5,
      name: 'Smart Watch',
      price: 299.99,
      recipient: 'Dad',
    },
  ];

  const totalAmount = gifts.reduce((sum, gift) => sum + (gift.price || 0), 0);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">BudgetTooltip Example</h2>

      {/* Trigger Button */}
      <button
        ref={anchorRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        Show Budget Details
      </button>

      {/* Tooltip */}
      <BudgetTooltip
        segment="purchased"
        gifts={gifts}
        totalAmount={totalAmount}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
      />

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4">Key Features:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Click the button to open the tooltip</li>
          <li>Press ESC to close</li>
          <li>Click outside to close</li>
          <li>Responsive: Bottom sheet on mobile, popover on desktop</li>
          <li>Scrollable list when more than 5 gifts</li>
          <li>Keyboard accessible with focus trap</li>
        </ul>

        <h3 className="font-semibold mt-6 mb-4">Props:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>
            <code>segment</code>: &apos;purchased&apos; | &apos;planned&apos; - Display type
          </li>
          <li>
            <code>gifts</code>: Gift[] - Array of gift objects
          </li>
          <li>
            <code>totalAmount</code>: number - Total amount for the segment
          </li>
          <li>
            <code>isOpen</code>: boolean - Controls visibility
          </li>
          <li>
            <code>onClose</code>: () =&gt; void - Close handler
          </li>
          <li>
            <code>anchorEl</code>: HTMLElement | null - Element to position near (desktop)
          </li>
          <li>
            <code>className</code>: string (optional) - Additional CSS classes
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Integration with BudgetMeter
 *
 * Here's how to integrate with the existing BudgetMeter component:
 */

export function BudgetMeterWithTooltip() {
  const [tooltipState, setTooltipState] = useState<{
    isOpen: boolean;
    segment: 'purchased' | 'planned';
    anchorEl: HTMLElement | null;
  }>({
    isOpen: false,
    segment: 'purchased',
    anchorEl: null,
  });

  const handleSegmentClick = (
    segment: 'purchased' | 'planned',
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setTooltipState({
      isOpen: true,
      segment,
      anchorEl: event.currentTarget,
    });
  };

  const handleClose = () => {
    setTooltipState((prev) => ({ ...prev, isOpen: false }));
  };

  // Example data (in real usage, this would come from your API)
  const purchasedGifts = [
    { id: 1, name: 'Gift 1', price: 50, recipient: 'John' },
    { id: 2, name: 'Gift 2', price: 75, recipient: 'Sarah' },
  ];

  const plannedGifts = [
    { id: 3, name: 'Gift 3', price: 100, recipient: 'Mom' },
    { id: 4, name: 'Gift 4', price: 25, recipient: 'Dad' },
  ];

  const purchasedTotal = purchasedGifts.reduce(
    (sum, gift) => sum + (gift.price || 0),
    0
  );
  const plannedTotal = plannedGifts.reduce(
    (sum, gift) => sum + (gift.price || 0),
    0
  );

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        Budget Meter with Tooltip Integration
      </h2>

      {/* Simplified Budget Meter */}
      <div className="relative w-full h-12 bg-gray-200 rounded-lg overflow-hidden">
        {/* Purchased Segment */}
        <div
          className="absolute left-0 h-full bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
          style={{ width: '40%' }}
          onClick={(e) => handleSegmentClick('purchased', e)}
          role="button"
          tabIndex={0}
          aria-label="View purchased gifts"
        >
          <span className="flex items-center justify-center h-full text-white font-semibold">
            Purchased
          </span>
        </div>

        {/* Planned Segment */}
        <div
          className="absolute h-full bg-blue-500 cursor-pointer hover:bg-blue-600 transition-colors"
          style={{ left: '40%', width: '30%' }}
          onClick={(e) => handleSegmentClick('planned', e)}
          role="button"
          tabIndex={0}
          aria-label="View planned gifts"
        >
          <span className="flex items-center justify-center h-full text-white font-semibold">
            Planned
          </span>
        </div>
      </div>

      {/* Tooltip */}
      <BudgetTooltip
        segment={tooltipState.segment}
        gifts={
          tooltipState.segment === 'purchased' ? purchasedGifts : plannedGifts
        }
        totalAmount={
          tooltipState.segment === 'purchased' ? purchasedTotal : plannedTotal
        }
        isOpen={tooltipState.isOpen}
        onClose={handleClose}
        anchorEl={tooltipState.anchorEl}
      />
    </div>
  );
}
