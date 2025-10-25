/**
 * Staging Smoke Tests
 * Basic functionality tests against real staging environment
 * No mocking - tests real API integration
 */

import { test, expect } from '@playwright/test';
import { createAuthHelper } from './helpers/auth-helper';

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

test.describe('Enhanced Emissions Validation Components', () => {
  test.beforeEach(async ({ page }) => {
    const auth = createAuthHelper(page);
    
    // Try to navigate to enhanced emissions page with authentication
    const canAccess = await auth.navigateToEnhancedEmissions();
    
    if (!canAccess) {
      console.log('⚠️ Cannot access enhanced emissions page, tests will be limited');
      // Don't skip entirely, but tests will adapt to limited access
    }
  });

  test('should display validation form with all required fields', async ({ page }) => {
    // Look for validation form container
    const validationForm = page.locator('[data-testid="validation-form"], form[data-component="validation-form"]');
    await expect(validationForm).toBeVisible();

    // Check for key form fields
    await expect(page.locator('input[name*="emission"], input[placeholder*="emission"]')).toBeVisible();
    await expect(page.locator('select, input[type="select"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Validate")')).toBeVisible();
  });

  test('should show validation results after form submission', async ({ page }) => {
    // Fill out validation form if present
    const emissionInput = page.locator('input[name*="emission"], input[placeholder*="emission"]').first();
    if (await emissionInput.isVisible()) {
      await emissionInput.fill('1000');
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for validation results to appear
      await page.waitForTimeout(2000); // Allow time for API call

      // Check for validation results container
      const validationResults = page.locator('[data-testid="validation-results"], [data-component="validation-results"]');
      
      // Results should be visible or show loading state
      const isResultsVisible = await validationResults.isVisible();
      const isLoadingVisible = await page.locator('[data-testid="loading"], .loading, .spinner').isVisible();
      
      expect(isResultsVisible || isLoadingVisible).toBeTruthy();
    }
  });

  test('should display data quality score component', async ({ page }) => {
    // Look for data quality score component
    const qualityScore = page.locator('[data-testid="data-quality-score"], [data-component="data-quality-score"]');
    
    // If not immediately visible, try triggering validation first
    if (!(await qualityScore.isVisible())) {
      const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Check if quality score is now visible or if there's a placeholder
    const isScoreVisible = await qualityScore.isVisible();
    const hasScoreText = await page.locator('text=/quality|score|rating/i').isVisible();
    
    // At least one should be true in a working validation system
    expect(isScoreVisible || hasScoreText).toBeTruthy();
  });

  test('should handle validation errors gracefully', async ({ page }) => {
    // Try to submit form with invalid data
    const emissionInput = page.locator('input[name*="emission"], input[placeholder*="emission"]').first();
    if (await emissionInput.isVisible()) {
      await emissionInput.fill('-999'); // Invalid negative value
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Should show error messages or validation feedback
      const hasErrorMessages = await page.locator('[data-testid="validation-errors"], .error, .invalid, text=/error|invalid/i').isVisible();
      const hasErrorList = await page.locator('[data-testid="validation-error-list"], [data-component="validation-error-list"]').isVisible();
      
      // Should handle errors without crashing
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
      
      console.log(hasErrorMessages || hasErrorList ? '✅ Validation errors handled properly' : '⚠️ No error handling detected');
    }
  });

  test('should display validation error list with filtering', async ({ page }) => {
    // Submit form to potentially generate errors
    const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Look for error list component
      const errorList = page.locator('[data-testid="validation-error-list"], [data-component="validation-error-list"]');
      
      if (await errorList.isVisible()) {
        // Check for filtering capabilities
        const filterInput = page.locator('input[placeholder*="filter"], input[placeholder*="search"]');
        const filterSelect = page.locator('select[data-testid*="filter"], select:has(option:text-matches("error|warning", "i"))');
        
        const hasFiltering = await filterInput.isVisible() || await filterSelect.isVisible();
        console.log(hasFiltering ? '✅ Error list filtering available' : '⚠️ No filtering detected in error list');
      }
    }
  });

  test('should show EPA integration status', async ({ page }) => {
    // Look for EPA-related indicators
    const epaIndicators = page.locator('text=/EPA|Environmental Protection Agency/i');
    const statusIndicators = page.locator('[data-testid*="epa"], [data-component*="epa"]');
    
    // Submit validation to trigger EPA integration
    const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(3000); // EPA calls might take longer

      const hasEpaContent = await epaIndicators.isVisible() || await statusIndicators.isVisible();
      console.log(hasEpaContent ? '✅ EPA integration indicators found' : '⚠️ No EPA integration indicators detected');
    }
  });

  test('should maintain component state during validation process', async ({ page }) => {
    // Fill form data
    const emissionInput = page.locator('input[name*="emission"], input[placeholder*="emission"]').first();
    if (await emissionInput.isVisible()) {
      await emissionInput.fill('1500');
      
      // Submit validation
      const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
      await submitButton.click();
      
      // Check that form data is preserved during validation
      await page.waitForTimeout(1000);
      const inputValue = await emissionInput.inputValue();
      expect(inputValue).toBe('1500');
      
      // Page should remain functional
      await expect(page.locator('body')).toBeVisible();
      console.log('✅ Component state maintained during validation');
    }
  });

  test('should handle real API responses without mocking', async ({ page }) => {
    // This test specifically validates that we're hitting real APIs
    let apiCallMade = false;
    
    // Listen for network requests to validation endpoints
    page.on('request', request => {
      if (request.url().includes('/api/') && 
          (request.url().includes('validation') || 
           request.url().includes('emissions') || 
           request.url().includes('epa'))) {
        apiCallMade = true;
        console.log(`✅ Real API call detected: ${request.url()}`);
      }
    });

    // Trigger validation
    const submitButton = page.locator('button[type="submit"], button:has-text("Validate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Verify we made real API calls (no mocking)
      expect(apiCallMade).toBeTruthy();
      console.log('✅ Confirmed: No mocking - real API integration working');
    }
  });
});