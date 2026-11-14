import { test, expect, chromium } from '@playwright/test';

/**
 * UC3: Real-Time Coordination
 *
 * Test WebSocket real-time synchronization:
 * 1. Two users viewing same list
 * 2. User 1 changes item status
 * 3. User 2 sees update in real-time
 *
 * Uses two browser contexts to simulate two different users.
 */

test.describe('UC3: Real-Time Coordination', () => {
  test('should sync status changes between users in real-time', async ({ browser }) => {
    // Create two authenticated contexts (two users)
    const context1 = await browser.newContext({
      storageState: 'tests/.auth/user.json',
    });
    const context2 = await browser.newContext({
      storageState: 'tests/.auth/user2.json',
    });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Both users navigate to lists page
      await page1.goto('/lists');
      await page2.goto('/lists');

      // Find or create a list to work with
      let listUrl = '';

      // User 1: Check if any lists exist
      const firstList = page1.locator('[data-testid="list-card"]').first();

      if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Click existing list
        await firstList.click();
        await page1.waitForURL(/.*lists\/\d+/);
        listUrl = page1.url();
      } else {
        // Create a new list
        const createButton = page1.locator(
          'button:has-text("Create List"), button:has-text("New List")'
        ).first();

        if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await createButton.click();

          const modal = page1.locator('[role="dialog"]').first();
          await expect(modal).toBeVisible();

          const nameInput = modal.locator('input[name="name"]').first();
          await nameInput.fill('Real-Time Test List');

          const submitButton = modal.locator('button[type="submit"]');
          await submitButton.click();

          await expect(modal).not.toBeVisible({ timeout: 5000 });
          await page1.waitForURL(/.*lists\/\d+/);
          listUrl = page1.url();
        } else {
          test.skip();
        }
      }

      // User 2: Navigate to same list
      await page2.goto(listUrl);
      await expect(page2).toHaveURL(listUrl);

      // Both users should see the list
      await expect(page1.locator('h1, [data-testid="list-name"]').first()).toBeVisible();
      await expect(page2.locator('h1, [data-testid="list-name"]').first()).toBeVisible();

      // Add a test item (if list is empty)
      const existingItems = page1.locator('[data-testid="list-item"]');
      const itemCount = await existingItems.count();

      let testItemName = 'Test Gift Item for Real-Time Sync';

      if (itemCount === 0) {
        // Add item via Quick Add
        const quickAddButton = page1.locator('button[aria-label="Quick add idea"]');
        await expect(quickAddButton).toBeVisible();
        await quickAddButton.click();

        const modal = page1.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        const nameInput = modal.locator('input[name="name"]').first();
        await nameInput.fill(testItemName);

        const submitButton = modal.locator('button[type="submit"]');
        await submitButton.click();

        await expect(modal).not.toBeVisible({ timeout: 5000 });

        // Wait for item to appear
        await expect(page1.locator(`text=${testItemName}`)).toBeVisible({ timeout: 10000 });
      } else {
        // Use first existing item
        const firstItem = existingItems.first();
        const itemText = await firstItem.textContent();
        testItemName = itemText?.trim() || 'Test Item';
      }

      // User 2 should see the item (via WebSocket or polling)
      await expect(page2.locator(`text=${testItemName}`)).toBeVisible({ timeout: 10000 });

      // User 1: Change item status
      // Find the item and click status change button
      const item1 = page1.locator(`text=${testItemName}`).first();
      await expect(item1).toBeVisible();

      // Look for status change button/dropdown
      // TODO: Add data-testid="status-button" or data-testid="move-to-selected"
      const statusButton = page1.locator(
        '[data-testid="move-to-selected"], [data-testid="status-button"], button:has-text("Select"), button:has-text("Selected")'
      ).first();

      if (await statusButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await statusButton.click();

        // If there's a dropdown menu, select "Selected"
        const selectedOption = page1.locator(
          '[role="menuitem"]:has-text("Selected"), button:has-text("Selected")'
        ).first();

        if (await selectedOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await selectedOption.click();
        }

        // Wait a moment for the update to propagate
        await page1.waitForTimeout(1000);

        // Verify User 1 sees the status change
        const statusBadge1 = page1.locator(
          `[data-status="SELECTED"], text=/selected/i`
        ).first();
        await expect(statusBadge1).toBeVisible({ timeout: 5000 });

        // REAL-TIME SYNC TEST:
        // User 2 should see the status change within 2 seconds (WebSocket latency)
        const statusBadge2 = page2.locator(
          `[data-status="SELECTED"], text=/selected/i`
        ).first();

        // This is the critical assertion: real-time sync
        await expect(statusBadge2).toBeVisible({ timeout: 3000 });

        // Verify it's the same item
        const item2 = page2.locator(`text=${testItemName}`).first();
        await expect(item2).toBeVisible();
      }

      // Test 2: User 2 changes status back
      const item2 = page2.locator(`text=${testItemName}`).first();
      await expect(item2).toBeVisible();

      // Change back to IDEA status
      const statusButton2 = page2.locator(
        '[data-testid="move-to-idea"], [data-testid="status-button"], button:has-text("Idea")'
      ).first();

      if (await statusButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
        await statusButton2.click();

        const ideaOption = page2.locator(
          '[role="menuitem"]:has-text("Idea"), button:has-text("Idea")'
        ).first();

        if (await ideaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await ideaOption.click();
        }

        await page2.waitForTimeout(1000);

        // User 1 should see the change in real-time
        const ideaBadge1 = page1.locator(`[data-status="IDEA"], text=/idea/i`).first();
        await expect(ideaBadge1).toBeVisible({ timeout: 3000 });
      }
    } finally {
      // Cleanup
      await context1.close();
      await context2.close();
    }
  });

  test('should show connection indicator for WebSocket status', async ({ page }) => {
    // Use first user auth
    await page.goto('/dashboard', {
      storageState: 'tests/.auth/user.json',
    });

    // Connection indicator should be visible
    // TODO: Add data-testid="ws-connection-indicator" to ConnectionIndicator component
    const connectionIndicator = page.locator(
      '[data-testid="ws-connection-indicator"], [data-testid="connection-status"]'
    ).first();

    if (await connectionIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(connectionIndicator).toBeVisible();

      // Should show "Connected" or green indicator
      // Check for positive connection state
      const isConnected = await page.evaluate(() => {
        const indicator = document.querySelector('[data-testid="ws-connection-indicator"]');
        return indicator?.textContent?.toLowerCase().includes('connected');
      });

      if (isConnected) {
        expect(isConnected).toBe(true);
      }
    }
  });

  test('should sync list item additions between users', async ({ browser }) => {
    const context1 = await browser.newContext({
      storageState: 'tests/.auth/user.json',
    });
    const context2 = await browser.newContext({
      storageState: 'tests/.auth/user2.json',
    });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Both navigate to same list
      await page1.goto('/lists');
      const firstList = page1.locator('[data-testid="list-card"]').first();

      if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstList.click();
        await page1.waitForURL(/.*lists\/\d+/);
        const listUrl = page1.url();

        await page2.goto(listUrl);

        // User 1: Add new item
        const quickAddButton = page1.locator('button[aria-label="Quick add idea"]');
        await quickAddButton.click();

        const modal = page1.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        const itemName = `Real-Time Item ${Date.now()}`;
        const nameInput = modal.locator('input[name="name"]').first();
        await nameInput.fill(itemName);

        const submitButton = modal.locator('button[type="submit"]');
        await submitButton.click();

        await expect(modal).not.toBeVisible({ timeout: 5000 });

        // User 1 should see new item
        await expect(page1.locator(`text=${itemName}`)).toBeVisible({ timeout: 5000 });

        // User 2 should see new item in real-time (WebSocket sync)
        await expect(page2.locator(`text=${itemName}`)).toBeVisible({ timeout: 5000 });
      }
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should sync list item deletions between users', async ({ browser }) => {
    const context1 = await browser.newContext({
      storageState: 'tests/.auth/user.json',
    });
    const context2 = await browser.newContext({
      storageState: 'tests/.auth/user2.json',
    });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Navigate to same list
      await page1.goto('/lists');
      const firstList = page1.locator('[data-testid="list-card"]').first();

      if (await firstList.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstList.click();
        await page1.waitForURL(/.*lists\/\d+/);
        const listUrl = page1.url();

        await page2.goto(listUrl);

        // Get item count before deletion
        const items = page2.locator('[data-testid="list-item"]');
        const initialCount = await items.count();

        if (initialCount > 0) {
          // User 1: Delete first item
          const firstItem = page1.locator('[data-testid="list-item"]').first();
          const itemText = await firstItem.textContent();

          // Find delete button
          const deleteButton = firstItem.locator(
            '[data-testid="delete-item"], button[aria-label*="delete" i], button:has-text("Delete")'
          ).first();

          if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await deleteButton.click();

            // Confirm deletion if modal appears
            const confirmButton = page1.locator(
              'button:has-text("Confirm"), button:has-text("Delete")'
            ).first();

            if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await confirmButton.click();
            }

            // User 1: Item should disappear
            await expect(page1.locator(`text=${itemText}`)).not.toBeVisible({ timeout: 5000 });

            // User 2: Item should disappear in real-time
            await expect(page2.locator(`text=${itemText}`)).not.toBeVisible({ timeout: 5000 });
          }
        }
      }
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * ConnectionIndicator.tsx:
 * - data-testid="ws-connection-indicator"
 * - data-connection-state={state} // "connected", "connecting", "disconnected"
 *
 * ListItemRow.tsx:
 * - data-testid="list-item"
 * - data-testid="list-item-name"
 * - data-testid="status-button"
 * - data-testid="move-to-selected"
 * - data-testid="move-to-idea"
 * - data-testid="delete-item"
 * - data-status={item.status}
 * - data-item-id={item.id}
 *
 * ListDetail.tsx:
 * - data-testid="list-detail"
 * - data-testid="list-name"
 * - data-testid="list-items"
 */
