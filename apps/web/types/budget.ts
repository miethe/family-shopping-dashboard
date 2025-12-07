/**
 * Budget-related types matching backend DTOs
 *
 * These types correspond to the budget module in services/api/app/schemas/budget.py
 * All types use snake_case to match backend DTOs exactly.
 */

/**
 * Budget meter data showing spending progress for an occasion
 */
export interface BudgetMeterData {
  budget_total: number | null;
  purchased_amount: number;
  planned_amount: number;
  remaining_amount: number | null;
  purchased_percent: number;
  planned_percent: number;
  is_over_budget: boolean;
  has_budget: boolean;
}

/**
 * Budget warning levels and thresholds
 */
export interface BudgetWarning {
  level: 'none' | 'approaching' | 'near_limit' | 'exceeded';
  message: string;
  threshold_percent: number;
  current_percent: number;
}

/**
 * Entity-specific budget (list or person within an occasion)
 */
export interface EntityBudget {
  entity_type: string;
  entity_id: number;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  is_over_budget: boolean;
}

/**
 * Request to set/update occasion budget
 */
export interface SetBudgetRequest {
  budget_amount: number;
}

/**
 * Request to set/update entity-specific budget
 */
export interface SetEntityBudgetRequest {
  entity_type: string;
  entity_id: number;
  budget_amount: number;
}

/**
 * Person budget calculation showing gifts assigned to and purchased by a person
 */
export interface PersonBudget {
  person_id: number;
  occasion_id: number | null;

  // Recipient role (gifts TO this person)
  gifts_assigned_count: number;
  gifts_assigned_total: number;  // Decimal serialized as float

  // NEW: Of assigned gifts, how many are purchased
  gifts_assigned_purchased_count: number;
  gifts_assigned_purchased_total: number;  // Decimal serialized as float

  // Purchaser role (gifts BY this person - already purchased)
  gifts_purchased_count: number;
  gifts_purchased_total: number; // Decimal serialized as float

  // NEW: Gifts assigned as purchaser but not yet bought
  gifts_to_purchase_count: number;
  gifts_to_purchase_total: number;  // Decimal serialized as float
}
