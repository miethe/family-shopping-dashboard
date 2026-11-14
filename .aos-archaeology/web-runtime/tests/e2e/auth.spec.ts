import { test, expect } from '@playwright/test';

/**
 * PT-005 Authentication Tests
 *
 * Tests authentication flows and protected route access.
 *
 * Required Tests:
 * 1. Login Flow - Navigate to /login, enter credentials, verify redirect to dashboard
 * 2. Protected Route - Verify unauthenticated users are redirected to login
 */

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

    // Login page should be visible
    const loginForm = page.locator('form, [data-testid="login-form"]').first();
    await expect(loginForm).toBeVisible();
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);

    // Fill in login form
    // TODO: Add data-testid attributes to login form fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Submit login form
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Dashboard content should be visible
    const dashboardContent = page.locator('[data-testid="dashboard"], main').first();
    await expect(dashboardContent).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('[role="alert"], [data-testid="error-message"], text=/invalid|error|incorrect/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first using auth state
    page.context().addCookies([{
      name: 'auth_token',
      value: 'mock_token_123',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Find and click logout button
    // May be in user menu dropdown
    const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user" i]').first();
    if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userMenu.click();
    }

    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('should persist auth state across page navigation', async ({ page }) => {
    // Use auth state from setup
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to other pages
    await page.goto('/gifts');
    await expect(page).toHaveURL(/.*gifts/);

    await page.goto('/lists');
    await expect(page).toHaveURL(/.*lists/);

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/.*login/);
  });
});

/**
 * Data-testid Attributes Needed:
 *
 * LoginPage.tsx:
 * - data-testid="login-form"
 * - data-testid="email-input"
 * - data-testid="password-input"
 * - data-testid="submit-button"
 * - data-testid="error-message"
 *
 * Header/Navigation.tsx:
 * - data-testid="user-menu"
 * - data-testid="logout-button"
 *
 * Dashboard.tsx:
 * - data-testid="dashboard"
 */
