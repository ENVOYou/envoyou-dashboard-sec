import { Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'auditor' | 'cfo' | 'finance_team';
  is_active: boolean;
  created_at: string;
}

export const defaultMockUser: MockUser = {
  id: '1',
  email: 'admin@example.com',
  full_name: 'Test User',
  role: 'admin',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z'
};

export async function setupAuthentication(page: Page, user: MockUser = defaultMockUser) {
  // Set up localStorage with auth data BEFORE any navigation
  await page.addInitScript((userData) => {
    // Set up localStorage
    window.localStorage.setItem('auth_token', 'mock-jwt-token');
    window.localStorage.setItem('user', JSON.stringify(userData));
    
    // Also set up the auth store state directly if possible
    if (window.__NEXT_DATA__) {
      window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
      window.__NEXT_DATA__.props.pageProps = window.__NEXT_DATA__.props.pageProps || {};
      window.__NEXT_DATA__.props.pageProps.user = userData;
    }
  }, user);

  // Mock auth endpoints - match the actual API base URL
  await page.route('**/v1/auth/me', async route => {
    console.log('MOCK: Auth me API called:', route.request().method(), route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user)
    });
  });

  await page.route('**/v1/users/me', async route => {
    console.log('MOCK: Users me API called:', route.request().method(), route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user)
    });
  });

  await page.route('**/v1/auth/refresh', async route => {
    console.log('MOCK: Auth refresh API called:', route.request().method(), route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        user_id: user.id,
        role: user.role,
        user: user
      })
    });
  });
}

export async function setupReportsAPI(page: Page) {
  // Mock API responses for reports - match the actual API base URL
  await page.route('**/v1/reports', async route => {
    console.log('MOCK: Reports list API called:', route.request().method(), route.request().url());
    
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reports: [
            {
              id: 'report-1',
              title: 'Q1 2024 GHG Report',
              report_type: 'ghg_report',
              status: 'approved',
              version: '1.0',
              created_at: '2024-01-10T08:00:00Z',
              updated_at: '2024-01-12T16:30:00Z',
              created_by: '1',
              company_id: 'company-123',
              reporting_year: 2024,
              priority: 'medium'
            },
            {
              id: 'report-2',
              title: 'Annual Sustainability Report',
              report_type: 'sustainability_report',
              status: 'draft',
              version: '0.5',
              created_at: '2024-01-14T14:20:00Z',
              updated_at: '2024-01-15T11:45:00Z',
              created_by: '1',
              company_id: 'company-123',
              reporting_year: 2024,
              priority: 'high',
              description: 'Comprehensive sustainability disclosure'
            }
          ],
          total_count: 2,
          page: 1,
          page_size: 20,
          total_pages: 1
        })
      });
    }
  });

  await page.route('**/v1/reports?*', async route => {
    console.log('MOCK: Reports list with query API called:', route.request().method(), route.request().url());
    
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reports: [
            {
              id: 'report-1',
              title: 'Q1 2024 GHG Report',
              report_type: 'ghg_report',
              status: 'approved',
              version: '1.0',
              created_at: '2024-01-10T08:00:00Z',
              updated_at: '2024-01-12T16:30:00Z',
              created_by: '1',
              company_id: 'company-123',
              reporting_year: 2024,
              priority: 'medium'
            },
            {
              id: 'report-2',
              title: 'Annual Sustainability Report',
              report_type: 'sustainability_report',
              status: 'draft',
              version: '0.5',
              created_at: '2024-01-14T14:20:00Z',
              updated_at: '2024-01-15T11:45:00Z',
              created_by: '1',
              company_id: 'company-123',
              reporting_year: 2024,
              priority: 'high',
              description: 'Comprehensive sustainability disclosure'
            }
          ],
          total_count: 2,
          page: 1,
          page_size: 20,
          total_pages: 1
        })
      });
    }
  });

  await page.route('**/v1/reports/*', async route => {
    const url = route.request().url();
    const reportId = url.split('/reports/')[1].split('/')[0].split('?')[0];
    console.log('MOCK: Individual report API called:', route.request().method(), reportId);
    
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: reportId,
          title: 'Sample SEC 10-K Report',
          report_type: 'sec_10k',
          status: 'draft',
          version: '1.0',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T14:20:00Z',
          created_by: '1',
          company_id: 'company-123',
          reporting_year: 2024,
          description: 'Annual SEC 10-K filing for climate disclosure',
          priority: 'high',
          tags: ['climate', 'sec', 'annual'],
          due_date: '2024-03-31T23:59:59Z'
        })
      });
    }
  });
}

export async function setupDashboardAPI(page: Page) {
  // Mock emissions summary API - match the actual API base URL
  await page.route('**/v1/emissions/**', async route => {
    console.log('MOCK: Emissions API called:', route.request().method(), route.request().url());
    
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
}