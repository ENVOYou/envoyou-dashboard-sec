/**
 * Enhanced Emissions Management Hooks
 * Custom React hooks for enhanced emissions functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Scope1CalculationRequest,
  Scope2CalculationRequest,
  CalculationApprovalRequest,
  ValidationMetrics,
  CompanyEmissionsSummary,
  EmissionFactorResponse
} from '@/types/emissions';

// Type definitions for hook parameters
interface CalculationFilters {
  company_id?: string;
  scope?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

interface EPAFactorFilters {
  source?: string;
  category?: string;
  fuel_type?: string;
  electricity_region?: string;
  force_refresh?: boolean;
}

interface ConsolidationParams {
  reporting_year: number;
  consolidation_method?: string;
  include_scope3?: boolean;
}

// Query Keys
export const ENHANCED_EMISSIONS_QUERY_KEYS = {
  all: ['enhanced-emissions'] as const,
  
  // Validation keys
  validation: () => [...ENHANCED_EMISSIONS_QUERY_KEYS.all, 'validation'] as const,
  validationMetrics: (startDate?: string, endDate?: string) => 
    [...ENHANCED_EMISSIONS_QUERY_KEYS.validation(), 'metrics', startDate, endDate] as const,
  
  // Calculation keys
  calculations: () => [...ENHANCED_EMISSIONS_QUERY_KEYS.all, 'calculations'] as const,
  calculationsList: (filters?: CalculationFilters) => [...ENHANCED_EMISSIONS_QUERY_KEYS.calculations(), 'list', filters] as const,
  calculation: (id: string) => [...ENHANCED_EMISSIONS_QUERY_KEYS.calculations(), 'detail', id] as const,
  calculationAuditTrail: (id: string) => [...ENHANCED_EMISSIONS_QUERY_KEYS.calculations(), 'audit-trail', id] as const,
  
  // EPA factors keys
  epaFactors: () => [...ENHANCED_EMISSIONS_QUERY_KEYS.all, 'epa-factors'] as const,
  epaFactorsList: (filters?: EPAFactorFilters) => [...ENHANCED_EMISSIONS_QUERY_KEYS.epaFactors(), 'list', filters] as const,
  epaFactor: (code: string, version?: string) => [...ENHANCED_EMISSIONS_QUERY_KEYS.epaFactors(), 'detail', code, version] as const,
  
  // Company summary keys
  companySummary: () => [...ENHANCED_EMISSIONS_QUERY_KEYS.all, 'company-summary'] as const,
  companyEmissionsSummary: (companyId: string, year?: number) => 
    [...ENHANCED_EMISSIONS_QUERY_KEYS.companySummary(), 'emissions', companyId, year] as const,
  companyAuditSummary: (companyId: string, year?: number) => 
    [...ENHANCED_EMISSIONS_QUERY_KEYS.companySummary(), 'audit', companyId, year] as const,
  consolidatedSummary: (companyId: string, year: number) => 
    [...ENHANCED_EMISSIONS_QUERY_KEYS.companySummary(), 'consolidated', companyId, year] as const,
  entitiesWithEmissions: (companyId: string, year: number, includeConsolidated?: boolean) => 
    [...ENHANCED_EMISSIONS_QUERY_KEYS.companySummary(), 'entities', companyId, year, includeConsolidated] as const,
};

// Validation Hooks
export const useValidationMetrics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.validationMetrics(startDate, endDate),
    queryFn: () => apiClient.getValidationMetrics({ start_date: startDate, end_date: endDate }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Calculation Hooks
export const useCalculations = (filters?: CalculationFilters) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculationsList(filters),
    queryFn: () => apiClient.getCalculations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCalculation = (calculationId: string, enabled = true) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculation(calculationId),
    queryFn: () => apiClient.getCalculation(calculationId),
    enabled: !!calculationId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCalculationAuditTrail = (calculationId: string, enabled = true) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculationAuditTrail(calculationId),
    queryFn: () => apiClient.getCalculationAuditTrail(calculationId),
    enabled: !!calculationId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCalculateScope1Emissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Scope1CalculationRequest) => apiClient.calculateScope1Emissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculations() });
    },
  });
};

export const useCalculateScope2Emissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Scope2CalculationRequest) => apiClient.calculateScope2Emissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculations() });
    },
  });
};

export const useApproveCalculation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ calculationId, approval }: { calculationId: string; approval: CalculationApprovalRequest }) =>
      apiClient.approveCalculation(calculationId, approval),
    onSuccess: (result, { calculationId }) => {
      queryClient.invalidateQueries({ queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculation(calculationId) });
      queryClient.invalidateQueries({ queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculations() });
      queryClient.invalidateQueries({ queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.calculationAuditTrail(calculationId) });
    },
  });
};

// EPA Factors Hooks
export const useEPAFactors = (filters?: EPAFactorFilters) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.epaFactorsList(filters),
    queryFn: () => apiClient.getEPAFactors(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - EPA factors don't change frequently
  });
};

export const useEPAFactor = (factorCode: string, version?: string, forceRefresh?: boolean) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.epaFactor(factorCode, version),
    queryFn: () => apiClient.getEPAFactorByCode(factorCode, { version, force_refresh: forceRefresh }),
    enabled: !!factorCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Company Summary Hooks
export const useCompanyEmissionsSummary = (companyId: string, reportingYear?: number) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.companyEmissionsSummary(companyId, reportingYear),
    queryFn: () => apiClient.getCompanyEmissionsSummary(companyId, { reporting_year: reportingYear }),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompanyAuditSummary = (companyId: string, reportingYear?: number) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.companyAuditSummary(companyId, reportingYear),
    queryFn: () => apiClient.getCompanyAuditSummary(companyId, { reporting_year: reportingYear }),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConsolidatedEmissionsSummary = (companyId: string, reportingYear: number) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.consolidatedSummary(companyId, reportingYear),
    queryFn: () => apiClient.getConsolidatedEmissionsSummary(companyId, reportingYear),
    enabled: !!companyId && !!reportingYear,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEntitiesWithEmissions = (companyId: string, reportingYear: number, includeConsolidated?: boolean) => {
  return useQuery({
    queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.entitiesWithEmissions(companyId, reportingYear, includeConsolidated),
    queryFn: () => apiClient.getEntitiesWithEmissions(companyId, { 
      reporting_year: reportingYear, 
      include_consolidated: includeConsolidated 
    }),
    enabled: !!companyId && !!reportingYear,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTriggerConsolidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, params }: { 
      companyId: string; 
      params: ConsolidationParams;
    }) => apiClient.triggerConsolidation(companyId, params),
    onSuccess: (result, { companyId, params }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.consolidatedSummary(companyId, params.reporting_year) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ENHANCED_EMISSIONS_QUERY_KEYS.entitiesWithEmissions(companyId, params.reporting_year) 
      });
    },
  });
};