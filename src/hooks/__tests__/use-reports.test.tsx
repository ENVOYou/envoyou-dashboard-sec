// src/hooks/__tests__/use-reports.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReports } from '../use-reports';
import { apiClient } from '@/lib/api-client';
import { ReportsResponse } from '@/types/api';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Create a query client for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

// Wrapper component to provide the QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useReports hook', () => {
  it('should fetch and return reports data', async () => {
    // Mock the API response
    const mockResponse: ReportsResponse = {
      items: [{ id: '1', title: 'Test Report', report_type: 'ghg_report', reporting_year: 2023, status: 'draft', created_at: '', updated_at: '', is_locked: false, comments: [], revisions: [], company_id: '123' }],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1,
    };
    mockedApiClient.getReports.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useReports(), { wrapper });

    // Wait for the query to settle
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0].title).toBe('Test Report');
  });

  it('should handle errors when fetching reports', async () => {
    // Mock the API to throw an error
    const errorMessage = 'Failed to fetch';
    mockedApiClient.getReports.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useReports(), { wrapper });

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });
});
