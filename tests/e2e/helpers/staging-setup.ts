/**
 * Global setup for staging E2E tests
 * Handles authentication and environment preparation
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up staging E2E tests...');
  
  // Check if staging environment is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test basic connectivity to staging
    await page.goto('https://staging.envoyou.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Staging environment is accessible');
    
    // Check if we can reach the API
    const response = await page.request.get('/api/health');
    if (response.ok()) {
      console.log('✅ Staging API is responding');
    } else {
      console.warn('⚠️ Staging API health check failed, tests may be limited');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to staging environment:', error);
    throw new Error('Staging environment not accessible');
  } finally {
    await browser.close();
  }
  
  console.log('✅ Staging setup complete');
}

export default globalSetup;