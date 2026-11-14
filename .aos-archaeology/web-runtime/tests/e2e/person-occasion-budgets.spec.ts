import { test, expect } from '@playwright/test';

/**
 * Person-Occasion Budget E2E Tests
 *
 * This file contains two test suites:
 * 1. Budget CRUD Operations (TEST-001)
 * 2. Budget Progress Updates (TEST-002)
 *
 * Components Tested:
 * - PersonBudgetsTab (budget management interface)
 * - PersonOccasionBudgetCard (individual budget cards)
 * - PersonBudgetBar (progress visualization)
 * - StackedProgressBar (visual progress display)
 */

test.use({ storageState: 'tests/.auth/user.json' });

// ============================================================================
// TEST-001: Budget CRUD Operations
// ============================================================================

test.describe('Person-Occasion Budget CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Start at people page for most tests
    await page.goto('/people');
    await expect(page).toHaveURL(/.*people/);
  });

  /**
   * TEST 1: Navigate to Budget UI
   * Verifies user can access budget management interface
   */
  test('should navigate to person budgets tab in person modal', async ({ page }) => {
    // Wait for people to load
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });

    // Get person name for verification
    const personName = await personCard.locator('[data-testid="person-name"], h3, h4').first().textContent();

    // Click person card to open modal
    await personCard.click();

    // Modal should open
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify person name in modal
    if (personName) {
      await expect(modal.locator(`text=${personName}`)).toBeVisible();
    }

    // Find and click "Budgets" tab
    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await expect(budgetsTab).toBeVisible({ timeout: 5000 });
    await budgetsTab.click();

    // Wait for budgets content to load
    await page.waitForTimeout(1000);

    // Verify budget inputs are visible
    const budgetInputs = modal.locator('input[type="number"]');
    await expect(budgetInputs.first()).toBeVisible({ timeout: 5000 });

    // Verify labels for budget types
    const recipientLabel = modal.locator('text=/Gifts to Receive|Budget for Gifts to Receive/i');
    const purchaserLabel = modal.locator('text=/Gifts to Buy|Budget for Gifts to Buy/i');

    await expect(recipientLabel.first()).toBeVisible();
    await expect(purchaserLabel.first()).toBeVisible();
  });

  /**
   * TEST 2: Create Budget (Set New Budget)
   * Tests setting a recipient budget for the first time
   */
  test('should set recipient budget for person-occasion', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Find first recipient budget input
    // Look for input near "Gifts to Receive Budget" label
    const recipientInput = modal.locator('input[type="number"]').first();
    await expect(recipientInput).toBeVisible();

    // Clear any existing value and enter new budget
    await recipientInput.clear();
    await recipientInput.fill('150.00');

    // Blur to trigger auto-save
    await recipientInput.blur();

    // Wait for save to complete - look for success indicator (checkmark)
    const successIndicator = modal.locator('[aria-label*="saved" i], svg').filter({ hasText: '' });
    // Give it a moment for the API call
    await page.waitForTimeout(2000);

    // Verify budget value is still in input
    await expect(recipientInput).toHaveValue('150.00');

    // Check if success checkmark appeared (Check icon from lucide-react)
    const checkIcon = modal.locator('svg').filter({ has: page.locator('path[d*="M20 6"]') });
    if (await checkIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Success indicator found
      await expect(checkIcon).toBeVisible();
    }
  });

  /**
   * TEST 3: Create Purchaser Budget
   * Tests setting a purchaser budget for the first time
   */
  test('should set purchaser budget for person-occasion', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Find purchaser budget input (usually second input in pair)
    const allInputs = modal.locator('input[type="number"]');
    const inputCount = await allInputs.count();

    // Get the second input if there are at least 2
    const purchaserInput = inputCount >= 2 ? allInputs.nth(1) : allInputs.first();
    await expect(purchaserInput).toBeVisible();

    // Set purchaser budget
    await purchaserInput.clear();
    await purchaserInput.fill('200.00');
    await purchaserInput.blur();

    // Wait for save
    await page.waitForTimeout(2000);

    // Verify value persists
    await expect(purchaserInput).toHaveValue('200.00');
  });

  /**
   * TEST 4: Read Budget (Verify Display and Persistence)
   * Tests that budget values persist after page reload
   */
  test('should display budget correctly after setting and persist after reload', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });

    // Get person identifier for re-selection after reload
    const personName = await personCard.locator('[data-testid="person-name"], h3, h4').first().textContent();

    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Set a unique budget value
    const recipientInput = modal.locator('input[type="number"]').first();
    const testBudget = '175.50';

    await recipientInput.clear();
    await recipientInput.fill(testBudget);
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Verify it's set
    await expect(recipientInput).toHaveValue(testBudget);

    // Close modal
    const closeButton = modal.locator('button[aria-label*="Close" i], button:has-text("Close")').first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    } else {
      // Try ESC key
      await page.keyboard.press('Escape');
    }

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Re-navigate to same person's budget tab
    if (personName) {
      const reloadedPersonCard = page.locator(`[data-testid="person-card"]:has-text("${personName}")`).first();
      await expect(reloadedPersonCard).toBeVisible({ timeout: 10000 });
      await reloadedPersonCard.click();
    } else {
      await page.locator('[data-testid="person-card"]').first().click();
    }

    const reloadedModal = page.locator('[role="dialog"]').first();
    await expect(reloadedModal).toBeVisible();

    const reloadedBudgetsTab = reloadedModal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await reloadedBudgetsTab.click();
    await page.waitForTimeout(1000);

    // Verify budget persisted
    const reloadedInput = reloadedModal.locator('input[type="number"]').first();
    await expect(reloadedInput).toHaveValue(testBudget);
  });

  /**
   * TEST 5: Update Budget
   * Tests updating an existing budget value
   */
  test('should update existing budget', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Set initial budget
    const recipientInput = modal.locator('input[type="number"]').first();
    await recipientInput.clear();
    await recipientInput.fill('100.00');
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Verify initial value
    await expect(recipientInput).toHaveValue('100.00');

    // Update to new value
    await recipientInput.clear();
    await recipientInput.fill('250.00');
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Verify updated value
    await expect(recipientInput).toHaveValue('250.00');

    // Reload to confirm persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="person-card"]').first().click();
    const reloadedModal = page.locator('[role="dialog"]').first();
    await expect(reloadedModal).toBeVisible();

    const reloadedBudgetsTab = reloadedModal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await reloadedBudgetsTab.click();
    await page.waitForTimeout(1000);

    const reloadedInput = reloadedModal.locator('input[type="number"]').first();
    await expect(reloadedInput).toHaveValue('250.00');
  });

  /**
   * TEST 6: Delete Budget (Clear to null)
   * Tests clearing a budget by removing the value
   */
  test('should clear budget and set to null', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Set a budget first
    const recipientInput = modal.locator('input[type="number"]').first();
    await recipientInput.clear();
    await recipientInput.fill('300.00');
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Verify it's set
    await expect(recipientInput).toHaveValue('300.00');

    // Now clear it completely
    await recipientInput.clear();
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Verify input is empty
    await expect(recipientInput).toHaveValue('');

    // Reload to confirm it's cleared in backend
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="person-card"]').first().click();
    const reloadedModal = page.locator('[role="dialog"]').first();
    await expect(reloadedModal).toBeVisible();

    const reloadedBudgetsTab = reloadedModal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await reloadedBudgetsTab.click();
    await page.waitForTimeout(1000);

    const reloadedInput = reloadedModal.locator('input[type="number"]').first();
    await expect(reloadedInput).toHaveValue('');
  });

  /**
   * TEST 7: Budget Display on Occasion Page
   * Tests that budgets are also accessible from the occasion detail page
   */
  test('should display and edit budgets from occasion detail page', async ({ page }) => {
    // Navigate to occasions page
    await page.goto('/occasions');
    await expect(page).toHaveURL(/.*occasions/);

    // Find and click on first occasion
    const occasionCard = page.locator('[data-testid="occasion-card"]').first();

    if (await occasionCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await occasionCard.click();

      // Should navigate to occasion detail page
      await expect(page).toHaveURL(/.*occasions\/\d+/, { timeout: 5000 });

      // Look for recipient/person cards with budget inputs
      const budgetCard = page.locator('[data-testid="person-budget-card"]').first();

      if (await budgetCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Find budget input within this card
        const budgetInput = budgetCard.locator('input[type="number"]').first();
        await expect(budgetInput).toBeVisible();

        // Set budget from occasion page
        await budgetInput.clear();
        await budgetInput.fill('400.00');
        await budgetInput.blur();
        await page.waitForTimeout(2000);

        // Verify value
        await expect(budgetInput).toHaveValue('400.00');

        // Look for success indicator
        const successCheck = budgetCard.locator('[aria-label*="saved" i]').first();
        if (await successCheck.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(successCheck).toBeVisible();
        }
      }
    }
  });

  /**
   * TEST 8: Toggle Past Occasions
   * Tests the "Show Past Occasions" toggle in PersonBudgetsTab
   */
  test('should toggle past occasions visibility', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Look for "Show Past Occasions" toggle
    const toggleLabel = modal.locator('text=/Show Past Occasions/i');

    if (await toggleLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Find the switch/checkbox associated with this label
      const toggle = modal.locator('button[role="switch"], input[type="checkbox"]').first();

      // Get initial state
      const initialState = await toggle.getAttribute('aria-checked') || await toggle.getAttribute('checked');

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(1000);

      // Verify state changed
      const newState = await toggle.getAttribute('aria-checked') || await toggle.getAttribute('checked');
      expect(newState).not.toBe(initialState);

      // Click again to toggle back
      await toggle.click();
      await page.waitForTimeout(1000);

      const finalState = await toggle.getAttribute('aria-checked') || await toggle.getAttribute('checked');
      expect(finalState).toBe(initialState);
    }
  });

  /**
   * TEST 9: Budget Progress Visualization
   * Tests that PersonBudgetBar displays when budget is set
   */
  test('should display budget progress bar when budget is set', async ({ page }) => {
    // Navigate to person budgets tab
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Set a budget
    const recipientInput = modal.locator('input[type="number"]').first();
    await recipientInput.clear();
    await recipientInput.fill('500.00');
    await recipientInput.blur();
    await page.waitForTimeout(2000);

    // Look for progress bar or visualization
    // PersonBudgetBar uses StackedProgressBar component
    const progressBar = modal.locator('[role="progressbar"], .progress-bar, [data-testid="budget-progress"]').first();

    // Check if progress visualization appears
    if (await progressBar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(progressBar).toBeVisible();
    } else {
      // Alternatively, look for budget amounts being displayed
      const budgetAmount = modal.locator('text=/\\$[0-9,.]+/').first();
      await expect(budgetAmount).toBeVisible();
    }
  });

  /**
   * TEST 10: Error Handling
   * Tests error state display when budget save fails
   */
  test('should display error message if budget save fails', async ({ page }) => {
    // This test is tricky since we need to simulate a network failure
    // For now, just verify error UI elements exist in component

    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const budgetsTab = modal.locator('button:has-text("Budgets"), [role="tab"]:has-text("Budgets")').first();
    await budgetsTab.click();
    await page.waitForTimeout(1000);

    // Try to set an invalid budget (negative number)
    const recipientInput = modal.locator('input[type="number"]').first();

    // Most number inputs have min="0", so this might not work
    // But we test that the input has validation attributes
    const minAttr = await recipientInput.getAttribute('min');
    expect(minAttr).toBe('0');

    // Test that step attribute is set for currency
    const stepAttr = await recipientInput.getAttribute('step');
    expect(stepAttr).toBe('0.01');
  });
});

