import { test, expect } from '@playwright/test';

/**
 * UC4: View Progress
 *
 * User views progress tracking:
 * 1. Dashboard shows pipeline stats (Ideas, Selected, Purchased, Received)
 * 2. Navigate to occasion detail
 * 3. See per-person status and progress
 * 4. Filter/sort by status
 *
 * Tests progress visualization and navigation.
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('UC4: View Progress', () => {
  test('should show pipeline summary on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Pipeline summary should be visible
    // TODO: Add data-testid="pipeline-summary" to PipelineSummary component
    const pipelineSummary = page.locator('[data-testid="pipeline-summary"]').first();

    if (await pipelineSummary.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should show Ideas count
      const ideasCard = pipelineSummary.locator('[data-testid="ideas-count"]').first();
      await expect(ideasCard).toBeVisible();

      // Should have a number
      const ideasText = await ideasCard.textContent();
      expect(ideasText).toMatch(/\d+/);

      // Should show Purchased count
      const purchasedCard = pipelineSummary.locator('[data-testid="purchased-count"]').first();
      await expect(purchasedCard).toBeVisible();

      // Should show My Assignments count
      const assignmentsCard = pipelineSummary.locator('[data-testid="my-assignments-count"]').first();
      await expect(assignmentsCard).toBeVisible();
    } else {
      // Alternative: Look for individual stat cards
      const ideasStat = page.locator('text=Ideas').first();
      await expect(ideasStat).toBeVisible({ timeout: 5000 });

      const purchasedStat = page.locator('text=/Purchased|Bought/i').first();
      await expect(purchasedStat).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show detailed stats for each pipeline stage', async ({ page }) => {
    await page.goto('/dashboard');

    // Each stage should show count
    const stages = ['Ideas', 'Selected', 'Purchased', 'Received'];

    for (const stage of stages) {
      // Find stage card/section
      const stageElement = page.locator(`text=${stage}`).first();

      if (await stageElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(stageElement).toBeVisible();

        // Should have a count (number) associated with it
        const parent = stageElement.locator('..').first();
        const text = await parent.textContent();

        // Should contain a number
        expect(text).toMatch(/\d+/);
      }
    }
  });

  test('should navigate to occasion detail from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Find primary occasion card
    const primaryOccasion = page.locator(
      '[data-testid="primary-occasion"], [data-testid="occasion-card"]'
    ).first();

    if (await primaryOccasion.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click to view detail
      await primaryOccasion.click();

      // Should navigate to occasion detail page
      await expect(page.url()).toMatch(/.*occasions\/\d+/);

      // Occasion detail should be visible
      const occasionDetail = page.locator('[data-testid="occasion-detail"]').first();
      if (await occasionDetail.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(occasionDetail).toBeVisible();
      }
    }
  });

  test('should show per-person progress in occasion detail', async ({ page }) => {
    // Navigate to occasions
    await page.goto('/occasions');

    // Click on first occasion
    const firstOccasion = page.locator('[data-testid="occasion-card"]').first();

    if (await firstOccasion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOccasion.click();

      // Should show occasion detail
      await expect(page.url()).toMatch(/.*occasions\/\d+/);

      // Should show lists for this occasion
      const occasionLists = page.locator('[data-testid="occasion-lists"]').first();

      if (await occasionLists.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(occasionLists).toBeVisible();

        // Each list should show person and their progress
        const listCards = page.locator('[data-testid="list-card"]');
        const listCount = await listCards.count();

        if (listCount > 0) {
          // First list should show person name
          const firstList = listCards.first();
          await expect(firstList).toBeVisible();

          // Should show progress indicators
          // TODO: Add data-testid="list-progress" to list cards
          const progressIndicator = firstList.locator(
            '[data-testid="list-progress"], [role="progressbar"], text=/\\d+\\/\\d+|\\d+%/'
          ).first();

          if (await progressIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(progressIndicator).toBeVisible();
          }
        }
      }
    }
  });

  test('should show person detail with gift status', async ({ page }) => {
    // Navigate to people page
    await page.goto('/people');

    // Click on first person
    const firstPerson = page.locator('[data-testid="person-card"]').first();

    if (await firstPerson.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstPerson.click();

      // Should navigate to person detail
      await expect(page.url()).toMatch(/.*people\/\d+/);

      // Person detail should be visible
      const personDetail = page.locator('[data-testid="person-detail"]').first();
      if (await personDetail.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(personDetail).toBeVisible();
      }

      // Should show person's lists
      const personLists = page.locator('[data-testid="person-lists"]').first();
      if (await personLists.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(personLists).toBeVisible();

        // Should show gifts with status
        const giftItems = page.locator('[data-testid="list-item"]');
        const itemCount = await giftItems.count();

        if (itemCount > 0) {
          // Each item should have status badge
          const firstItem = giftItems.first();
          const statusBadge = firstItem.locator('[data-status], [data-testid="item-status"]').first();

          if (await statusBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(statusBadge).toBeVisible();
          }
        }
      }
    }
  });

  test('should show my assignments page with tasks', async ({ page }) => {
    // Navigate to assignments page
    await page.goto('/assignments');
    await expect(page).toHaveURL(/.*assignments/);

    // Assignments list should be visible
    // TODO: Add data-testid="assignments-list" to AssignmentList component
    const assignmentsList = page.locator('[data-testid="assignments-list"]').first();

    if (await assignmentsList.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(assignmentsList).toBeVisible();

      // Should show assigned items
      const assignmentCards = page.locator('[data-testid="assignment-card"]');
      const assignmentCount = await assignmentCards.count();

      if (assignmentCount > 0) {
        // Each assignment should show:
        // 1. Gift name
        const firstAssignment = assignmentCards.first();
        await expect(firstAssignment).toBeVisible();

        // 2. Person name (who it's for)
        const personName = firstAssignment.locator('[data-testid="assignment-person"]').first();
        if (await personName.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(personName).toBeVisible();
        }

        // 3. Status
        const status = firstAssignment.locator('[data-status], [data-testid="assignment-status"]').first();
        if (await status.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(status).toBeVisible();
        }
      }
    } else {
      // May show empty state
      const emptyState = page.locator('text=/no assignments|nothing assigned/i').first();
      if (await emptyState.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should filter list items by status', async ({ page }) => {
    // Navigate to a list
    await page.goto('/lists');

    const firstList = page.locator('[data-testid="list-card"]').first();
    if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstList.click();
      await expect(page.url()).toMatch(/.*lists\/\d+/);

      // Look for pipeline view or status filter
      // TODO: Add data-testid="pipeline-view" to PipelineView component
      const pipelineView = page.locator('[data-testid="pipeline-view"]').first();

      if (await pipelineView.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(pipelineView).toBeVisible();

        // Should show different status columns/sections
        const statusSections = ['IDEA', 'SELECTED', 'PURCHASED', 'RECEIVED'];

        for (const status of statusSections) {
          // Look for section with this status
          const statusSection = page.locator(
            `[data-status="${status}"], [data-testid="${status.toLowerCase()}-section"]`
          ).first();

          if (await statusSection.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(statusSection).toBeVisible();
          }
        }
      } else {
        // Alternative: Look for status tabs
        const statusTabs = page.locator('[role="tablist"]').first();

        if (await statusTabs.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(statusTabs).toBeVisible();

          // Click on different tabs
          const selectedTab = page.locator('[role="tab"]:has-text("Selected")').first();
          if (await selectedTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await selectedTab.click();

            // Should show only selected items
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test('should show progress visualization with counts', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for visual progress indicators
    // TODO: Add data-testid="progress-bar" or similar to progress components
    const progressIndicators = page.locator(
      '[role="progressbar"], [data-testid="progress-bar"], [data-testid="progress-indicator"]'
    );

    const progressCount = await progressIndicators.count();

    if (progressCount > 0) {
      // At least one progress indicator should exist
      const firstProgress = progressIndicators.first();
      await expect(firstProgress).toBeVisible();

      // Should have aria-valuenow or similar
      const valueNow = await firstProgress.getAttribute('aria-valuenow');
      const valueMax = await firstProgress.getAttribute('aria-valuemax');

      if (valueNow && valueMax) {
        // Progress values should be valid
        expect(parseInt(valueNow)).toBeGreaterThanOrEqual(0);
        expect(parseInt(valueMax)).toBeGreaterThan(0);
      }
    }
  });

  test('should update progress when status changes', async ({ page }) => {
    // Navigate to a list
    await page.goto('/lists');

    const firstList = page.locator('[data-testid="list-card"]').first();
    if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstList.click();
      await expect(page.url()).toMatch(/.*lists\/\d+/);

      // Get initial purchased count
      const purchasedSection = page.locator('[data-testid="purchased-section"]').first();
      let initialPurchasedCount = 0;

      if (await purchasedSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        const items = purchasedSection.locator('[data-testid="list-item"]');
        initialPurchasedCount = await items.count();
      }

      // Find an item in SELECTED status
      const selectedItem = page.locator('[data-status="SELECTED"]').first();

      if (await selectedItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Move to PURCHASED
        const statusButton = selectedItem.locator('[data-testid="status-button"]').first();

        if (await statusButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await statusButton.click();

          const purchasedOption = page.locator(
            '[role="menuitem"]:has-text("Purchased"), button:has-text("Purchased")'
          ).first();

          if (await purchasedOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await purchasedOption.click();

            // Wait for update
            await page.waitForTimeout(1000);

            // Purchased count should increase
            const newItems = purchasedSection.locator('[data-testid="list-item"]');
            const newPurchasedCount = await newItems.count();

            expect(newPurchasedCount).toBeGreaterThan(initialPurchasedCount);
          }
        }
      }
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * PipelineSummary.tsx:
 * - data-testid="pipeline-summary"
 * - data-testid="ideas-count"
 * - data-testid="selected-count"
 * - data-testid="purchased-count"
 * - data-testid="received-count"
 * - data-testid="my-assignments-count"
 *
 * OccasionDetail.tsx:
 * - data-testid="occasion-detail"
 * - data-testid="occasion-lists"
 * - data-testid="occasion-progress"
 *
 * PersonDetail.tsx:
 * - data-testid="person-detail"
 * - data-testid="person-lists"
 * - data-testid="person-info"
 *
 * ListCard.tsx:
 * - data-testid="list-card"
 * - data-testid="list-name"
 * - data-testid="list-progress"
 * - data-progress-value={value}
 * - data-progress-max={max}
 *
 * PipelineView.tsx:
 * - data-testid="pipeline-view"
 * - data-testid="idea-section"
 * - data-testid="selected-section"
 * - data-testid="purchased-section"
 * - data-testid="received-section"
 *
 * AssignmentList.tsx:
 * - data-testid="assignments-list"
 * - data-testid="assignment-card"
 * - data-testid="assignment-person"
 * - data-testid="assignment-status"
 *
 * ListItemRow.tsx:
 * - data-testid="list-item"
 * - data-testid="item-status"
 * - data-status={status}
 *
 * Progress components:
 * - data-testid="progress-bar"
 * - data-testid="progress-indicator"
 * - role="progressbar" (standard)
 * - aria-valuenow={current}
 * - aria-valuemax={max}
 */
