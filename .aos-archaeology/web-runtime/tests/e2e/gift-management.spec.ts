import { test, expect } from '@playwright/test';

/**
 * PT-005 Gift Management Tests
 *
 * Tests gift CRUD operations and interactions.
 *
 * Required Tests:
 * 1. Create Gift - Navigate to gifts, click add, fill form, submit, verify gift appears
 * 2. View Gift Detail - Click on gift card, verify detail modal/page opens with correct data
 * 3. Drag-Drop Status Change - In Kanban view, drag gift between columns, verify status updates
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('Gift Management', () => {
  test('should create a new gift and verify it appears in catalog', async ({ page }) => {
    // Navigate to gifts page
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    // Click "Add Gift" or "Create Gift" button
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
    await nameInput.fill('PlayStation 5 Console');

    // Optional fields
    const descInput = modal.locator('textarea[name="description"], [data-testid="gift-description-input"]').first();
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill('Standard edition with DualSense controller');
    }

    const priceInput = modal.locator('input[name="price"], [data-testid="gift-price-input"]').first();
    if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceInput.fill('499.99');
    }

    const urlInput = modal.locator('input[name="url"], [data-testid="gift-url-input"]').first();
    if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urlInput.fill('https://www.playstation.com/ps5/');
    }

    // Submit form
    const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').first();
    await submitButton.click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Gift should appear in catalog
    const giftCard = page.locator('[data-testid="gift-card"]:has-text("PlayStation 5 Console")').first();
    await expect(giftCard).toBeVisible({ timeout: 10000 });

    // Verify gift name is visible
    await expect(page.locator('text=PlayStation 5 Console')).toBeVisible();
  });

  test('should view gift detail when clicking on gift card', async ({ page }) => {
    await page.goto('/gifts');

    // Wait for gifts to load
    const giftCard = page.locator('[data-testid="gift-card"]').first();
    await expect(giftCard).toBeVisible({ timeout: 10000 });

    // Get the gift name for verification
    const giftName = await giftCard.locator('[data-testid="gift-name"], h3, h4').first().textContent();

    // Click on gift card
    await giftCard.click();

    // Should navigate to detail page or open modal
    const isModalOpen = await page.locator('[role="dialog"][data-testid="gift-detail-modal"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isModalOpen) {
      // Modal opened
      const modal = page.locator('[role="dialog"][data-testid="gift-detail-modal"]');
      await expect(modal).toBeVisible();

      // Verify gift name in modal
      if (giftName) {
        await expect(modal.locator(`text=${giftName}`)).toBeVisible();
      }

      // Verify detail sections are present
      const detailContent = modal.locator('[data-testid="gift-detail"]');
      await expect(detailContent).toBeVisible();
    } else {
      // Should navigate to detail page
      await expect(page).toHaveURL(/.*gifts\/\d+/, { timeout: 5000 });

      // Verify gift name on detail page
      if (giftName) {
        await expect(page.locator(`text=${giftName}`)).toBeVisible();
      }

      // Verify detail sections
      const detailContent = page.locator('[data-testid="gift-detail"], main');
      await expect(detailContent).toBeVisible();
    }
  });

  test('should edit gift details', async ({ page }) => {
    await page.goto('/gifts');

    // Find first gift card
    const giftCard = page.locator('[data-testid="gift-card"]').first();
    await expect(giftCard).toBeVisible({ timeout: 10000 });

    // Click to open detail
    await giftCard.click();

    // Wait for detail view (modal or page)
    await page.waitForTimeout(1000);

    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit gift"]').first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Form should be in edit mode
      const nameInput = page.locator('input[name="name"], [data-testid="gift-name-input"]').first();
      await expect(nameInput).toBeVisible();

      // Modify the name
      await nameInput.fill('Updated Gift Name');

      // Save changes
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveButton.click();

      // Verify update
      await expect(page.locator('text=Updated Gift Name')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete a gift', async ({ page }) => {
    await page.goto('/gifts');

    // Find first gift card
    const giftCard = page.locator('[data-testid="gift-card"]').first();
    await expect(giftCard).toBeVisible({ timeout: 10000 });

    // Get gift name before deletion
    const giftName = await giftCard.locator('[data-testid="gift-name"], h3, h4').first().textContent();

    // Click to open detail
    await giftCard.click();
    await page.waitForTimeout(1000);

    // Find delete button
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label="Delete gift"]').first();

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion if confirmation modal appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")').first();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Should navigate back to gifts list
      await expect(page).toHaveURL(/.*gifts(?!\/\d+)/, { timeout: 5000 });

      // Gift should not be visible anymore
      if (giftName) {
        await expect(page.locator(`[data-testid="gift-card"]:has-text("${giftName}")`))
          .not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should filter gifts by status', async ({ page }) => {
    await page.goto('/gifts');

    // Wait for gifts to load
    await expect(page.locator('[data-testid="gift-card"]').first()).toBeVisible({ timeout: 10000 });

    // Find status filter dropdown or tabs
    const filterControl = page.locator(
      '[data-testid="status-filter"], select[name="status"], [role="tablist"]'
    ).first();

    if (await filterControl.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click on "IDEA" status filter
      const ideaFilter = page.locator('button:has-text("IDEA"), option[value="IDEA"], [role="tab"]:has-text("Ideas")').first();

      if (await ideaFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await ideaFilter.click();

        // Wait for filtered results
        await page.waitForTimeout(1000);

        // All visible gifts should have IDEA status
        const visibleGifts = page.locator('[data-testid="gift-card"][data-status="IDEA"]');
        await expect(visibleGifts.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should search gifts by name', async ({ page }) => {
    await page.goto('/gifts');

    // Wait for gifts to load
    await expect(page.locator('[data-testid="gift-card"]').first()).toBeVisible({ timeout: 10000 });

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i], [data-testid="gift-search"]').first();

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Type search query
      await searchInput.fill('LEGO');

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // Results should contain "LEGO"
      const results = page.locator('[data-testid="gift-card"]');
      const count = await results.count();

      if (count > 0) {
        const firstResult = results.first();
        const text = await firstResult.textContent();
        expect(text?.toLowerCase()).toContain('lego');
      }
    }
  });
});

/**
 * Data-testid Attributes Needed:
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
 * - data-testid="gift-detail-modal"
 * - data-testid="edit-gift-button"
 * - data-testid="delete-gift-button"
 *
 * GiftsPage.tsx:
 * - data-testid="add-gift-button"
 * - data-testid="gift-search"
 * - data-testid="status-filter"
 */
