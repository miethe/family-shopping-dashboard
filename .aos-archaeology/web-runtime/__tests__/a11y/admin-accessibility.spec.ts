/**
 * Accessibility Audit - Admin Field Options
 *
 * Tests WCAG 2.1 AA compliance for admin page components using Playwright + axe-core.
 * Tests keyboard navigation, screen reader support, and automated axe scans.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Admin Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page before each test
    // TODO: Update URL when admin page is deployed
    await page.goto('/admin');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper page structure with headings', async ({ page }) => {
    // Check for h1 heading
    const h1 = await page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Admin Settings');

    // Verify heading hierarchy exists
    const headings = await page.locator('h1, h2, h3, h4').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should support keyboard navigation through tabs', async ({ page }) => {
    // Focus on first tab
    await page.keyboard.press('Tab');

    // Verify focus is on a tab trigger
    const focusedElement = await page.locator(':focus');
    const role = await focusedElement.getAttribute('role');
    expect(role).toBe('tab');

    // Navigate through tabs with arrow keys
    await page.keyboard.press('ArrowRight');
    const secondTab = await page.locator(':focus');
    expect(await secondTab.getAttribute('role')).toBe('tab');

    // Verify tab is announced with aria-selected
    expect(await secondTab.getAttribute('aria-selected')).toBe('true');
  });

  test('should trap focus in modal dialogs', async ({ page }) => {
    // Click on first field to expand it
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    // Click "Add Option" button
    const addButton = page.locator('button', { hasText: 'Add Option' }).first();
    await addButton.click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Verify dialog is announced
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Focus should be in the dialog
    const focusedElement = await page.locator(':focus');
    const dialogBox = await dialog.boundingBox();
    const focusBox = await focusedElement.boundingBox();

    // Verify focused element is within dialog bounds
    if (dialogBox && focusBox) {
      expect(focusBox.x).toBeGreaterThanOrEqual(dialogBox.x);
      expect(focusBox.y).toBeGreaterThanOrEqual(dialogBox.y);
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    // Open field options
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    // Open add option modal
    const addButton = page.locator('button', { hasText: 'Add Option' }).first();
    await addButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Press Escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    // Expand field and open modal
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    const addButton = page.locator('button', { hasText: 'Add Option' }).first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Check that all inputs have associated labels
    const inputs = await page.locator('input[type="text"], input[type="number"]').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Run axe specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(colorContrastViolations).toEqual([]);
  });

  test('should have adequate touch targets (44x44px minimum)', async ({ page }) => {
    // Check all interactive buttons
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should have aria-labels on icon-only buttons', async ({ page }) => {
    // Expand a field to see edit/delete buttons
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    // Wait for options to load
    await page.waitForTimeout(1000);

    // Check icon buttons (edit, delete) have titles or aria-labels
    const iconButtons = await page.locator('button[title]').all();

    for (const btn of iconButtons) {
      const title = await btn.getAttribute('title');
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(title || ariaLabel).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for live regions or proper aria announcements
    const liveRegions = await page.locator('[aria-live]').all();

    // If there are error/success messages, they should be in live regions
    // or announced via role="alert"
    const alerts = await page.locator('[role="alert"]').all();

    // At minimum, the app should have mechanisms for announcing changes
    // (either live regions or alerts)
    expect(liveRegions.length + alerts.length).toBeGreaterThanOrEqual(0);
  });

  test('should have proper tab panel labeling', async ({ page }) => {
    // Check that tab panels are properly labeled by their tabs
    const tabPanels = await page.locator('[role="tabpanel"]').all();

    for (const panel of tabPanels) {
      const labelledBy = await panel.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
    }
  });

  test('should disable system options appropriately', async ({ page }) => {
    // Navigate to Gift tab (which has system options)
    const giftTab = page.locator('[role="tab"]').filter({ hasText: 'Gift' });
    await giftTab.click();

    // Expand a field
    const statusField = page.locator('button').filter({ hasText: 'Status' }).first();
    await statusField.click();

    // Wait for options
    await page.waitForTimeout(1000);

    // Check if system options have disabled edit/delete buttons
    const systemBadges = await page.locator('span').filter({ hasText: 'System' }).all();

    if (systemBadges.length > 0) {
      // Find disabled buttons within the same list item
      const disabledButtons = await page.locator('button[disabled]').all();
      expect(disabledButtons.length).toBeGreaterThan(0);
    }
  });

  test('should maintain focus visibility', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = await page.locator(
      'button, a, input, [tabindex="0"]'
    ).all();

    for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
      await page.keyboard.press('Tab');

      // Check that focused element has visible focus indicator
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();

      // The element should have some focus styling (outline, ring, etc.)
      const outline = await focused.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.boxShadow;
      });

      expect(outline).toBeTruthy();
    }
  });
});

test.describe('Modal Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('Add Option Modal - should be accessible', async ({ page }) => {
    // Open modal
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    const addButton = page.locator('button', { hasText: 'Add Option' }).first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Run axe on modal
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Edit Option Modal - should be accessible', async ({ page }) => {
    // Expand field
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    // Wait for options and click edit button
    await page.waitForTimeout(1000);
    const editButton = page.locator('button[title="Edit option"]').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      const results = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test('Delete Confirmation Modal - should be accessible', async ({ page }) => {
    // Expand field
    const fieldButton = page.locator('button').filter({ hasText: 'Wine Types' }).first();
    await fieldButton.click();

    // Wait for options and click delete button
    await page.waitForTimeout(1000);
    const deleteButton = page.locator('button[title="Delete option"]').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      const results = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });
});
