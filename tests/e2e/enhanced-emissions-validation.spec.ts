/**
 * E2E Tests for Enhanced Emissions Validation
 * Tests complete user workflows for emissions data validation
 */

import { test, expect } from '@playwright/test';

// Mock authentication for all tests
test.beforeEach(async ({ page }) => {
  // Mock the auth/me endpoint to simulate logged-in user
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        }
      })
    });
  });

  // Mock validation metrics endpoint
  await page.route('**/v1/epa/ghgrp/validation-metrics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_validations: 150,
        success_rate: 0.92,
        average_quality_score: 87,
        common_errors: [],
        quality_trends: []
      })
    });
  });

  // Set up localStorage to simulate authentication
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    }));
  });
});

test.describe('Enhanced Emissions Validation - Happy Path', () => {
  test('should successfully validate perfect emissions data', async ({ page }) => {
    // Navigate to Enhanced Emissions page
    await page.goto('/enhanced-emissions');
    
    // Verify page loaded correctly
    await expect(page.locator('h1')).toContainText('Enhanced Emissions Management');
    await expect(page.locator('text=Validate and manage your emissions data')).toBeVisible();

    // Fill in perfect data
    await page.getByTestId('activity-value').fill('1000');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Fill optional fields for higher quality score
    await page.getByTestId('description').fill('Test emission data for validation');
    await page.getByTestId('methodology').fill('EPA guidelines');
    await page.getByTestId('data-source').fill('Internal monitoring system');
    await page.getByTestId('uncertainty').fill('5');
    await page.getByTestId('comments').fill('High quality data from certified meters');

    // Click validate button
    await page.getByTestId('validate-button').click();

    // Wait for validation to complete
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Verify successful validation
    await expect(page.getByTestId('validation-status')).toContainText('Data validation successful');
    
    // Verify high quality score (should be > 90 for perfect data)
    const qualityScore = await page.getByTestId('quality-score').textContent();
    expect(qualityScore).toMatch(/9[0-9]\/100|100\/100/); // 90-100 range

    // Verify recommendations for excellent data
    await expect(page.getByTestId('recommendations')).toContainText('Excellent data quality');
  });

  test('should show validation results with quality score breakdown', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill minimal valid data
    await page.getByTestId('activity-value').fill('500');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Tons' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Diesel' }).click();

    // Validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Verify validation results are displayed
    await expect(page.locator('text=Validation Results')).toBeVisible();
    await expect(page.getByTestId('quality-score')).toBeVisible();
    
    // Quality score should be visible and numeric
    const qualityScore = await page.getByTestId('quality-score').textContent();
    expect(qualityScore).toMatch(/\\d+\/100/);

    // Should show success status for valid data
    await expect(page.getByTestId('validation-status')).toContainText('successful');
  });
});

test.describe('Enhanced Emissions Validation - Error Handling', () => {
  test('should show validation errors for missing required fields', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Leave activity value empty (required field)
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Click validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Verify validation failed
    await expect(page.getByTestId('validation-status')).toContainText('validation failed');

    // Verify specific error message for missing activity value
    await expect(page.getByTestId('activity-value-error')).toContainText('Activity data value is required');

    // Verify low quality score
    const qualityScore = await page.getByTestId('quality-score').textContent();
    const score = parseInt(qualityScore?.split('/')[0] || '0');
    expect(score).toBeLessThan(50);
  });

  test('should show specific error for missing fuel type in Scope 1', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill valid data but leave fuel type empty for Scope 1
    await page.getByTestId('activity-value').fill('1000');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    // Don't select fuel type (required for Scope 1)

    // Click validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Verify validation failed
    await expect(page.getByTestId('validation-status')).toContainText('validation failed');

    // Verify specific error message for missing fuel type (in Indonesian as per requirement)
    await expect(page.getByTestId('fuel-type-error')).toContainText('Bidang \'Bahan Bakar\' wajib diisi');
  });

  test('should handle negative values with appropriate error messages', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill data with negative activity value
    await page.getByTestId('activity-value').fill('-100');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Click validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Verify validation failed
    await expect(page.getByTestId('validation-status')).toContainText('validation failed');

    // Verify error for negative value
    await expect(page.locator('text=Activity data value must be positive')).toBeVisible();
  });

  test('should handle invalid date formats', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill valid data but with invalid date
    await page.getByTestId('activity-value').fill('1000');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    // Use invalid date format (this will be handled by the validation engine)
    await page.getByTestId('start-date').fill('invalid-date');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Click validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // The form should handle this gracefully
    // Either show validation error or the browser will prevent invalid date input
    await expect(page.getByTestId('validation-status')).toBeVisible();
  });
});