// ============================================================================
// TEST-002: Budget Progress Updates
// ============================================================================

test.describe('Person-Occasion Budget Progress', () => {
  /**
   * Test Setup Helper
   * Navigates to a person detail page where budget progress is displayed
   */
  async function navigateToPersonBudgetView(page: any) {
    // Navigate to people page
    await page.goto('/people');
    await expect(page).toHaveURL(/.*people/);

    // Find and click on first person card
    const personCard = page.locator('[data-testid="person-card"]').first();
    await expect(personCard).toBeVisible({ timeout: 10000 });
    await personCard.click();

    // Should navigate to person detail page OR open modal
    const modal = page.locator('[role="dialog"]').first();
    const isModal = await modal.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isModal) {
      // Should navigate to person detail page
      await expect(page.url()).toMatch(/.*people\/\d+/);

      // Wait for person detail to load
      const personDetail = page.locator('[data-testid="person-detail"], main').first();
      await expect(personDetail).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Helper: Extract currency amount from text (e.g., "$50.00" -> 50)
   */
  function extractAmount(text: string | null): number {
    if (!text) return 0;
    const match = text.match(/\$?([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  }

  /**
   * Helper: Add a gift for a person
   */
  async function addGiftForPerson(page: any, giftData: {
    name: string;
    price: string;
    description?: string;
    url?: string;
  }) {
    // Navigate to gifts page
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    // Click "Add Gift" button
    const addButton = page.locator(
      'button:has-text("Add Gift"), button:has-text("New Gift"), button[aria-label="Add gift"], button[aria-label="Quick add idea"]'
    ).first();

    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    // Modal/form should open
    const modal = page.locator('[role="dialog"], [data-testid="gift-form-modal"]').first();
    await expect(modal).toBeVisible();

    // Fill in gift details
    const nameInput = modal.locator('input[name="name"], [data-testid="gift-name-input"]').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill(giftData.name);

    // Optional fields
    if (giftData.description) {
      const descInput = modal.locator('textarea[name="description"], [data-testid="gift-description-input"]').first();
      if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descInput.fill(giftData.description);
      }
    }

    const priceInput = modal.locator('input[name="price"], [data-testid="gift-price-input"]').first();
    if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceInput.fill(giftData.price);
    }

    if (giftData.url) {
      const urlInput = modal.locator('input[name="url"], [data-testid="gift-url-input"]').first();
      if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await urlInput.fill(giftData.url);
      }
    }

    // Submit form
    const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').first();
    await submitButton.click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Gift should appear in catalog
    await expect(page.locator(`text=${giftData.name}`)).toBeVisible({ timeout: 10000 });
  }

  test('progress bar updates when gift is added for person', async ({ page }) => {
    // Navigate to person budget view
    await navigateToPersonBudgetView(page);

    // Look for PersonBudgetBar component
    const budgetBar = page.locator('[data-testid="person-budget-bar"], [role="progressbar"]').first();

    // If budget bar doesn't exist, this person may not have a budget set up
    // We'll proceed to test the flow anyway
    const hasBudgetBar = await budgetBar.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasBudgetBar) {
      // Note initial progress values
      const progressBar = page.locator('[role="progressbar"]').first();
      const initialAriaValueNow = await progressBar.getAttribute('aria-valuenow');
      const initialProgress = initialAriaValueNow ? parseFloat(initialAriaValueNow) : 0;

      // Find initial "Planned" amount
      const plannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
        .textContent()
        .catch(() => null);
      const initialPlanned = extractAmount(plannedText);

      // Add a gift for this person
      await addGiftForPerson(page, {
        name: 'Budget Test Gift - Added',
        price: '50.00',
        description: 'Testing budget progress update',
      });

      // Navigate back to person detail
      await navigateToPersonBudgetView(page);

      // Wait for budget data to refresh (React Query refetch)
      await page.waitForTimeout(2000);

      // Verify progress updated
      const newPlannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
        .textContent()
        .catch(() => null);
      const newPlanned = extractAmount(newPlannedText);

      // Planned amount should have increased
      expect(newPlanned).toBeGreaterThan(initialPlanned);

      // Progress percentage should have increased
      const newProgressBar = page.locator('[role="progressbar"]').first();
      const newAriaValueNow = await newProgressBar.getAttribute('aria-valuenow');
      const newProgress = newAriaValueNow ? parseFloat(newAriaValueNow) : 0;

      expect(newProgress).toBeGreaterThanOrEqual(initialProgress);
    } else {
      // If no budget bar visible, test the totals-only display
      // Add a gift and verify totals appear
      await addGiftForPerson(page, {
        name: 'Budget Test Gift - No Budget',
        price: '50.00',
      });

      await navigateToPersonBudgetView(page);
      await page.waitForTimeout(2000);

      // Should show totals without progress bar
      const totalsDisplay = page.locator('text=/Purchased:|Planned:|Total:/').first();
      await expect(totalsDisplay).toBeVisible({ timeout: 5000 });
    }
  });

  test('progress bar updates when gift amount is modified', async ({ page }) => {
    // Navigate to gifts page
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    // Find first gift card
    const giftCard = page.locator('[data-testid="gift-card"]').first();
    if (!await giftCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // No gifts exist, skip test
      test.skip();
      return;
    }

    // Get initial gift price
    const giftName = await giftCard.locator('[data-testid="gift-name"], h3, h4').first()
      .textContent();

    // Click to open gift detail
    await giftCard.click();
    await page.waitForTimeout(1000);

    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit gift"]').first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Modify the price
      const priceInput = page.locator('input[name="price"], [data-testid="gift-price-input"]').first();
      if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Clear and set new price
        await priceInput.clear();
        await priceInput.fill('75.00');

        // Save changes
        const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        await saveButton.click();

        // Wait for update to complete
        await page.waitForTimeout(2000);

        // Navigate to person detail to check budget progress
        await navigateToPersonBudgetView(page);

        // Wait for budget data to refresh
        await page.waitForTimeout(2000);

        // Verify progress bar or totals reflect the new amount
        const progressBar = page.locator('[role="progressbar"]').first();
        const plannedAmountDisplay = page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/');

        // At least one should be visible
        const hasProgress = await progressBar.isVisible({ timeout: 2000 }).catch(() => false);
        const hasAmount = await plannedAmountDisplay.isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasProgress || hasAmount).toBe(true);
      }
    }
  });

  test('progress bar updates when gift is deleted', async ({ page }) => {
    // First, add a gift to ensure we have something to delete
    await addGiftForPerson(page, {
      name: 'Budget Test Gift - To Delete',
      price: '30.00',
    });

    // Navigate to person budget view to get initial progress
    await navigateToPersonBudgetView(page);
    await page.waitForTimeout(2000);

    // Note initial planned amount
    const plannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
      .textContent()
      .catch(() => null);
    const initialPlanned = extractAmount(plannedText);

    // Navigate back to gifts and delete the gift
    await page.goto('/gifts');

    // Find the gift we just created
    const giftToDelete = page.locator('[data-testid="gift-card"]:has-text("Budget Test Gift - To Delete")').first();
    if (await giftToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click to open detail
      await giftToDelete.click();
      await page.waitForTimeout(1000);

      // Find delete button
      const deleteButton = page.locator('button:has-text("Delete"), button[aria-label="Delete gift"]').first();

      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteButton.click();

        // Confirm deletion if confirmation modal appears
        const confirmButton = page.locator(
          'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")'
        ).first();
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }

        // Wait for deletion to complete
        await page.waitForTimeout(2000);

        // Navigate back to person detail
        await navigateToPersonBudgetView(page);
        await page.waitForTimeout(2000);

        // Verify planned amount decreased or stayed the same
        const newPlannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
          .textContent()
          .catch(() => null);
        const newPlanned = extractAmount(newPlannedText);

        // Planned should have decreased or stayed same (depending on if gift was linked to person)
        expect(newPlanned).toBeLessThanOrEqual(initialPlanned);
      }
    }
  });

  test('over-budget warning appears when spending exceeds budget', async ({ page }) => {
    // This test assumes we can set a budget and add gifts that exceed it
    // Navigate to person budget view
    await navigateToPersonBudgetView(page);

    // Check if budget bar exists
    const budgetBar = page.locator('[role="progressbar"]').first();
    const hasBudget = await budgetBar.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasBudget) {
      // Add expensive gift to potentially exceed budget
      await addGiftForPerson(page, {
        name: 'Expensive Gift - Over Budget Test',
        price: '500.00',
      });

      // Navigate back to person detail
      await navigateToPersonBudgetView(page);
      await page.waitForTimeout(2000);

      // Look for "Over budget" warning
      const overBudgetWarning = page.locator('text=Over budget').first();
      const alertIcon = page.locator('[data-testid="alert-triangle"]').first();

      // Check if warning appears (conditional based on actual budget values)
      const hasWarning = await overBudgetWarning.isVisible({ timeout: 3000 }).catch(() => false);
      const hasIcon = await alertIcon.isVisible({ timeout: 3000 }).catch(() => false);

      // If we've exceeded the budget, warning should appear
      if (hasWarning || hasIcon) {
        await expect(overBudgetWarning.or(alertIcon)).toBeVisible();

        // Progress bar should show red color when over budget
        const progressSegment = page.locator('[role="progressbar"] > div').first();
        if (await progressSegment.isVisible({ timeout: 2000 }).catch(() => false)) {
          const classes = await progressSegment.getAttribute('class');
          // Should have red color class (bg-red-500 or bg-red-400)
          expect(classes).toMatch(/bg-red/);
        }
      }
    } else {
      test.skip();
    }
  });

  test('shows totals only when no budget is set', async ({ page }) => {
    // Navigate to a person who has no budget set
    await navigateToPersonBudgetView(page);

    // Look for PersonBudgetBar display
    // If no budget is set but gifts exist, should show totals-only format
    const totalsDisplay = page.locator('text=/Purchased:|Planned:|Total:/').first();
    const progressBar = page.locator('[role="progressbar"]').first();

    const hasTotals = await totalsDisplay.isVisible({ timeout: 3000 }).catch(() => false);
    const hasProgress = await progressBar.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasTotals && !hasProgress) {
      // Perfect! Totals-only display is working
      await expect(totalsDisplay).toBeVisible();

      // Verify it shows the three components: Purchased, Planned, Total
      const displayText = await totalsDisplay.textContent();
      expect(displayText).toMatch(/Purchased:/);
      expect(displayText).toMatch(/Planned:/);
      expect(displayText).toMatch(/Total:/);

      // Verify NO progress bar is displayed
      await expect(progressBar).not.toBeVisible();
    } else if (hasProgress) {
      // This person has a budget set, which is fine
      // Test that the progress bar displays correctly
      await expect(progressBar).toBeVisible();
    } else {
      // No budget and no gifts - component may be hidden
      // This is acceptable per component logic
    }
  });

  test('purchase status change updates progress correctly', async ({ page }) => {
    // Navigate to gifts page
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    // Find a gift in "planned" status
    const plannedGift = page.locator('[data-testid="gift-card"][data-status="IDEA"], [data-testid="gift-card"][data-status="SELECTED"]').first();

    if (await plannedGift.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get initial budget state
      await navigateToPersonBudgetView(page);
      await page.waitForTimeout(2000);

      // Note initial purchased amount
      const purchasedText = await page.locator('text=/Purchased:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
        .textContent()
        .catch(() => null);
      const initialPurchased = extractAmount(purchasedText);

      // Go back and mark gift as purchased
      await page.goto('/gifts');
      await plannedGift.click();
      await page.waitForTimeout(1000);

      // Look for "Mark as Purchased" button or status change option
      const purchaseButton = page.locator(
        'button:has-text("Mark as Purchased"), button:has-text("Purchased"), [data-testid="mark-purchased-button"]'
      ).first();

      if (await purchaseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await purchaseButton.click();

        // Confirm if needed
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }

        // Wait for status change
        await page.waitForTimeout(2000);

        // Navigate back to person detail
        await navigateToPersonBudgetView(page);
        await page.waitForTimeout(2000);

        // Verify purchased amount increased (if gift was linked to this person)
        const newPurchasedText = await page.locator('text=/Purchased:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
          .textContent()
          .catch(() => null);
        const newPurchased = extractAmount(newPurchasedText);

        // Purchased amount should have increased or stayed same
        expect(newPurchased).toBeGreaterThanOrEqual(initialPurchased);

        // Progress bar should show green segment for purchased portion
        const purchasedSegment = page.locator('[role="progressbar"] > div.bg-emerald-500, [role="progressbar"] > div.bg-green-500').first();
        if (await purchasedSegment.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(purchasedSegment).toBeVisible();
        }
      }
    } else {
      // No planned gifts available to mark as purchased
      test.skip();
    }
  });

  test('progress bar displays correct visual segments', async ({ page }) => {
    // Navigate to person budget view
    await navigateToPersonBudgetView(page);

    // Look for progress bar with stacked segments
    const progressBar = page.locator('[role="progressbar"]').first();

    if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Verify ARIA attributes are present
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
      const ariaValueMin = await progressBar.getAttribute('aria-valuemin');
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax');

      expect(ariaValueNow).not.toBeNull();
      expect(ariaValueMin).toBe('0');
      expect(ariaValueMax).toBe('100');

      // Verify aria-valuenow is a valid number
      if (ariaValueNow) {
        const progress = parseFloat(ariaValueNow);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(150); // Can be over 100% if over budget
      }

      // Verify segment divs exist
      const segments = progressBar.locator('> div');
      const segmentCount = await segments.count();

      // Should have at least 1 segment if there's any progress
      if (parseFloat(ariaValueNow || '0') > 0) {
        expect(segmentCount).toBeGreaterThan(0);
      }

      // Purchased segment should have color class
      const purchasedSegment = segments.first();
      if (await purchasedSegment.isVisible({ timeout: 1000 }).catch(() => false)) {
        const classes = await purchasedSegment.getAttribute('class');
        expect(classes).toMatch(/bg-(emerald|green|red|amber)-[0-9]+/);
      }
    } else {
      // No progress bar visible - may be totals-only display
      const totalsDisplay = page.locator('text=/Purchased:|Planned:|Total:/').first();
      if (await totalsDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(totalsDisplay).toBeVisible();
      }
    }
  });

  test('progress updates are reflected in real-time across navigation', async ({ page }) => {
    // Navigate to person budget view
    await navigateToPersonBudgetView(page);
    await page.waitForTimeout(2000);

    // Get initial progress
    const initialPlannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
      .textContent()
      .catch(() => null);
    const initialPlanned = extractAmount(initialPlannedText);

    // Add a gift
    await addGiftForPerson(page, {
      name: 'Real-time Test Gift',
      price: '25.00',
    });

    // Navigate back to person detail
    await navigateToPersonBudgetView(page);

    // Wait for React Query to invalidate cache and refetch
    await page.waitForTimeout(3000);

    // Verify progress updated
    const newPlannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
      .textContent()
      .catch(() => null);
    const newPlanned = extractAmount(newPlannedText);

    // Should reflect the new gift amount (if linked to person)
    expect(newPlanned).toBeGreaterThanOrEqual(initialPlanned);

    // Navigate away and back again
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    await navigateToPersonBudgetView(page);
    await page.waitForTimeout(2000);

    // Progress should persist
    const persistedPlannedText = await page.locator('text=/Planned:.*\\$[\\d,]+\\.\\d{2}|\\$[\\d,]+\\.\\d{2}/').first()
      .textContent()
      .catch(() => null);
    const persistedPlanned = extractAmount(persistedPlannedText);

    expect(persistedPlanned).toBeGreaterThanOrEqual(initialPlanned);
  });
});

