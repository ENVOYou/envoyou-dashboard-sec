import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for staging environment
 * Tests against real staging.envoyou.com with real API
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL for staging environment */
    baseURL: 'https://staging.envoyou.com',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Use real API endpoints in staging */
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* No local web server needed - testing against staging */
  webServer: undefined,
  
  /* Global setup for staging tests */
  globalSetup: './tests/e2e/helpers/staging-setup.ts',
});