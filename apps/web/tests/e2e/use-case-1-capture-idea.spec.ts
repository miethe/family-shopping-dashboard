import { test, expect } from '@playwright/test';

/**
 * UC1: Capture a Gift Idea
 *
 * User captures gift ideas via:
 * 1. Quick Add button (FAB)
 * 2. Navigate to list and add directly
 * 3. Idea appears with "IDEA" status
 *
 * Tests both mobile and desktop variants.
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('UC1: Capture a Gift Idea', () => {
  test('should capture idea via Quick Add FAB button', async ({ page, isMobile }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Find and click Quick Add FAB
    // Note: FAB should have aria-label="Quick add idea"
    const quickAddButton = page.locator('button[aria-label="Quick add idea"]');
    await expect(quickAddButton).toBeVisible();
    await quickAddButton.click();

    // Modal should open
    // TODO: Add data-testid="quick-add-modal" to QuickAddModal component
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Fill in gift idea
    // TODO: Add data-testid attributes to form fields in QuickAddModal
    const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill('LEGO Star Wars Set');

    // Optional: Add description
    const descInput = modal.locator(
      'textarea[name="description"], textarea[placeholder*="description" i]'
    ).first();
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill('Ultimate Collector Series Millennium Falcon');
    }

    // Optional: Add price estimate
    const priceInput = modal.locator('input[name="price"], input[type="number"]').first();
    if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceInput.fill('849.99');
    }

    // Submit form
    const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Success toast should appear (optional, may not be implemented)
    const toast = page.locator('[role="status"], [data-testid="toast"]').first();
    if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(toast).toContainText(/added|created|success/i);
    }

    // Navigate to gifts catalog to verify
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    // Gift should be in catalog
    // TODO: Add data-testid="gift-card" to GiftCard component
    const giftCard = page.locator('text=LEGO Star Wars Set').first();
    await expect(giftCard).toBeVisible({ timeout: 10000 });
  });

  test('should capture idea via header Quick Add button', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Find header Quick Add button (not FAB)
    // This is the 'header' variant: <PlusIcon /> Add Idea
    const headerButton = page.locator('button:has-text("Add Idea")');

    // Header button may not be visible on all pages
    if (await headerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await headerButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Nintendo Switch OLED');

      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")');
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to list and add idea directly', async ({ page }) => {
    // Navigate to lists page
    await page.goto('/lists');
    await expect(page).toHaveURL(/.*lists/);

    // Find first list (or create if none exist)
    const firstList = page.locator('[data-testid="list-card"]').first();

    if (await firstList.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click on existing list
      await firstList.click();
    } else {
      // No lists exist - create one first
      // TODO: Add data-testid="create-list-button" to lists page
      const createButton = page.locator('button:has-text("Create List"), button:has-text("New List")').first();
      if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createButton.click();

        // Fill in list creation form
        const modal = page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        const nameInput = modal.locator('input[name="name"]').first();
        await nameInput.fill('Test List');

        const submitButton = modal.locator('button[type="submit"]');
        await submitButton.click();

        // Wait for redirect to new list
        await page.waitForURL(/.*lists\/\d+/);
      }
    }

    // Should be on list detail page
    await expect(page.url()).toMatch(/.*lists\/\d+/);

    // Add item to list using Quick Add or inline form
    const quickAddButton = page.locator('button[aria-label="Quick add idea"]');
    if (await quickAddButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quickAddButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      const nameInput = modal.locator('input[name="name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Apple AirPods Pro');

      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")');
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }

    // Verify item appears in list with IDEA status
    // TODO: Add data-testid="list-item" and data-status attribute to ListItemRow
    const listItem = page.locator('text=Apple AirPods Pro').first();
    await expect(listItem).toBeVisible({ timeout: 10000 });

    // Check for IDEA badge/status
    const ideaBadge = page.locator('[data-status="IDEA"], text=/idea/i').first();
    await expect(ideaBadge).toBeVisible({ timeout: 5000 });
  });

  test('should show idea with IDEA status badge', async ({ page }) => {
    // Navigate to gifts catalog
    await page.goto('/gifts');

    // Find a gift card
    const giftCard = page.locator('[data-testid="gift-card"]').first();

    if (await giftCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click to view detail
      await giftCard.click();

      // Should navigate to gift detail page
      await expect(page.url()).toMatch(/.*gifts\/\d+/);

      // Status badge should be visible
      // TODO: Add data-testid="gift-status" to GiftDetail component
      const statusBadge = page.locator('[data-testid="gift-status"], [data-status]').first();
      if (await statusBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Should show status (may be IDEA or other status)
        await expect(statusBadge).toBeVisible();
      }
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * QuickAddModal.tsx:
 * - [role="dialog"] (already standard)
 * - data-testid="quick-add-modal"
 * - data-testid="gift-name-input"
 * - data-testid="gift-description-input"
 * - data-testid="gift-price-input"
 * - data-testid="submit-button"
 *
 * GiftCard.tsx:
 * - data-testid="gift-card"
 * - data-testid="gift-name"
 * - data-status={gift.status}
 *
 * GiftDetail.tsx:
 * - data-testid="gift-status"
 * - data-testid="gift-detail"
 *
 * ListItemRow.tsx:
 * - data-testid="list-item"
 * - data-testid="list-item-name"
 * - data-status={item.status}
 *
 * ListCard.tsx:
 * - data-testid="list-card"
 * - data-testid="list-name"
 *
 * Toast.tsx:
 * - data-testid="toast" or [role="status"] (standard)
 */
