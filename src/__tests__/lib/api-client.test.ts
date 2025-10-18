import { apiClient } from '@/lib/api-client';

let mockFetch: jest.Mock;

beforeEach(() => {
  // Create a new mock function for each test
  mockFetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'mock data' }),
    })
  );

  // Replace the original 'fetch' with our mock
  global.fetch = mockFetch;
});

afterEach(() => {
  // Clean up mocks after each test
  jest.clearAllMocks();
});

test('getCompanyEmissionsSummary should call fetch with correct parameters', async () => {
  await apiClient.getCompanyEmissionsSummary('company-1', 2024);

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:8000/v1/emissions/companies/company-1/summary?reporting_year=2024',
    expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    })
  );
});

test('getCompanyEmissionsSummary should call fetch without year parameter', async () => {
  await apiClient.getCompanyEmissionsSummary('company-1');

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:8000/v1/emissions/companies/company-1/summary',
    expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    })
  );
});

test('should handle API errors correctly', async () => {
  // Mock error response
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: () => Promise.resolve({ detail: 'Company not found' }),
  });

  await expect(apiClient.getCompanyEmissionsSummary('invalid-company')).rejects.toThrow('Company not found');
});

test('should handle network errors correctly', async () => {
  // Mock network error
  mockFetch.mockRejectedValueOnce(new Error('Network error'));

  await expect(apiClient.getCompanyEmissionsSummary('company-1')).rejects.toThrow('Network error');
});

test('should include auth token in headers when available', async () => {
  // Mock localStorage to return a token
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-jwt-token'),
    },
  });

  await apiClient.getCompanyEmissionsSummary('company-1', 2024);

  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:8000/v1/emissions/companies/company-1/summary?reporting_year=2024',
    expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token',
      }),
    })
  );
});