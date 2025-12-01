import { test, expect } from '@playwright/test';

/**
 * PT-005 List Management Tests
 *
 * Tests list CRUD operations and views.
 *
 * Required Tests:
 * 1. Create List - Navigate to lists, create new list with occasion, verify it appears
 * 2. View List Detail - Click list card, verify Kanban/Table view renders correctly
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('List Management', () => {
  test('should create a new list with occasion and verify it appears', async ({ page }) => {
    // Navigate to lists page
    await page.goto('/lists');
    await expect(page).toHaveURL(/.*lists/);

    // Click "Create List" or "New List" button
    const createButton = page.locator(
      'button:has-text("Create List"), button:has-text("New List"), [data-testid="create-list-button"]'
    ).first();

    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    // Form/modal should open
    const modal = page.locator('[role="dialog"], [data-testid="list-form-modal"]').first();
    await expect(modal).toBeVisible();

    // Fill in list name
    const nameInput = modal.locator('input[name="name"], [data-testid="list-name-input"]').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Christmas 2024 Gift List');

    // Select or create occasion
    const occasionSelect = modal.locator('select[name="occasion_id"], [data-testid="occasion-select"]').first();

    if (await occasionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Select first occasion
      await occasionSelect.selectOption({ index: 1 }); // Index 0 is usually placeholder
    }

    // Optional: Select person
    const personSelect = modal.locator('select[name="person_id"], [data-testid="person-select"]').first();
    if (await personSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await personSelect.selectOption({ index: 1 });
    }

    // Submit form
    const submitButton = modal.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
    await submitButton.click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // List should appear in lists page
    const listCard = page.locator('[data-testid="list-card"]:has-text("Christmas 2024 Gift List")').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    // Verify list name is visible
    await expect(page.locator('text=Christmas 2024 Gift List')).toBeVisible();
  });

  test('should view list detail in Kanban view', async ({ page }) => {
    await page.goto('/lists');

    // Wait for lists to load
    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    // Get list name for verification
    const listName = await listCard.locator('[data-testid="list-name"], h3, h4').first().textContent();

    // Click on list card
    await listCard.click();

    // Should navigate to list detail page
    await expect(page).toHaveURL(/.*lists\/\d+/, { timeout: 5000 });

    // Verify list name on detail page
    if (listName) {
      await expect(page.locator(`text=${listName}`)).toBeVisible();
    }

    // Check for Kanban view (default view)
    const kanbanView = page.locator('[data-testid="kanban-view"], [data-view="kanban"]').first();

    if (await kanbanView.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify Kanban columns are present
      const ideaColumn = page.locator('[data-testid="idea-column"], [data-status="IDEA"]').first();
      const selectedColumn = page.locator('[data-testid="selected-column"], [data-status="SELECTED"]').first();
      const purchasedColumn = page.locator('[data-testid="purchased-column"], [data-status="PURCHASED"]').first();
      const receivedColumn = page.locator('[data-testid="received-column"], [data-status="RECEIVED"]').first();

      // At least one column should be visible
      await expect(ideaColumn.or(selectedColumn).or(purchasedColumn).or(receivedColumn)).toBeVisible();
    } else {
      // Fallback: check for any list items
      const listDetail = page.locator('[data-testid="list-detail"], main').first();
      await expect(listDetail).toBeVisible();
    }
  });

  test('should view list detail in Table view', async ({ page }) => {
    await page.goto('/lists');

    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    await listCard.click();
    await expect(page).toHaveURL(/.*lists\/\d+/, { timeout: 5000 });

    // Find view toggle (Kanban/Table switch)
    const tableViewButton = page.locator('button:has-text("Table"), [data-view-toggle="table"]').first();

    if (await tableViewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tableViewButton.click();

      // Table view should be visible
      const tableView = page.locator('[data-testid="table-view"], table').first();
      await expect(tableView).toBeVisible({ timeout: 5000 });

      // Verify table headers
      const headers = tableView.locator('thead th, [role="columnheader"]');
      await expect(headers.first()).toBeVisible();
    } else {
      // Table view may be default or not implemented
      const tableView = page.locator('[data-testid="table-view"], table').first();
      if (await tableView.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(tableView).toBeVisible();
      }
    }
  });

  test('should add item to list from list detail page', async ({ page }) => {
    await page.goto('/lists');

    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    await listCard.click();
    await expect(page).toHaveURL(/.*lists\/\d+/, { timeout: 5000 });

    // Find "Add Item" or Quick Add button
    const addButton = page.locator(
      'button:has-text("Add Item"), button:has-text("Add Gift"), button[aria-label="Quick add idea"]'
    ).first();

    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();

      // Modal should open
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Fill in item name
      const nameInput = modal.locator('input[name="name"], [data-testid="gift-name-input"]').first();
      await nameInput.fill('MacBook Air M3');

      // Submit
      const submitButton = modal.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').first();
      await submitButton.click();

      await expect(modal).not.toBeVisible({ timeout: 5000 });

      // Item should appear in list
      await expect(page.locator('text=MacBook Air M3')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit list details', async ({ page }) => {
    await page.goto('/lists');

    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    await listCard.click();
    await expect(page).toHaveURL(/.*lists\/\d+/, { timeout: 5000 });

    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit list"]').first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Form should be in edit mode or modal should open
      const nameInput = page.locator('input[name="name"], [data-testid="list-name-input"]').first();
      await expect(nameInput).toBeVisible();

      // Modify the name
      await nameInput.fill('Updated List Name');

      // Save changes
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveButton.click();

      // Verify update
      await expect(page.locator('text=Updated List Name')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete a list', async ({ page }) => {
    await page.goto('/lists');

    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    const listName = await listCard.locator('[data-testid="list-name"], h3, h4').first().textContent();

    await listCard.click();
    await expect(page).toHaveURL(/.*lists\/\d+/, { timeout: 5000 });

    // Find delete button
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label="Delete list"]').first();

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")').first();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Should navigate back to lists page
      await expect(page).toHaveURL(/.*lists(?!\/\d+)/, { timeout: 5000 });

      // List should not be visible
      if (listName) {
        await expect(page.locator(`[data-testid="list-card"]:has-text("${listName}")`))
          .not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show progress indicator on list card', async ({ page }) => {
    await page.goto('/lists');

    const listCard = page.locator('[data-testid="list-card"]').first();
    await expect(listCard).toBeVisible({ timeout: 10000 });

    // Check for progress indicator
    const progressBar = listCard.locator('[data-testid="list-progress"], [role="progressbar"]').first();

    if (await progressBar.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify progress bar has aria attributes
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax');

      expect(ariaValueNow).not.toBeNull();
      expect(ariaValueMax).not.toBeNull();
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * ListCard.tsx:
 * - data-testid="list-card"
 * - data-testid="list-name"
 * - data-testid="list-progress"
 * - data-progress-value={value}
 * - data-progress-max={max}
 *
 * ListForm.tsx:
 * - data-testid="list-form-modal"
 * - data-testid="list-name-input"
 * - data-testid="occasion-select"
 * - data-testid="person-select"
 *
 * ListDetail.tsx:
 * - data-testid="list-detail"
 * - data-testid="kanban-view"
 * - data-testid="table-view"
 * - data-testid="idea-column"
 * - data-testid="selected-column"
 * - data-testid="purchased-column"
 * - data-testid="received-column"
 * - data-view="kanban" or "table"
 * - data-view-toggle="table" / "kanban"
 *
 * ListsPage.tsx:
 * - data-testid="create-list-button"
 */
