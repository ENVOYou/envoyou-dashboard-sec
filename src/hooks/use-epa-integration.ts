/**
 * EPA Integration Hooks
 * Custom React hooks for EPA data integration functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  EPAFactor,
  EPACacheStatus,
  EPARefreshRequest,
  EPARefreshResponse,
  GHGRPFacility,
  GHGRPSearchRequest,
  GHGRPSearchResponse,
  EPAReportingRequirement,
  EPAReportingSchedule,
  EPAReportingSubmission,
  ValidationResult,
  EPADataAnalytics,
  EPAIntegrationConfig,
  EPADataImportRequest,
  EPADataImportResponse,
  EPAComplianceStatus,
  ComplianceViolation,
  EPADashboardStats,
  EPAActivity,
  EPAFilters,
  EPASearchResult,
  EPADataResponse,
} from '@/types/epa-integration';

// Query Keys
export const EPA_QUERY_KEYS = {
  all: ['epa'] as const,
  cache: () => [...EPA_QUERY_KEYS.all, 'cache'] as const,
  factors: () => [...EPA_QUERY_KEYS.all, 'factors'] as const,
  ghgrp: () => [...EPA_QUERY_KEYS.all, 'ghgrp'] as const,
  facilities: () => [...EPA_QUERY_KEYS.all, 'facilities'] as const,
  facility: (id: string) => [...EPA_QUERY_KEYS.all, 'facility', id] as const,
  reporting: () => [...EPA_QUERY_KEYS.all, 'reporting'] as const,
  schedule: () => [...EPA_QUERY_KEYS.all, 'schedule'] as const,
  submissions: () => [...EPA_QUERY_KEYS.all, 'submissions'] as const,
  compliance: () => [...EPA_QUERY_KEYS.all, 'compliance'] as const,
  dashboard: () => [...EPA_QUERY_KEYS.all, 'dashboard'] as const,
  analytics: () => [...EPA_QUERY_KEYS.all, 'analytics'] as const,
  configuration: () => [...EPA_QUERY_KEYS.all, 'configuration'] as const,
  search: (query: string, filters?: EPAFilters) => [...EPA_QUERY_KEYS.all, 'search', query, filters] as const,
  import: () => [...EPA_QUERY_KEYS.all, 'import'] as const,
  export: () => [...EPA_QUERY_KEYS.all, 'export'] as const,
};

// EPA Cache Status Hook
export const useEPACacheStatus = () => {
  return useQuery({
    queryKey: EPA_QUERY_KEYS.cache(),
    queryFn: () => apiClient.getEPACacheStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// EPA Factors Hook
export const useEPAFactors = (params?: {
  source?: string;
  category?: string;
  fuel_type?: string;
  electricity_region?: string;
  force_refresh?: boolean;
}) => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.factors(), params],
    queryFn: () => apiClient.getEmissionsFactors(params),
    staleTime: 15 * 60 * 1000, // 15 minutes - factors don't change often
  });
};

// GHGRP Facilities Hook
export const useGHGRPFacilities = (filters?: GHGRPSearchRequest) => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.facilities(), filters],
    queryFn: () => apiClient.searchGHGRPFacilities(filters!),
    enabled: !!filters,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Single GHGRP Facility Hook
export const useGHGRPFacility = (facilityId: string) => {
  return useQuery({
    queryKey: EPA_QUERY_KEYS.facility(facilityId),
    queryFn: () => apiClient.getGHGRPFacility(facilityId),
    enabled: !!facilityId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// EPA Reporting Schedule Hook
export const useEPAReportingSchedule = (companyId?: string) => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.schedule(), companyId],
    queryFn: () => apiClient.getEPAReportingSchedule(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// EPA Compliance Status Hook
export const useEPAComplianceStatus = (companyId: string) => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.compliance(), companyId],
    queryFn: () => apiClient.getEPAComplianceStatus(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// EPA Dashboard Hook
export const useEPADashboard = () => {
  return useQuery({
    queryKey: EPA_QUERY_KEYS.dashboard(),
    queryFn: () => apiClient.getEPADashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// EPA Configuration Hook
export const useEPAConfiguration = () => {
  return useQuery({
    queryKey: EPA_QUERY_KEYS.configuration(),
    queryFn: () => apiClient.getEPAIntegrationConfig(),
    staleTime: 10 * 60 * 1000, // 10 minutes - configuration doesn't change often
  });
};

export const useUpdateEPAConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EPAIntegrationConfig>) => apiClient.updateEPAIntegrationConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.configuration() });
    },
  });
};

// EPA Refresh Hook
export const useRefreshEPAData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: EPARefreshRequest) => apiClient.refreshEPAData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.cache() });
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.factors() });
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.dashboard() });
    },
  });
};

// EPA Data Import Hook
export const useImportEPAData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EPADataImportRequest) => apiClient.importEPAData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.facilities() });
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.dashboard() });
    },
  });
};

// EPA Data Export Hook
export const useExportEPAData = () => {
  return useMutation({
    mutationFn: (data: {
      format: 'csv' | 'excel' | 'json';
      facilities?: string[];
      date_range?: { start: string; end: string };
      include_emissions?: boolean;
    }) => apiClient.exportEPAData(data),
  });
};

// EPA Reporting Requirements Hook
export const useEPAReportingRequirements = () => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.reporting(), 'requirements'],
    queryFn: () => apiClient.getEPAReportingRequirements(),
    staleTime: 30 * 60 * 1000, // 30 minutes - requirements don't change often
  });
};

// EPA Reporting Submission Hook
export const useCreateEPAReportingSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      schedule_id: string;
      submission_data: Record<string, any>;
      attachments?: File[];
    }) => apiClient.createEPAReportingSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.submissions() });
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.schedule() });
      queryClient.invalidateQueries({ queryKey: EPA_QUERY_KEYS.compliance() });
    },
  });
};

// Search Hook
export const useSearchEPAFacilities = (query: string, filters?: EPAFilters) => {
  return useQuery({
    queryKey: EPA_QUERY_KEYS.search(query, filters),
    queryFn: async () => {
      // This would use the search API when available
      // For now, return mock data or use existing search
      return {
        facilities: [],
        total_results: 0,
        search_term: query,
        filters_applied: filters || {},
        aggregations: {
          by_industry_sector: {},
          by_state: {},
          by_verification_status: {},
          by_emissions_range: {},
        },
        summary: {
          total_emissions: 0,
          average_emissions: 0,
          top_sector: '',
          compliance_rate: 0,
        },
      };
    },
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Real-time EPA monitoring hook (for future implementation)
export const useEPAMonitoring = () => {
  return useQuery({
    queryKey: [...EPA_QUERY_KEYS.all, 'monitoring'],
    queryFn: async () => {
      // This would integrate with real-time EPA data updates
      // For now, return mock data or integrate with WebSocket
      return {
        isMonitoring: true,
        lastUpdate: new Date().toISOString(),
        activeConnections: 0,
        dataStreams: ['ghgrp', 'egrid', 'tri'],
        refreshStatus: 'idle',
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};