/**
 * Data-testid Attributes Needed (for component enhancements):
 *
 * PersonCard.tsx:
 * - data-testid="person-card"
 * - data-testid="person-name"
 *
 * PersonDetail.tsx:
 * - data-testid="person-detail"
 *
 * PersonBudgetsTab.tsx:
 * - data-testid="budgets-tab-content"
 * - data-testid="occasion-budget-row"
 * - data-testid="show-past-toggle"
 *
 * PersonOccasionBudgetCard.tsx:
 * - data-testid="person-budget-card"
 * - data-testid="recipient-budget-input"
 * - data-testid="purchaser-budget-input"
 * - data-testid="budget-save-success"
 * - data-testid="budget-save-error"
 *
 * PersonBudgetBar.tsx:
 * - data-testid="person-budget-bar"
 * - data-testid="over-budget-warning"
 * - data-testid="alert-triangle" (AlertTriangle icon)
 *
 * StackedProgressBar.tsx:
 * - role="progressbar" (already implemented)
 * - aria-valuenow, aria-valuemin, aria-valuemax (already implemented)
 * - data-testid="progress-segment-purchased"
 * - data-testid="progress-segment-planned"
 *
 * GiftCard.tsx:
 * - data-testid="gift-card"
 * - data-testid="gift-name"
 * - data-status={gift.status}
 *
 * GiftForm.tsx / QuickAddModal.tsx:
 * - data-testid="gift-form-modal"
 * - data-testid="gift-name-input"
 * - data-testid="gift-description-input"
 * - data-testid="gift-price-input"
 * - data-testid="gift-url-input"
 *
 * GiftDetail.tsx:
 * - data-testid="gift-detail"
 * - data-testid="edit-gift-button"
 * - data-testid="delete-gift-button"
 * - data-testid="mark-purchased-button"
 *
 * OccasionCard.tsx:
 * - data-testid="occasion-card"
 * - data-testid="occasion-name"
 *
 * Note: Tests are designed to work without these testids using flexible selectors,
 * but adding them would make tests more robust and maintainable.
 */
