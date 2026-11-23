import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  testMatch: 'calendar.spec.ts',
  use: { baseURL: 'http://127.0.0.1:3100', browserName: 'chromium', serviceWorkers: 'block', trace: 'retain-on-failure', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1600, height: 1000 } } },
  ],
  timeout: 60000,
});
