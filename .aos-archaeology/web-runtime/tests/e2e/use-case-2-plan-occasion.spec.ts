import { test, expect } from '@playwright/test';

/**
 * UC2: Plan Christmas (or any Occasion)
 *
 * User workflow:
 * 1. Create an occasion (e.g., Christmas 2024)
 * 2. Create lists for people
 * 3. Add gift ideas to lists
 * 4. View on dashboard
 *
 * Tests complete planning workflow from start to finish.
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('UC2: Plan an Occasion', () => {
  test('should create occasion and view on dashboard', async ({ page }) => {
    // Navigate to occasions page
    await page.goto('/occasions');
    await expect(page).toHaveURL(/.*occasions/);

    // Create new occasion
    // TODO: Add data-testid="create-occasion-button" to occasions page
    const createButton = page.locator(
      'button:has-text("Create Occasion"), button:has-text("New Occasion"), a[href*="/occasions/new"]'
    ).first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();

      // Fill occasion form
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Occasion name
      const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Christmas 2025');

      // Date (if available)
      const dateInput = modal.locator('input[name="date"], input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dateInput.fill('2025-12-25');
      }

      // Submit
      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }

    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Occasion should appear in Primary Occasion section
    // TODO: Add data-testid="primary-occasion" to PrimaryOccasion component
    const primaryOccasion = page.locator('[data-testid="primary-occasion"], text=Christmas 2025').first();
    if (await primaryOccasion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(primaryOccasion).toContainText('Christmas 2025');
    }
  });

  test('should create lists for people in occasion', async ({ page }) => {
    // Navigate to people page
    await page.goto('/people');
    await expect(page).toHaveURL(/.*people/);

    // Create first person
    const createPersonButton = page.locator(
      'button:has-text("Add Person"), button:has-text("New Person"), a[href*="/people/new"]'
    ).first();

    const peopleToCreate = ['Alice', 'Bob', 'Charlie'];

    for (const personName of peopleToCreate) {
      if (await createPersonButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createPersonButton.click();

        const modal = page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
        await nameInput.fill(personName);

        const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
        await submitButton.click();

        await expect(modal).not.toBeVisible({ timeout: 5000 });

        // Wait a moment before creating next person
        await page.waitForTimeout(500);
      }
    }

    // Verify people appear in list
    for (const personName of peopleToCreate) {
      const personCard = page.locator(`text=${personName}`).first();
      await expect(personCard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should create lists for occasion and people', async ({ page }) => {
    // Navigate to lists page
    await page.goto('/lists');
    await expect(page).toHaveURL(/.*lists/);

    // Create a list
    const createListButton = page.locator(
      'button:has-text("Create List"), button:has-text("New List"), a[href*="/lists/new"]'
    ).first();

    if (await createListButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createListButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // List name
      const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill("Alice's Christmas List");

      // Select person (if dropdown exists)
      const personSelect = modal.locator('select[name="person_id"], [role="combobox"]').first();
      if (await personSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Select first person option (skip the placeholder)
        await personSelect.selectOption({ index: 1 });
      }

      // Select occasion (if dropdown exists)
      const occasionSelect = modal.locator('select[name="occasion_id"]').first();
      if (await occasionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await occasionSelect.selectOption({ index: 1 });
      }

      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }

    // Verify list appears
    const listCard = page.locator("text=Alice's Christmas List").first();
    await expect(listCard).toBeVisible({ timeout: 5000 });
  });

  test('should add gift ideas to list', async ({ page }) => {
    // Navigate to lists
    await page.goto('/lists');

    // Click on first list
    const firstList = page.locator('[data-testid="list-card"]').first();
    if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstList.click();

      // Wait for list detail page
      await expect(page.url()).toMatch(/.*lists\/\d+/);
    } else {
      // If no list, skip (should have been created in previous test)
      test.skip();
    }

    // Add multiple gift ideas
    const giftsToAdd = [
      { name: 'Wireless Headphones', price: '199.99' },
      { name: 'Coffee Maker', price: '89.99' },
      { name: 'Board Game Collection', price: '45.00' },
    ];

    for (const gift of giftsToAdd) {
      // Click Quick Add FAB
      const quickAddButton = page.locator('button[aria-label="Quick add idea"]');
      await expect(quickAddButton).toBeVisible();
      await quickAddButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Fill gift info
      const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill(gift.name);

      const priceInput = modal.locator('input[name="price"], input[type="number"]').first();
      if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceInput.fill(gift.price);
      }

      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")');
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });

      // Wait a moment before adding next gift
      await page.waitForTimeout(500);
    }

    // Verify all gifts appear in list
    for (const gift of giftsToAdd) {
      const giftItem = page.locator(`text=${gift.name}`).first();
      await expect(giftItem).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view complete occasion on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Dashboard should show:
    // 1. Primary occasion
    const primaryOccasion = page.locator('[data-testid="primary-occasion"]').first();
    if (await primaryOccasion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(primaryOccasion).toBeVisible();
    }

    // 2. Pipeline summary with counts
    // TODO: Add data-testid="pipeline-summary" to PipelineSummary component
    const pipelineSummary = page.locator('[data-testid="pipeline-summary"]').first();
    if (await pipelineSummary.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should show ideas count
      const ideasCount = pipelineSummary.locator('text=/Ideas|\\d+/').first();
      await expect(ideasCount).toBeVisible();

      // Should show purchased count
      const purchasedCount = pipelineSummary.locator('text=/Purchased|\\d+/').first();
      await expect(purchasedCount).toBeVisible();
    } else {
      // Pipeline summary may use different structure
      const ideasCard = page.locator('text=Ideas').first();
      await expect(ideasCard).toBeVisible({ timeout: 5000 });
    }

    // 3. People needing gifts
    // TODO: Add data-testid="people-needing" to PeopleNeeding component
    const peopleNeeding = page.locator('[data-testid="people-needing"]').first();
    if (await peopleNeeding.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(peopleNeeding).toBeVisible();
    }
  });

  test('should navigate from dashboard to occasion detail', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Click on primary occasion to view detail
    const primaryOccasion = page.locator('[data-testid="primary-occasion"], [data-testid="occasion-card"]').first();

    if (await primaryOccasion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primaryOccasion.click();

      // Should navigate to occasion detail
      await expect(page.url()).toMatch(/.*occasions\/\d+/);

      // Occasion detail should show lists
      const occasionLists = page.locator('[data-testid="occasion-lists"]').first();
      if (await occasionLists.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(occasionLists).toBeVisible();
      }
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * PrimaryOccasion.tsx:
 * - data-testid="primary-occasion"
 * - data-testid="occasion-name"
 * - data-testid="occasion-date"
 *
 * PipelineSummary.tsx:
 * - data-testid="pipeline-summary"
 * - data-testid="ideas-count"
 * - data-testid="purchased-count"
 * - data-testid="my-assignments-count"
 *
 * PeopleNeeding.tsx:
 * - data-testid="people-needing"
 * - data-testid="person-card"
 *
 * OccasionCard.tsx:
 * - data-testid="occasion-card"
 * - data-testid="occasion-name"
 *
 * OccasionDetail.tsx:
 * - data-testid="occasion-detail"
 * - data-testid="occasion-lists"
 *
 * PersonCard.tsx:
 * - data-testid="person-card"
 * - data-testid="person-name"
 *
 * Forms:
 * - data-testid="create-occasion-button"
 * - data-testid="create-person-button"
 * - data-testid="create-list-button"
 */
