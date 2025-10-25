/**
 * Staging Smoke Tests
 * Basic functionality tests against real staging environment
 * No mocking - tests real API integration
 */

import { test, expect } from '@playwright/test';

test.describe('Staging Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login or show dashboard if authenticated
    await expect(page).toHaveURL(/\/(login|dashboard)/);
    
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load login page successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle navigation without errors', async ({ page }) => {
    await page.goto('/login');
    
    // Test navigation to different pages
    const pages = ['/login', '/register', '/forgot-password'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Should not show 404 or 500 errors
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    }
  });

  test('should load enhanced emissions page (if accessible)', async ({ page }) => {
    // Try to access enhanced emissions page
    await page.goto('/enhanced-emissions');
    
    // Should either redirect to login or show the page
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      // Redirected to login - this is expected behavior
      await expect(page.locator('form')).toBeVisible();
      console.log('✅ Enhanced emissions page properly protected');
    } else {
      // Page loaded - check for key elements
      await expect(page.locator('body')).toBeVisible();
      console.log('✅ Enhanced emissions page accessible');
    }
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/login');
    
    // Check for basic meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit login with invalid credentials
    await page.locator('input[type="email"]').fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Should show error message, not crash
    await expect(page.locator('body')).toBeVisible();
    
    // Should not show unhandled error pages
    await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/login');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Form should still be usable on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});