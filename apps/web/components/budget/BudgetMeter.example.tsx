/**
 * BudgetMeter Example Usage
 *
 * This file demonstrates how to use the BudgetMeter component
 * in your application. Not included in production builds.
 */

'use client';

import { BudgetMeter, BudgetMeterSkeleton } from './index';
import type { BudgetMeterData } from './index';

/**
 * Example 1: Basic Usage
 */
export function BasicBudgetMeterExample() {
  const data: BudgetMeterData = {
    budget_total: 1000,
    purchased_amount: 300,
    planned_amount: 200,
    remaining_amount: 500,
    purchased_percent: 30,
    planned_percent: 20,
    is_over_budget: false,
    has_budget: true,
  };

  return <BudgetMeter data={data} />;
}

/**
 * Example 2: With Segment Click Handler
 */
export function InteractiveBudgetMeterExample() {
  const data: BudgetMeterData = {
    budget_total: 1000,
    purchased_amount: 300,
    planned_amount: 200,
    remaining_amount: 500,
    purchased_percent: 30,
    planned_percent: 20,
    is_over_budget: false,
    has_budget: true,
  };

  const handleSegmentClick = (segment: 'purchased' | 'planned' | 'remaining') => {
    console.log(`Clicked ${segment} segment`);
    // Navigate to filtered view or show details
  };

  return (
    <BudgetMeter
      data={data}
      onSegmentClick={handleSegmentClick}
      showLabels={true}
    />
  );
}

/**
 * Example 3: Over Budget State
 */
export function OverBudgetExample() {
  const data: BudgetMeterData = {
    budget_total: 1000,
    purchased_amount: 800,
    planned_amount: 400,
    remaining_amount: -200,
    purchased_percent: 80,
    planned_percent: 40,
    is_over_budget: true,
    has_budget: true,
  };

  return <BudgetMeter data={data} size="lg" />;
}

/**
 * Example 4: No Budget Set
 */
export function NoBudgetExample() {
  const data: BudgetMeterData = {
    budget_total: null,
    purchased_amount: 300,
    planned_amount: 200,
    remaining_amount: null,
    purchased_percent: 0,
    planned_percent: 0,
    is_over_budget: false,
    has_budget: false,
  };

  return <BudgetMeter data={data} />;
}

/**
 * Example 5: Loading State
 */
export function LoadingExample() {
  return <BudgetMeterSkeleton size="md" showLabels={true} />;
}

/**
 * Example 6: Size Variants
 */
export function SizeVariantsExample() {
  const data: BudgetMeterData = {
    budget_total: 1000,
    purchased_amount: 300,
    planned_amount: 200,
    remaining_amount: 500,
    purchased_percent: 30,
    planned_percent: 20,
    is_over_budget: false,
    has_budget: true,
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-2">Small</h3>
        <BudgetMeter data={data} size="sm" />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Medium (Default)</h3>
        <BudgetMeter data={data} size="md" />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Large</h3>
        <BudgetMeter data={data} size="lg" />
      </div>
    </div>
  );
}

/**
 * Example 7: With React Query
 */
export function WithReactQueryExample() {
  // This would typically use a custom hook like useBudgetProgress
  // For now, showing the pattern:

  const isLoading = false; // from useQuery
  const data: BudgetMeterData = {
    budget_total: 1000,
    purchased_amount: 300,
    planned_amount: 200,
    remaining_amount: 500,
    purchased_percent: 30,
    planned_percent: 20,
    is_over_budget: false,
    has_budget: true,
  };

  if (isLoading) {
    return <BudgetMeterSkeleton />;
  }

  return <BudgetMeter data={data} />;
}
