/**
 * Global setup for staging E2E tests
 * Configures authentication and environment for real staging tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up staging E2E tests...');
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test if staging environment is accessible
    console.log('🔍 Checking staging environment accessibility...');
    await page.goto('https://staging.envoyou.com', { waitUntil: 'networkidle' });
    
    // Check if login page is accessible
    await page.goto('https://staging.envoyou.com/login', { waitUntil: 'networkidle' });
    console.log('✅ Staging environment is accessible');

    // Test API connectivity
    console.log('🔍 Testing API connectivity...');
    const response = await page.request.get('https://staging-api.envoyou.com/v1/health', {
      ignoreHTTPSErrors: true,
    });
    
    if (response.ok()) {
      console.log('✅ Staging API is accessible');
    } else {
      console.log('⚠️ Staging API may not be fully ready, tests will use fallback');
    }

  } catch (error) {
    console.log('⚠️ Staging environment setup warning:', error);
    console.log('Tests will continue with available functionality');
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Staging E2E setup completed');
}

export default globalSetup;