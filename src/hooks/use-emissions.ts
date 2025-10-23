/**
 * Emissions Management Hooks
 * Custom React hooks for emissions functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query Keys
export const EMISSIONS_QUERY_KEYS = {
  all: ['emissions'] as const,
  calculations: () => [...EMISSIONS_QUERY_KEYS.all, 'calculations'] as const,
  calculation: (id: string) => [...EMISSIONS_QUERY_KEYS.all, 'calculation', id] as const,
  validation: (params?: any) => [...EMISSIONS_QUERY_KEYS.all, 'validation', params] as const,
  factors: () => [...EMISSIONS_QUERY_KEYS.all, 'factors'] as const,
  analytics: (params?: any) => [...EMISSIONS_QUERY_KEYS.all, 'analytics', params] as const,
  trends: (params?: any) => [...EMISSIONS_QUERY_KEYS.all, 'trends', params] as const,
  benchmarks: () => [...EMISSIONS_QUERY_KEYS.all, 'benchmarks'] as const,
};

// Emissions Calculations Hook
export const useEmissionsCalculations = (params?: {
  company_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [...EMISSIONS_QUERY_KEYS.calculations(), params],
    queryFn: () => apiClient.getEmissionsCalculations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Single Calculation Hook
export const useEmissionsCalculation = (id: string) => {
  return useQuery({
    queryKey: EMISSIONS_QUERY_KEYS.calculation(id),
    queryFn: () => apiClient.getEmissionsCalculation(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Emissions Validation Hook
export const useEmissionsValidation = (params?: {
  calculation_id?: string;
  company_id?: string;
  validation_types?: string[];
}) => {
  return useQuery({
    queryKey: EMISSIONS_QUERY_KEYS.validation(params),
    queryFn: () => apiClient.getEmissionsValidation(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - validation results don't change often
    enabled: !!(params?.calculation_id || params?.company_id),
  });
};

// Emissions Factors Hook
export const useEmissionsFactors = (params?: {
  source?: string;
  category?: string;
  fuel_type?: string;
  electricity_region?: string;
  force_refresh?: boolean;
}) => {
  return useQuery({
    queryKey: [...EMISSIONS_QUERY_KEYS.factors(), params],
    queryFn: () => apiClient.getEmissionsFactors(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - factors don't change often
  });
};

// Emissions Analytics Hook
export const useEmissionsAnalytics = (params?: {
  company_id?: string;
  date_from?: string;
  date_to?: string;
  scope?: string[];
  aggregation?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}) => {
  return useQuery({
    queryKey: EMISSIONS_QUERY_KEYS.analytics(params),
    queryFn: () => apiClient.getEmissionsAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Emissions Trends Hook
export const useEmissionsTrends = (params?: {
  company_id?: string;
  date_from?: string;
  date_to?: string;
  scope?: string[];
  comparison_period?: string;
}) => {
  return useQuery({
    queryKey: EMISSIONS_QUERY_KEYS.trends(params),
    queryFn: () => apiClient.getEmissionsTrends(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Industry Benchmarks Hook
export const useIndustryBenchmarks = (params?: {
  industry?: string;
  company_size?: string;
  region?: string;
  scope?: string[];
}) => {
  return useQuery({
    queryKey: [...EMISSIONS_QUERY_KEYS.benchmarks(), params],
    queryFn: () => apiClient.getIndustryBenchmarks(params),
    staleTime: 15 * 60 * 1000, // 15 minutes - benchmarks don't change often
  });
};

// Scope 1 Calculation Hook
export const useCalculateScope1 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      calculation_name: string;
      company_id: string;
      reporting_period_start: string;
      reporting_period_end: string;
      activity_data: Array<{
        activity_type: string;
        fuel_type: string;
        quantity: number;
        unit: string;
        data_quality: string;
      }>;
    }) => apiClient.calculateScope1(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.calculations() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.analytics() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.trends() });
    },
  });
};

// Scope 2 Calculation Hook
export const useCalculateScope2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      calculation_name: string;
      company_id: string;
      reporting_period_start: string;
      reporting_period_end: string;
      electricity_consumption: Array<{
        activity_type: string;
        quantity: number;
        unit: string;
        location: string;
        data_quality: string;
      }>;
      calculation_method: 'location_based' | 'market_based';
    }) => apiClient.calculateScope2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.calculations() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.analytics() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.trends() });
    },
  });
};

// Scope 3 Calculation Hook
export const useCalculateScope3 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      calculation_name: string;
      company_id: string;
      reporting_period_start: string;
      reporting_period_end: string;
      categories: Array<{
        category: string;
        activity_type: string;
        quantity: number;
        unit: string;
        emission_factor: number;
        data_quality: string;
        description?: string;
      }>;
    }) => apiClient.calculateScope3(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.calculations() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.analytics() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.trends() });
    },
  });
};

// Emissions Data Import Hook
export const useImportEmissionsData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: any }) =>
      apiClient.importEmissionsData(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.calculations() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.analytics() });
    },
  });
};

// Emissions Data Export Hook
export const useExportEmissionsData = () => {
  return useMutation({
    mutationFn: (data: {
      format: 'csv' | 'excel' | 'json';
      company_id?: string;
      date_from?: string;
      date_to?: string;
      scope?: string[];
      include_validation?: boolean;
    }) => apiClient.exportEmissionsData(data),
  });
};

// EPA Data Refresh Hook
export const useRefreshEPAData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: any) => apiClient.refreshEPAData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.factors() });
      queryClient.invalidateQueries({ queryKey: EMISSIONS_QUERY_KEYS.benchmarks() });
    },
  });
};