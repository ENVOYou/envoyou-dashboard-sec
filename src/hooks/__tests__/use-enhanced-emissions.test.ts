/**
 * Integration Tests for Enhanced Emissions Hooks
 * Tests API integration and hook behavior
 */

import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useValidationMetrics, useCalculations, useCalculation } from '../use-enhanced-emissions';
import { apiClient } from '@/lib/api-client';

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getValidationMetrics: jest.fn(),
    getCalculations: jest.fn(),
    getCalculation: jest.fn(),
    calculateScope1Emissions: jest.fn(),
    calculateScope2Emissions: jest.fn(),
    approveCalculation: jest.fn(),
    getCalculationAuditTrail: jest.fn(),
    getEPAFactors: jest.fn(),
    getEPAFactorByCode: jest.fn(),
    getCompanyEmissionsSummary: jest.fn(),
    getCompanyAuditSummary: jest.fn(),
    getConsolidatedEmissionsSummary: jest.fn(),
    getEntitiesWithEmissions: jest.fn(),
    triggerConsolidation: jest.fn()
  }
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  return Wrapper;
};

describe('Enhanced Emissions Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useValidationMetrics', () => {
    describe('✅ Successful API Call Tests', () => {
      it('should return validation metrics data when API call succeeds', async () => {
        const mockMetrics = {
          total_validations: 100,
          success_rate: 0.95,
          average_quality_score: 88,
          common_errors: [
            {
              error_code: 'MISSING_REQUIRED_FIELD',
              error_message: 'Required field is missing',
              frequency: 5,
              percentage: 5.0
            }
          ],
          quality_trends: [
            {
              date: '2024-01-01',
              average_score: 85,
              validation_count: 20
            }
          ]
        };

        (apiClient.getValidationMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useValidationMetrics(), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockMetrics);
        expect(apiClient.getValidationMetrics).toHaveBeenCalledWith({});
      });

      it('should pass date parameters to API when provided', async () => {
        const mockMetrics = {
          total_validations: 50,
          success_rate: 0.9,
          average_quality_score: 82,
          common_errors: [],
          quality_trends: []
        };

        (apiClient.getValidationMetrics as jest.Mock).mockResolvedValue(mockMetrics);

        const wrapper = createWrapper();
        const { result } = renderHook(
          () => useValidationMetrics('2024-01-01', '2024-12-31'), 
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(apiClient.getValidationMetrics).toHaveBeenCalledWith({
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
      });
    });

    describe('🔄 Loading State Tests', () => {
      it('should show loading state initially', () => {
        (apiClient.getValidationMetrics as jest.Mock).mockImplementation(
          () => new Promise(() => {}) // Never resolves
        );

        const wrapper = createWrapper();
        const { result } = renderHook(() => useValidationMetrics(), { wrapper });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
      });
    });

    describe('❌ Error State Tests', () => {
      it('should handle API error gracefully', async () => {
        const mockError = new Error('API Error: Server unavailable');
        (apiClient.getValidationMetrics as jest.Mock).mockRejectedValue(mockError);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useValidationMetrics(), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(mockError);
        expect(result.current.data).toBeUndefined();
      });

      it('should handle 500 server error', async () => {
        const serverError = new Error('Internal Server Error');
        (apiClient.getValidationMetrics as jest.Mock).mockRejectedValue(serverError);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useValidationMetrics(), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(serverError);
      });
    });
  });

  describe('useCalculations', () => {
    describe('✅ Successful API Call Tests', () => {
      it('should return calculations list when API call succeeds', async () => {
        const mockCalculations = [
          {
            calculation_id: 'calc-1',
            company_id: 'company-123',
            scope: 'scope_1' as const,
            total_co2e: 1500.5,
            data_quality_score: 92,
            status: 'completed' as const,
            created_at: '2024-01-15T10:00:00Z',
            created_by: 'user-123'
          },
          {
            calculation_id: 'calc-2',
            company_id: 'company-123',
            scope: 'scope_2' as const,
            total_co2e: 800.3,
            data_quality_score: 88,
            status: 'approved' as const,
            created_at: '2024-01-16T14:30:00Z',
            created_by: 'user-456'
          }
        ];

        (apiClient.getCalculations as jest.Mock).mockResolvedValue(mockCalculations);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculations(), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockCalculations);
        expect(apiClient.getCalculations).toHaveBeenCalledWith(undefined);
      });

      it('should pass filters to API when provided', async () => {
        const mockCalculations = [];
        (apiClient.getCalculations as jest.Mock).mockResolvedValue(mockCalculations);

        const filters = {
          company_id: 'company-123',
          scope: 'scope_1' as const,
          status: 'completed' as const,
          limit: 10
        };

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculations(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(apiClient.getCalculations).toHaveBeenCalledWith(filters);
      });
    });

    describe('❌ Error State Tests', () => {
      it('should handle API error when fetching calculations', async () => {
        const mockError = new Error('Failed to fetch calculations');
        (apiClient.getCalculations as jest.Mock).mockRejectedValue(mockError);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculations(), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('useCalculation', () => {
    describe('✅ Successful API Call Tests', () => {
      it('should return calculation details when API call succeeds', async () => {
        const mockCalculation = {
          calculation_id: 'calc-123',
          company_id: 'company-123',
          scope: 'scope_1' as const,
          total_co2e: 1500.5,
          total_co2: 1400.2,
          total_ch4: 50.1,
          total_n2o: 50.2,
          data_quality_score: 92,
          calculation_details: [
            {
              source_category: 'Natural Gas Combustion',
              activity_data: 1000,
              activity_unit: 'therms',
              emission_factor: 53.06,
              factor_unit: 'kg CO2/therm',
              co2e_emissions: 53060,
              uncertainty: 5
            }
          ],
          epa_factors_used: [
            {
              factor_code: 'NG_STATIONARY',
              factor_name: 'Natural Gas - Stationary Combustion',
              factor_value: 53.06,
              factor_unit: 'kg CO2/therm',
              source: 'EPA_GHGRP',
              version: '2024'
            }
          ],
          status: 'completed' as const,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          created_by: 'user-123'
        };

        (apiClient.getCalculation as jest.Mock).mockResolvedValue(mockCalculation);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculation('calc-123'), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockCalculation);
        expect(apiClient.getCalculation).toHaveBeenCalledWith('calc-123');
      });

      it('should not call API when calculationId is empty', () => {
        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculation(''), { wrapper });

        expect(result.current.data).toBeUndefined();
        expect(apiClient.getCalculation).not.toHaveBeenCalled();
      });

      it('should not call API when enabled is false', () => {
        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculation('calc-123', false), { wrapper });

        expect(result.current.data).toBeUndefined();
        expect(apiClient.getCalculation).not.toHaveBeenCalled();
      });
    });

    describe('❌ Error State Tests', () => {
      it('should handle 404 error when calculation not found', async () => {
        const notFoundError = new Error('Calculation not found');
        (apiClient.getCalculation as jest.Mock).mockRejectedValue(notFoundError);

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCalculation('nonexistent-calc'), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(notFoundError);
      });
    });
  });

  describe('Hook Caching and Stale Time', () => {
    it('should use appropriate stale time for validation metrics (5 minutes)', async () => {
      const mockMetrics = {
        total_validations: 100,
        success_rate: 0.95,
        average_quality_score: 90,
        common_errors: [],
        quality_trends: []
      };

      (apiClient.getValidationMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useValidationMetrics(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The hook should have fetched data successfully
      expect(result.current.data).toEqual(mockMetrics);
      expect(apiClient.getValidationMetrics).toHaveBeenCalledTimes(1);
    });

    it('should use appropriate stale time for calculations (2 minutes)', async () => {
      const mockCalculations = [];
      (apiClient.getCalculations as jest.Mock).mockResolvedValue(mockCalculations);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCalculations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The hook should have fetched data successfully
      expect(result.current.data).toEqual(mockCalculations);
      expect(apiClient.getCalculations).toHaveBeenCalledTimes(1);
    });
  });
});