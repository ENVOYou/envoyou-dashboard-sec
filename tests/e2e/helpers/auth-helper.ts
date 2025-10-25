/**
 * Authentication helper for staging E2E tests
 * Provides utilities for login and session management
 */

import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Attempt to login with test credentials if available
   */
  async loginIfNeeded(): Promise<boolean> {
    const currentUrl = this.page.url();
    
    // If already on a protected page, we're likely authenticated
    if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
      return true;
    }

    // Check if we have test credentials in environment
    const testEmail = process.env.STAGING_TEST_EMAIL;
    const testPassword = process.env.STAGING_TEST_PASSWORD;

    if (!testEmail || !testPassword) {
      console.log('⚠️ No test credentials provided, skipping authentication');
      return false;
    }

    try {
      // Navigate to login if not already there
      if (!currentUrl.includes('/login')) {
        await this.page.goto('/login');
      }

      // Fill login form
      await this.page.locator('input[type="email"]').fill(testEmail);
      await this.page.locator('input[type="password"]').fill(testPassword);
      await this.page.locator('button[type="submit"]').click();

      // Wait for navigation after login
      await this.page.waitForURL(/\/(dashboard|enhanced-emissions)/, { timeout: 10000 });
      
      console.log('✅ Successfully authenticated with test credentials');
      return true;
    } catch (error) {
      console.log('⚠️ Authentication failed, continuing with limited access');
      return false;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const currentUrl = this.page.url();
    return !currentUrl.includes('/login') && !currentUrl.includes('/register');
  }

  /**
   * Navigate to enhanced emissions page with authentication check
   */
  async navigateToEnhancedEmissions(): Promise<boolean> {
    await this.page.goto('/enhanced-emissions');
    
    // If redirected to login, try to authenticate
    if (this.page.url().includes('/login')) {
      const loginSuccess = await this.loginIfNeeded();
      if (loginSuccess) {
        await this.page.goto('/enhanced-emissions');
        return !this.page.url().includes('/login');
      }
      return false;
    }
    
    return true;
  }
}

/**
 * Create auth helper instance for a page
 */
export function createAuthHelper(page: Page): AuthHelper {
  return new AuthHelper(page);
}