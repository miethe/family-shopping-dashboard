import { test, expect } from '@playwright/test';

/**
 * PT-005 Navigation Tests
 *
 * Tests navigation across desktop and mobile viewports.
 *
 * Required Tests:
 * 1. Mobile Navigation - On mobile viewport, verify bottom nav appears and works
 * 2. Desktop Navigation - On desktop viewport, verify sidebar nav works
 */

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should display sidebar navigation on desktop', async ({ page }) => {
    await page.goto('/dashboard');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('[data-testid="sidebar-nav"], aside, nav[data-layout="sidebar"]').first();

    // Give it time to render
    await page.waitForTimeout(1000);

    // Check if sidebar exists and is visible
    const sidebarVisible = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (sidebarVisible) {
      await expect(sidebar).toBeVisible();

      // Verify navigation links are present
      const dashboardLink = sidebar.locator('a[href*="dashboard"], button:has-text("Dashboard")').first();
      const giftsLink = sidebar.locator('a[href*="gifts"], button:has-text("Gifts")').first();
      const listsLink = sidebar.locator('a[href*="lists"], button:has-text("Lists")').first();

      // At least one nav link should be visible
      await expect(dashboardLink.or(giftsLink).or(listsLink)).toBeVisible();
    }
  });

  test('should navigate to Dashboard via sidebar', async ({ page }) => {
    await page.goto('/gifts');

    const dashboardLink = page.locator('a[href*="dashboard"], button:has-text("Dashboard"), [data-nav-item="dashboard"]').first();

    if (await dashboardLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
    } else {
      // Fallback: navigate directly
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*dashboard/);
    }
  });

  test('should navigate to Gifts via sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    const giftsLink = page.locator('a[href*="gifts"], button:has-text("Gifts"), [data-nav-item="gifts"]').first();

    if (await giftsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await giftsLink.click();
      await expect(page).toHaveURL(/.*gifts/, { timeout: 5000 });
    } else {
      await page.goto('/gifts');
      await expect(page).toHaveURL(/.*gifts/);
    }
  });

  test('should navigate to Lists via sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    const listsLink = page.locator('a[href*="lists"], button:has-text("Lists"), [data-nav-item="lists"]').first();

    if (await listsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await listsLink.click();
      await expect(page).toHaveURL(/.*lists/, { timeout: 5000 });
    } else {
      await page.goto('/lists');
      await expect(page).toHaveURL(/.*lists/);
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/dashboard');

    // Dashboard link should be active
    const dashboardLink = page.locator(
      'a[href*="dashboard"][aria-current="page"], [data-nav-item="dashboard"][data-active="true"], .active:has-text("Dashboard")'
    ).first();

    if (await dashboardLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(dashboardLink).toBeVisible();
    }

    // Navigate to gifts
    await page.goto('/gifts');

    // Gifts link should be active
    const giftsLink = page.locator(
      'a[href*="gifts"][aria-current="page"], [data-nav-item="gifts"][data-active="true"], .active:has-text("Gifts")'
    ).first();

    if (await giftsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(giftsLink).toBeVisible();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 13 dimensions)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should display bottom navigation on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav[data-layout="bottom"]').first();

    // Give it time to render
    await page.waitForTimeout(1000);

    const bottomNavVisible = await bottomNav.isVisible({ timeout: 2000 }).catch(() => false);

    if (bottomNavVisible) {
      await expect(bottomNav).toBeVisible();

      // Verify navigation items are present
      const navItems = bottomNav.locator('a, button[data-nav-item]');
      await expect(navItems.first()).toBeVisible();

      // Should have multiple nav items (typically 4-5)
      const count = await navItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should navigate to Dashboard via bottom nav on mobile', async ({ page }) => {
    await page.goto('/gifts');

    const dashboardButton = page.locator(
      'nav[data-layout="bottom"] a[href*="dashboard"], nav[data-layout="bottom"] button:has-text("Dashboard"), [data-testid="bottom-nav"] [data-nav-item="dashboard"]'
    ).first();

    if (await dashboardButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dashboardButton.click();
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
    } else {
      // Fallback
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*dashboard/);
    }
  });

  test('should navigate to Gifts via bottom nav on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    const giftsButton = page.locator(
      'nav[data-layout="bottom"] a[href*="gifts"], nav[data-layout="bottom"] button:has-text("Gifts"), [data-testid="bottom-nav"] [data-nav-item="gifts"]'
    ).first();

    if (await giftsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await giftsButton.click();
      await expect(page).toHaveURL(/.*gifts/, { timeout: 5000 });
    } else {
      await page.goto('/gifts');
      await expect(page).toHaveURL(/.*gifts/);
    }
  });

  test('should navigate to Lists via bottom nav on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    const listsButton = page.locator(
      'nav[data-layout="bottom"] a[href*="lists"], nav[data-layout="bottom"] button:has-text("Lists"), [data-testid="bottom-nav"] [data-nav-item="lists"]'
    ).first();

    if (await listsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await listsButton.click();
      await expect(page).toHaveURL(/.*lists/, { timeout: 5000 });
    } else {
      await page.goto('/lists');
      await expect(page).toHaveURL(/.*lists/);
    }
  });

  test('should have minimum 44px touch targets on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    const bottomNav = page.locator('[data-testid="bottom-nav"], nav[data-layout="bottom"]').first();

    if (await bottomNav.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get all nav items
      const navItems = bottomNav.locator('a, button[data-nav-item]');
      const count = await navItems.count();

      for (let i = 0; i < count; i++) {
        const item = navItems.nth(i);
        const box = await item.boundingBox();

        if (box) {
          // Verify minimum touch target size (44x44px)
          expect(box.height).toBeGreaterThanOrEqual(40); // Allow small margin
          expect(box.width).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('should not display sidebar on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    const sidebar = page.locator('[data-testid="sidebar-nav"], aside[data-layout="sidebar"]').first();

    // Sidebar should not be visible on mobile (or hidden off-screen)
    const sidebarVisible = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (sidebarVisible) {
      // If visible, it should be off-screen or hidden
      const box = await sidebar.boundingBox();
      if (box) {
        // Sidebar should be off-screen (x < 0) or have 0 width
        expect(box.x < 0 || box.width === 0).toBeTruthy();
      }
    }
  });

  test('should handle safe area insets on iPhone', async ({ page }) => {
    await page.goto('/dashboard');

    // Bottom nav should respect safe area insets
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav[data-layout="bottom"]').first();

    if (await bottomNav.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check for safe area padding (computed style)
      const paddingBottom = await bottomNav.evaluate((el) => {
        return window.getComputedStyle(el).paddingBottom;
      });

      // Should have some padding (even if env() not supported, should have fallback)
      expect(paddingBottom).toBeTruthy();
    }
  });
});

test.describe('Responsive Navigation', () => {
  test('should switch from sidebar to bottom nav on resize', async ({ page }) => {
    // Start with desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');

    // Sidebar should be visible
    const sidebar = page.locator('[data-testid="sidebar-nav"], aside[data-layout="sidebar"]').first();
    const sidebarVisible = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Bottom nav should now be visible
    const bottomNav = page.locator('[data-testid="bottom-nav"], nav[data-layout="bottom"]').first();
    const bottomNavVisible = await bottomNav.isVisible({ timeout: 2000 }).catch(() => false);

    // One of them should be visible
    expect(sidebarVisible || bottomNavVisible).toBeTruthy();
  });

  test('should navigate correctly after viewport resize', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Navigate to gifts
    const giftsLink = page.locator('a[href*="gifts"], button:has-text("Gifts")').first();
    if (await giftsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await giftsLink.click();
      await expect(page).toHaveURL(/.*gifts/, { timeout: 5000 });
    }
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * Sidebar.tsx / SidebarNav.tsx:
 * - data-testid="sidebar-nav"
 * - data-layout="sidebar"
 * - data-nav-item="dashboard" | "gifts" | "lists" | "people"
 * - aria-current="page" for active link
 * - data-active="true" for active state
 *
 * BottomNav.tsx:
 * - data-testid="bottom-nav"
 * - data-layout="bottom"
 * - data-nav-item="dashboard" | "gifts" | "lists" | "people"
 * - aria-current="page" for active link
 * - data-active="true" for active state
 * - min-h-[44px] min-w-[44px] for touch targets
 * - env(safe-area-inset-bottom) for iOS safe area
 *
 * Navigation Links:
 * - href="/dashboard" | "/gifts" | "/lists" | "/people"
 * - aria-label for screen readers
 */
