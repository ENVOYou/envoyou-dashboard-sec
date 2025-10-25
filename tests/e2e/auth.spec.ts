import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login or show auth challenge
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test('should handle staging authentication', async ({ page }) => {
    // Set staging environment
    await page.addInitScript(() => {
      window.localStorage.setItem('staging_env', 'true');
    });

    await page.goto('/');

    // Should show staging auth challenge
    await expect(page.locator('text=Staging Environment')).toBeVisible();
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'AdminPass123!');

    // Mock successful login response
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          user: {
            id: '1',
            email: 'admin@example.com',
            full_name: 'Admin User',
            role: 'admin'
          }
        })
      });
    });

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle login failure', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');

    // Mock failed login response
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Invalid credentials'
        })
      });
    });

    await page.click('button[type="submit"]');

    // Should show error message in the error div
    await expect(page.locator('.bg-red-100')).toBeVisible();
    await expect(page.locator('.bg-red-100')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock-jwt-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin'
      }));
    });

    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Click on profile dropdown to open it
    await page.click('button:has-text("Admin User")');

    // Wait for dropdown to be visible and click logout button
    await expect(page.locator('button[aria-label="Logout"]')).toBeVisible();
    await page.click('button[aria-label="Logout"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    // Should clear localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });
});