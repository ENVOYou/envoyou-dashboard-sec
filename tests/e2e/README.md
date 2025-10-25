# E2E Tests for Enhanced Emissions Management

## Overview

This directory contains end-to-end tests for the Enhanced Emissions Management system, specifically designed to test against the real staging environment without mocking.

## Test Structure

### Staging Smoke Tests (`staging-smoke-test.spec.ts`)

**Basic Functionality Tests:**
- Homepage loading and redirects
- Login page functionality
- Navigation without errors
- SEO and meta tags
- Responsive design
- API error handling

**Enhanced Emissions Validation Components:**
- ValidationForm component testing
- ValidationResults display
- DataQualityScore component
- ValidationErrorList with filtering
- EPA integration status
- Real API integration (no mocking)
- Component state management

## Configuration

### Staging Config (`playwright.staging.config.ts`)
- Base URL: `https://staging.envoyou.com`
- Real API endpoints (no mocking)
- Chrome browser testing
- Retry logic for CI environments

### Authentication Helper (`helpers/auth-helper.ts`)
- Handles login with test credentials
- Session management
- Protected route navigation
- Graceful fallback for unauthenticated access

## Running Tests

### Local Development
```bash
# Run staging tests
npm run test:e2e:staging

# Run with UI mode
npm run test:e2e:staging:ui

# Run specific test file
npx playwright test --config=playwright.staging.config.ts staging-smoke-test.spec.ts
```

### Environment Variables
For authenticated testing, set these environment variables:

```bash
STAGING_TEST_EMAIL=test@example.com
STAGING_TEST_PASSWORD=your-test-password
```

## Test Features

### Real API Integration
- Tests hit actual staging APIs
- No mocking or stubbing
- Validates real data flows
- Tests EPA integration endpoints

### Validation Components Testing
- **ValidationForm**: Form submission and field validation
- **ValidationResults**: Results display after validation
- **DataQualityScore**: Quality metrics with visual indicators
- **ValidationErrorList**: Error display with filtering capabilities
- **EPA Integration**: Real EPA API calls and status indicators

### Error Handling
- Graceful handling of API failures
- Network timeout management
- Authentication failures
- Invalid data submission

### Responsive Testing
- Desktop (1200x800)
- Tablet (768x1024)
- Mobile (375x667)

## Best Practices

1. **No Mocking**: Tests use real staging APIs to validate actual integration
2. **Graceful Degradation**: Tests adapt when authentication is not available
3. **Network Resilience**: Handles slow or failed API calls
4. **State Validation**: Ensures component state is maintained during operations
5. **Real User Flows**: Tests simulate actual user interactions

## Troubleshooting

### Common Issues

**Authentication Required**
- Set `STAGING_TEST_EMAIL` and `STAGING_TEST_PASSWORD` environment variables
- Tests will run with limited functionality if authentication fails

**Staging Environment Unavailable**
- Tests will fail if staging.envoyou.com is not accessible
- Check network connectivity and staging environment status

**API Timeouts**
- Tests include reasonable timeouts for API calls
- EPA integration calls may take longer than standard API calls

### Debug Mode
```bash
# Run with debug output
DEBUG=pw:api npx playwright test --config=playwright.staging.config.ts

# Run headed mode to see browser
npx playwright test --config=playwright.staging.config.ts --headed
```

## CI/CD Integration

Tests are designed to run in CI environments with:
- Retry logic for flaky network conditions
- Parallel execution disabled for staging (to avoid rate limiting)
- HTML reports for test results
- Trace collection on failures