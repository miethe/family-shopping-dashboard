import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 *
 * E2E test configuration for Family Gifting Dashboard.
 * Tests critical user journeys with mobile-first approach.
 *
 * Features:
 * - Desktop and mobile viewports
 * - Auth state persistence
 * - Screenshot on failure
 * - HTML reporter
 * - Local dev server integration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Parallel execution for faster test runs
  fullyParallel: true,

  // CI-specific settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Global test configuration
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Tracing on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',

    // Default timeout
    actionTimeout: 10000,
  },

  // Test projects for different browsers/viewports
  projects: [
    // Setup authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop Chrome
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome (iPhone/Android)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
    },

    // Safari Desktop (Apple ecosystem)
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Mobile Safari (iOS)
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
      dependencies: ['setup'],
    },
  ],

  // Local dev server
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },
});
