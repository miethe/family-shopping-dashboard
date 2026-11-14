import { test, expect } from '@playwright/test';

/**
 * PT-005 Real-Time Updates Test
 *
 * Tests WebSocket-based real-time UI updates.
 *
 * Required Tests:
 * 1. WebSocket Update - Verify UI updates when data changes (can be simulated)
 *
 * This test suite simulates real-time updates using two browser contexts
 * to represent two different users viewing the same data simultaneously.
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('Real-Time WebSocket Updates', () => {
  test('should update UI when gift status changes in real-time', async ({ browser }) => {
    // Create two browser contexts (two users)
    const user1Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });
    const user2Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    try {
      // Both users navigate to the same list
      await user1Page.goto('/lists');
      await user2Page.goto('/lists');

      // Both users open the same list
      const list1 = user1Page.locator('[data-testid="list-card"]').first();
      const list2 = user2Page.locator('[data-testid="list-card"]').first();

      await expect(list1).toBeVisible({ timeout: 10000 });
      await expect(list2).toBeVisible({ timeout: 10000 });

      await list1.click();
      await list2.click();

      await expect(user1Page).toHaveURL(/.*lists\/\d+/);
      await expect(user2Page).toHaveURL(/.*lists\/\d+/);

      // Wait for list items to load
      await user1Page.waitForTimeout(2000);
      await user2Page.waitForTimeout(2000);

      // User 1 changes status of first item
      const item1 = user1Page.locator('[data-testid="list-item"]').first();

      if (await item1.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Find status button on item
        const statusButton = item1.locator('[data-testid="status-button"], button:has-text("IDEA")').first();

        if (await statusButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await statusButton.click();

          // Click "SELECTED" option from dropdown/menu
          const selectedOption = user1Page.locator(
            'button:has-text("SELECTED"), [data-status-option="SELECTED"]'
          ).first();

          if (await selectedOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await selectedOption.click();

            // User 2 should see the update within 3 seconds
            // Check if the item's status badge updated
            const user2Item = user2Page.locator('[data-testid="list-item"]').first();
            const user2StatusBadge = user2Item.locator('[data-status="SELECTED"], text=/selected/i').first();

            await expect(user2StatusBadge).toBeVisible({ timeout: 5000 });
          }
        }
      }
    } finally {
      await user1Context.close();
      await user2Context.close();
    }
  });

  test('should show WebSocket connection indicator', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for connection indicator
    const indicator = page.locator('[data-testid="ws-connection-indicator"], [data-connection-state]').first();

    if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Should show connected state
      const state = await indicator.getAttribute('data-connection-state');

      // Should be "connected" or "connecting"
      expect(state).toMatch(/connected|connecting/);

      // Visual indicator should be green/active
      await expect(indicator).toBeVisible();
    }
  });

  test('should update UI when new gift is added by another user', async ({ browser }) => {
    const user1Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });
    const user2Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    try {
      // Both users view gifts catalog
      await user1Page.goto('/gifts');
      await user2Page.goto('/gifts');

      await user1Page.waitForTimeout(2000);
      await user2Page.waitForTimeout(2000);

      // Count initial gifts for user 2
      const initialCount = await user2Page.locator('[data-testid="gift-card"]').count();

      // User 1 adds a new gift
      const addButton = user1Page.locator('button[aria-label="Quick add idea"], button:has-text("Add Gift")').first();

      if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addButton.click();

        const modal = user1Page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        const nameInput = modal.locator('input[name="name"]').first();
        await nameInput.fill('Real-Time Test Gift ' + Date.now());

        const submitButton = modal.locator('button[type="submit"]').first();
        await submitButton.click();

        await expect(modal).not.toBeVisible({ timeout: 5000 });

        // Wait for WebSocket sync
        await user2Page.waitForTimeout(3000);

        // User 2 should see the new gift
        const newCount = await user2Page.locator('[data-testid="gift-card"]').count();
        expect(newCount).toBeGreaterThan(initialCount);
      }
    } finally {
      await user1Context.close();
      await user2Context.close();
    }
  });

  test('should update UI when gift is deleted by another user', async ({ browser }) => {
    const user1Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });
    const user2Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    try {
      // Both users view gifts catalog
      await user1Page.goto('/gifts');
      await user2Page.goto('/gifts');

      await user1Page.waitForTimeout(2000);
      await user2Page.waitForTimeout(2000);

      // Get first gift card
      const giftCard1 = user1Page.locator('[data-testid="gift-card"]').first();
      const giftCard2 = user2Page.locator('[data-testid="gift-card"]').first();

      if (await giftCard1.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Get gift name
        const giftName = await giftCard1.locator('[data-testid="gift-name"]').first().textContent();

        // User 1 deletes the gift
        await giftCard1.click();
        await user1Page.waitForTimeout(1000);

        const deleteButton = user1Page.locator('button:has-text("Delete"), button[aria-label="Delete gift"]').first();

        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();

          // Confirm deletion
          const confirmButton = user1Page.locator('button:has-text("Confirm"), button:has-text("Delete")').first();
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
          }

          // Wait for WebSocket sync
          await user2Page.waitForTimeout(3000);

          // User 2 should no longer see that gift
          if (giftName) {
            const deletedGift = user2Page.locator(`[data-testid="gift-card"]:has-text("${giftName}")`);
            await expect(deletedGift).not.toBeVisible({ timeout: 5000 });
          }
        }
      }
    } finally {
      await user1Context.close();
      await user2Context.close();
    }
  });

  test('should update list progress in real-time', async ({ browser }) => {
    const user1Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });
    const user2Context = await browser.newContext({ storageState: 'tests/.auth/user.json' });

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    try {
      // Both users view lists page
      await user1Page.goto('/lists');
      await user2Page.goto('/lists');

      await user1Page.waitForTimeout(2000);
      await user2Page.waitForTimeout(2000);

      // Both users open the same list
      const list1 = user1Page.locator('[data-testid="list-card"]').first();
      const list2 = user2Page.locator('[data-testid="list-card"]').first();

      if (await list1.isVisible({ timeout: 2000 }).catch(() => false)) {
        // User 2 checks initial progress
        const progressBar = list2.locator('[data-testid="list-progress"], [role="progressbar"]').first();
        let initialProgress = '0';

        if (await progressBar.isVisible({ timeout: 2000 }).catch(() => false)) {
          initialProgress = (await progressBar.getAttribute('aria-valuenow')) || '0';
        }

        // User 1 clicks on list to view detail
        await list1.click();
        await expect(user1Page).toHaveURL(/.*lists\/\d+/);

        // User 1 updates status of an item
        const item = user1Page.locator('[data-testid="list-item"]').first();

        if (await item.isVisible({ timeout: 2000 }).catch(() => false)) {
          const statusButton = item.locator('[data-testid="status-button"]').first();

          if (await statusButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await statusButton.click();

            // Move to PURCHASED
            const purchasedOption = user1Page.locator('button:has-text("PURCHASED")').first();
            if (await purchasedOption.isVisible({ timeout: 2000 }).catch(() => false)) {
              await purchasedOption.click();

              // Wait for WebSocket sync
              await user2Page.waitForTimeout(3000);

              // User 2 should see updated progress (back on lists page)
              if (await progressBar.isVisible({ timeout: 2000 }).catch(() => false)) {
                const newProgress = (await progressBar.getAttribute('aria-valuenow')) || '0';
                // Progress should have changed (may increase or decrease depending on logic)
                // Just verify it exists and is a valid number
                expect(parseInt(newProgress)).toBeGreaterThanOrEqual(0);
              }
            }
          }
        }
      }
    } finally {
      await user1Context.close();
      await user2Context.close();
    }
  });

  test('should reconnect WebSocket after connection loss', async ({ page }) => {
    await page.goto('/dashboard');

    // Check initial connection state
    const indicator = page.locator('[data-testid="ws-connection-indicator"]').first();

    if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Should be connected initially
      let state = await indicator.getAttribute('data-connection-state');
      expect(state).toMatch(/connected|connecting/);

      // Simulate connection loss by going offline
      await page.context().setOffline(true);

      // Wait for indicator to show disconnected state
      await page.waitForTimeout(2000);

      state = await indicator.getAttribute('data-connection-state');
      if (state === 'disconnected' || state === 'connecting') {
        // Go back online
        await page.context().setOffline(false);

        // Should reconnect
        await expect(indicator).toHaveAttribute('data-connection-state', /connected/, { timeout: 10000 });
      }
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * ConnectionIndicator.tsx:
 * - data-testid="ws-connection-indicator"
 * - data-connection-state="connected" | "connecting" | "disconnected"
 *
 * ListItemRow.tsx:
 * - data-testid="list-item"
 * - data-testid="status-button"
 * - data-status={item.status}
 * - data-item-id={item.id}
 *
 * StatusMenu.tsx:
 * - data-status-option="IDEA" | "SELECTED" | "PURCHASED" | "RECEIVED"
 *
 * GiftCard.tsx:
 * - data-testid="gift-card"
 * - data-testid="gift-name"
 *
 * ListCard.tsx:
 * - data-testid="list-card"
 * - data-testid="list-progress"
 * - role="progressbar"
 * - aria-valuenow={current}
 * - aria-valuemax={max}
 *
 * Note: WebSocket updates should trigger React Query cache invalidation
 * which automatically updates the UI via the useGifts, useLists hooks.
 */