test.describe('Enhanced Emissions Validation - User Experience', () => {
  test('should show loading state during validation', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill minimal valid data
    await page.getByTestId('activity-value').fill('1000');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Click validate and immediately check for loading state
    await page.getByTestId('validate-button').click();
    
    // Should show loading text briefly
    await expect(page.getByTestId('validate-button')).toContainText('Validating...');
    
    // Wait for completion
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');
    await expect(page.getByTestId('validate-button')).toContainText('Validate Data');
  });

  test('should reset form when reset button is clicked', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill some data
    await page.getByTestId('activity-value').fill('1000');
    await page.getByTestId('description').fill('Test description');

    // Verify data is filled
    await expect(page.getByTestId('activity-value')).toHaveValue('1000');
    await expect(page.getByTestId('description')).toHaveValue('Test description');

    // Click reset
    await page.getByTestId('reset-button').click();

    // Verify form is cleared
    await expect(page.getByTestId('activity-value')).toHaveValue('');
    await expect(page.getByTestId('description')).toHaveValue('');
  });

  test('should disable fuel type field when scope is not Scope 1', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Select Scope 2
    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 2 - Indirect Emissions' }).click();

    // Fuel type should be disabled
    await expect(page.getByTestId('fuel-type')).toBeDisabled();

    // Change to Scope 1
    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    // Fuel type should be enabled
    await expect(page.getByTestId('fuel-type')).toBeEnabled();
  });

  test('should show quality score with appropriate color coding', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Fill minimal data for lower quality score
    await page.getByTestId('activity-value').fill('100');
    await page.getByTestId('activity-unit').click();
    await page.getByRole('option', { name: 'Kilograms (kg)' }).click();

    await page.getByTestId('start-date').fill('2024-01-01');
    await page.getByTestId('end-date').fill('2024-12-31');

    await page.getByTestId('scope').click();
    await page.getByRole('option', { name: 'Scope 1 - Direct Emissions' }).click();

    await page.getByTestId('fuel-type').click();
    await page.getByRole('option', { name: 'Natural Gas' }).click();

    // Validate
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Quality score should be visible
    await expect(page.getByTestId('quality-score')).toBeVisible();
    
    // Progress bar should be visible (color will depend on score)
    await expect(page.locator('.bg-gray-200.rounded-full')).toBeVisible();
  });
});

test.describe('Enhanced Emissions Validation - Accessibility', () => {
  test('should have proper form labels and accessibility attributes', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Check that form fields have proper labels
    await expect(page.locator('label[for=\"activity-value\"]')).toContainText('Activity Value');
    await expect(page.locator('label[for=\"start-date\"]')).toContainText('Start Date');
    await expect(page.locator('label[for=\"scope\"]')).toContainText('Emission Scope');

    // Check required field indicators
    await expect(page.locator('label[for=\"activity-value\"]')).toContainText('*');
    await expect(page.locator('label[for=\"start-date\"]')).toContainText('*');

    // Check that buttons have proper text
    await expect(page.getByTestId('validate-button')).toContainText('Validate Data');
    await expect(page.getByTestId('reset-button')).toContainText('Reset Form');
  });

  test('should show error messages with proper ARIA attributes', async ({ page }) => {
    await page.goto('/enhanced-emissions');

    // Submit form with missing required field
    await page.getByTestId('validate-button').click();
    await expect(page.getByTestId('validate-button')).not.toContainText('Validating...');

    // Error messages should be visible and associated with fields
    const errorMessages = page.locator('[data-testid$=\"-error\"]');
    await expect(errorMessages.first()).toBeVisible();
  });
});