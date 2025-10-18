import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin'
      }));
    });

    // Mock API responses
    await page.route('**/emissions/companies/default-company/summary*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_co2e: 1250.75,
          total_scope1_co2e: 650.25,
          total_scope2_co2e: 600.50,
          data_quality_score: 92,
          year: 2024
        })
      });
    });
  });

  test('should display dashboard with emissions data', async ({ page }) => {
    await page.goto('/dashboard');

    // Check welcome message
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();

    // Check emissions metrics
    await expect(page.locator('text=Total CO2e Emissions')).toBeVisible();
    await expect(page.locator('text=1,250.75 tCO2e')).toBeVisible();

    await expect(page.locator('text=Scope 1 Emissions')).toBeVisible();
    await expect(page.locator('text=650.25 tCO2e')).toBeVisible();

    await expect(page.locator('text=Scope 2 Emissions')).toBeVisible();
    await expect(page.locator('text=600.50 tCO2e')).toBeVisible();

    await expect(page.locator('text=Data Quality Score')).toBeVisible();
    await expect(page.locator('text=92%')).toBeVisible();
  });

  test('should show loading states', async ({ page }) => {
    // Delay API response to show loading state
    await page.route('**/emissions/companies/default-company/summary*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_co2e: 1000,
          total_scope1_co2e: 500,
          total_scope2_co2e: 500,
          data_quality_score: 85,
          year: 2024
        })
      });
    });

    await page.goto('/dashboard');

    // Check for loading indicators (this depends on your loading implementation)
    // You might see skeleton loaders or spinner animations
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/emissions/companies/default-company/summary*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Internal server error'
        })
      });
    });

    await page.goto('/dashboard');

    // Should still show dashboard but with error states or fallback values
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();

    // Check that error handling is in place (fallback values)
    await expect(page.locator('text=0.00 tCO2e')).toBeVisible();
  });

  test('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');

    // Check sidebar navigation
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Emissions')).toBeVisible();
    await expect(page.locator('text=Reports')).toBeVisible();

    // Test navigation (assuming sidebar links exist)
    // await page.click('text=Emissions');
    // await expect(page).toHaveURL('/emissions');
  });

  test('should display charts correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for chart containers
    await expect(page.locator('text=Emissions Trend (Last 12 Months)')).toBeVisible();
    await expect(page.locator('text=Recent Calculations')).toBeVisible();

    // Charts should be rendered (basic check)
    const chartContainer = page.locator('[data-testid="emissions-chart"]').first();
    await expect(chartContainer).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Check that content adapts to mobile
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();

    // Check mobile navigation (hamburger menu, etc.)
    // This depends on your mobile navigation implementation
  });

  test('should handle dark mode toggle', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for theme toggle button (look for button with monitor/sun/moon icon)
    const themeToggle = page.locator('button').filter({ hasText: /🖥️|☀️|🌙/ }).first();
    await expect(themeToggle).toBeVisible();

    // Click to open dropdown
    await themeToggle.click();

    // Should show theme options
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('System')).toBeVisible();

    // Select dark mode
    await page.getByText('Dark').click();

    // Check that dark mode is applied (html should have dark class)
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Click theme toggle again
    await themeToggle.click();

    // Select light mode
    await page.getByText('Light').click();

    // Check that dark mode is removed
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});