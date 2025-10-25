import { test, expect } from '@playwright/test';
import { setupAuthentication, setupReportsAPI } from './helpers/auth-setup';

test.describe('Reports Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication and API mocks
    await setupAuthentication(page);
    await setupReportsAPI(page);
  });

  test('should display reports list page', async ({ page }) => {
    // Enable console logging to debug
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Navigate directly to the reports page
    await page.goto('/dashboard/reports', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/reports-page-debug.png', fullPage: true });

    // Check for the main heading (be more specific)
    await expect(page.locator('h1').filter({ hasText: 'Reports' })).toBeVisible();
    
    // Check for the description
    await expect(page.locator('text=Manage and track your SEC climate disclosure reports')).toBeVisible();

    // Check create report button
    await expect(page.locator('text=Create Report')).toBeVisible();
  });

  test('should display reports in table format', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Check table headers
    await expect(page.locator('text=Report')).toBeVisible();
    await expect(page.locator('text=Type')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Priority')).toBeVisible();
    await expect(page.locator('text=Company')).toBeVisible();
    await expect(page.locator('text=Year')).toBeVisible();
    await expect(page.locator('text=Updated')).toBeVisible();

    // Check report data is displayed
    await expect(page.locator('text=Q1 2024 GHG Report')).toBeVisible();
    await expect(page.locator('text=Annual Sustainability Report')).toBeVisible();

    // Check status badges
    await expect(page.locator('text=approved')).toBeVisible();
    await expect(page.locator('text=draft')).toBeVisible();

    // Check report types
    await expect(page.locator('text=GHG report')).toBeVisible();
    await expect(page.locator('text=Sustainability report')).toBeVisible();
  });

  test('should navigate to report details when clicking on report', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Click on first report
    await page.click('text=Q1 2024 GHG Report');

    // Should navigate to report detail page
    await expect(page).toHaveURL('/dashboard/reports/report-1');

    // Check report details are displayed
    await expect(page.locator('text=Sample SEC 10-K Report')).toBeVisible();
    await expect(page.locator('text=SEC 10-K Report')).toBeVisible();
    await expect(page.locator('text=draft')).toBeVisible();
  });

  test('should open create report modal', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Click create report button
    await page.click('text=Create Report');

    // Check modal opens
    await expect(page.locator('text=Create New Report')).toBeVisible();
    await expect(page.locator('text=Set up a new climate disclosure report')).toBeVisible();

    // Check form fields are present
    await expect(page.locator('text=Report Title')).toBeVisible();
    await expect(page.locator('text=Report Type')).toBeVisible();
    await expect(page.locator('text=Company')).toBeVisible();
    await expect(page.locator('text=Reporting Year')).toBeVisible();
    await expect(page.locator('text=Priority')).toBeVisible();
  });

  test('should create new report successfully', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Open create modal
    await page.click('text=Create Report');

    // Fill out form
    await page.fill('input[placeholder="Enter report title..."]', 'New Test Report');
    await page.selectOption('select', 'sec_10k');
    await page.fill('input[placeholder="Company ID"]', 'company-123');
    await page.fill('input[type="number"]', '2024');
    await page.selectOption('select:has-text("Priority")', 'high');

    // Submit form
    await page.click('text=Create Report');

    // Should navigate to new report page
    await expect(page).toHaveURL('/dashboard/reports/report-new');

    // Check success message or new report details
    await expect(page.locator('text=New Test Report')).toBeVisible();
  });

  test('should edit report details', async ({ page }) => {
    await page.goto('/dashboard/reports/report-1');

    // Click edit button
    await page.click('text=Edit');

    // Check edit form opens (this depends on your edit implementation)
    // For now, just check that edit functionality is accessible
    await expect(page.locator('text=Edit Report')).toBeVisible();
  });

  test('should delete report', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Find and click delete option (this depends on your UI implementation)
    // For dropdown menu with delete option
    await page.click('button[aria-label="More options"]');
    await page.click('text=Delete');

    // Confirm deletion (if confirmation dialog exists)
    await page.click('text=Delete');

    // Should remove report from list or show success message
    await expect(page.locator('text=Q1 2024 GHG Report')).not.toBeVisible();
  });

  test('should filter reports by status', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Apply status filter (this depends on your filter implementation)
    await page.click('text=Filters');
    await page.click('text=Draft');

    // Should only show draft reports
    await expect(page.locator('text=Q1 2024 GHG Report')).not.toBeVisible();
    await expect(page.locator('text=Annual Sustainability Report')).toBeVisible();
  });

  test('should search reports', async ({ page }) => {
    await page.goto('/dashboard/reports');

    // Enter search term
    await page.fill('input[placeholder="Search reports..."]', 'GHG');

    // Should filter results
    await expect(page.locator('text=Q1 2024 GHG Report')).toBeVisible();
    await expect(page.locator('text=Annual Sustainability Report')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error for reports list
    await page.route('**/reports/', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });

    await page.goto('/dashboard/reports');

    // Should show error state instead of crashing
    await expect(page.locator('text=Failed to load reports')).toBeVisible();
  });

  test('should handle empty reports list', async ({ page }) => {
    // Mock empty response
    await page.route('**/reports/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reports: [],
          total_count: 0,
          page: 1,
          page_size: 20,
          total_pages: 0
        })
      });
    });

    await page.goto('/dashboard/reports');

    // Should show empty state
    await expect(page.locator('text=No reports found')).toBeVisible();
    await expect(page.locator('text=Create your first report')).toBeVisible();
  });

  test('should handle report not found', async ({ page }) => {
    // Mock 404 response for individual report
    await page.route('**/reports/nonexistent-id', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Report not found' })
      });
    });

    await page.goto('/dashboard/reports/nonexistent-id');

    // Should show not found state
    await expect(page.locator('text=Report Not Found')).toBeVisible();
    await expect(page.locator('text=The requested report could not be found')).toBeVisible();
  });

  test('should display report locking functionality', async ({ page }) => {
    // Mock locked report response
    await page.route('**/reports/report-1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'report-1',
          title: 'Locked Report',
          report_type: 'sec_10k',
          status: 'locked',
          locked_by: 'user-2',
          locked_at: '2024-01-15T10:00:00Z',
          lock_reason: 'Under review by legal team'
        })
      });
    });

    await page.goto('/dashboard/reports/report-1');

    // Should show lock status
    await expect(page.locator('text=Locked')).toBeVisible();
    await expect(page.locator('text=Under review by legal team')).toBeVisible();

    // Should show unlock button instead of lock button
    await expect(page.locator('text=Unlock')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock paginated response
    await page.route('**/reports/', async route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reports: Array.from({ length: 20 }, (_, i) => ({
            id: `report-${(page - 1) * 20 + i + 1}`,
            title: `Report ${(page - 1) * 20 + i + 1}`,
            report_type: 'sec_10k',
            status: 'draft',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            created_by: '1',
            company_id: 'company-123',
            reporting_year: 2024
          })),
          total_count: 50,
          page: page,
          page_size: 20,
          total_pages: 3
        })
      });
    });

    await page.goto('/dashboard/reports');

    // Should show pagination controls
    await expect(page.locator('text=Reports (50)')).toBeVisible();

    // Should show page navigation
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
  });
});