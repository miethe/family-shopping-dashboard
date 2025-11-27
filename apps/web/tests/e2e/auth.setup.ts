import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup
 *
 * Creates authenticated session for E2E tests.
 * Saves auth state to file for reuse across tests.
 *
 * Note: Currently uses mock auth since login form is not yet implemented.
 * TODO: Update when real authentication is implemented.
 */

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page, context }) => {
  // Navigate to home page
  await page.goto('/');

  /**
   * MOCK AUTHENTICATION
   *
   * Since the login form is not yet implemented (see app/(auth)/login/page.tsx),
   * we'll mock the authentication state for testing purposes.
   *
   * Replace this section when real authentication is implemented:
   *
   * await page.goto('/login');
   * await page.fill('input[name="email"]', 'test@example.com');
   * await page.fill('input[name="password"]', 'password123');
   * await page.click('button[type="submit"]');
   * await page.waitForURL('/dashboard');
   */

  // Mock auth token in localStorage
  await context.addCookies([
    {
      name: 'auth_token',
      value: 'mock-jwt-token-for-testing',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Set mock user data in localStorage
  await page.evaluate(() => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
      })
    );
  });

  // Navigate to dashboard to verify auth works
  await page.goto('/dashboard');

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

/**
 * Setup for multi-user WebSocket tests
 * Creates second authenticated user
 */
setup('authenticate user 2', async ({ page, context }) => {
  const authFile2 = 'tests/.auth/user2.json';

  await page.goto('/');

  // Mock auth for second user
  await context.addCookies([
    {
      name: 'auth_token',
      value: 'mock-jwt-token-for-testing-user2',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.evaluate(() => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 2,
        email: 'test2@example.com',
        name: 'Test User 2',
        created_at: new Date().toISOString(),
      })
    );
  });

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);
  await page.context().storageState({ path: authFile2 });
});
