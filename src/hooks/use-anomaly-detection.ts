/**
 * Anomaly Detection Hooks
 * Custom React hooks for anomaly detection functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  AnomalyDetectionRequest,
  AnomalyReportResponse,
  AnomalySummaryResponse,
  AnomalyTrendRequest,
  AnomalyTrendResponse,
  BatchAnomalyDetectionRequest,
  BatchAnomalyDetectionResponse,
  IndustryBenchmarkRequest,
  IndustryBenchmarkResponse,
  AnomalyInvestigationRequest,
  AnomalyInvestigationResponse,
  AnomalyDashboardStats,
  AnomalyAlert,
  AnomalyDetectionConfiguration,
  AnomalyFilters,
  AnomalySearchResult,
  AnomalyExportRequest,
  AnomalyReportRequest,
  DetectedAnomaly,
} from '@/types/anomaly-detection';

// Additional type definitions for hooks
interface AnomalyResolutionData {
  resolution: string;
  action_taken: string;
  preventive_measures?: string[];
}

// Query Keys
export const ANOMALY_QUERY_KEYS = {
  all: ['anomalies'] as const,
  detection: () => [...ANOMALY_QUERY_KEYS.all, 'detection'] as const,
  detect: (companyId: string, year: number) => [...ANOMALY_QUERY_KEYS.detection(), companyId, year] as const,
  summary: (companyId: string, year: number) => [...ANOMALY_QUERY_KEYS.all, 'summary', companyId, year] as const,
  trends: () => [...ANOMALY_QUERY_KEYS.all, 'trends'] as const,
  trend: (companyId: string, startYear: number, endYear: number) => [...ANOMALY_QUERY_KEYS.trends(), companyId, startYear, endYear] as const,
  benchmarks: () => [...ANOMALY_QUERY_KEYS.all, 'benchmarks'] as const,
  benchmark: (companyId: string, year: number) => [...ANOMALY_QUERY_KEYS.benchmarks(), companyId, year] as const,
  investigation: () => [...ANOMALY_QUERY_KEYS.all, 'investigation'] as const,
  investigate: (anomalyId: string) => [...ANOMALY_QUERY_KEYS.investigation(), anomalyId] as const,
  dashboard: () => [...ANOMALY_QUERY_KEYS.all, 'dashboard'] as const,
  alerts: () => [...ANOMALY_QUERY_KEYS.all, 'alerts'] as const,
  configuration: () => [...ANOMALY_QUERY_KEYS.all, 'configuration'] as const,
  search: (query: string, filters?: AnomalyFilters) => [...ANOMALY_QUERY_KEYS.all, 'search', query, filters] as const,
  anomaly: (id: string) => [...ANOMALY_QUERY_KEYS.all, 'anomaly', id] as const,
};

// Anomaly Detection Hook
export const useDetectAnomalies = (companyId: string, reportingYear: number, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.detect(companyId, reportingYear),
    queryFn: () => apiClient.detectAnomalies({ company_id: companyId, reporting_year: reportingYear }),
    enabled: !!companyId && !!reportingYear && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (no data) or 403 (no permission)
      if (error instanceof Error && error.message.includes('404')) return false;
      if (error instanceof Error && error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
};

// Anomaly Summary Hook
export const useAnomalySummary = (companyId: string, reportingYear: number, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.summary(companyId, reportingYear),
    queryFn: () => apiClient.getAnomalySummary(companyId, reportingYear),
    enabled: !!companyId && !!reportingYear && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Anomaly Trends Hook
export const useAnomalyTrends = (companyId: string, startYear: number, endYear: number, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.trend(companyId, startYear, endYear),
    queryFn: () => apiClient.analyzeAnomalyTrends({
      company_id: companyId,
      start_year: startYear,
      end_year: endYear,
    }),
    enabled: !!companyId && !!startYear && !!endYear && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - trends don't change often
  });
};

// Batch Detection Hook
export const useBatchDetectAnomalies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchAnomalyDetectionRequest) => apiClient.batchDetectAnomalies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.all });
    },
  });
};

// Industry Benchmarks Hook
export const useIndustryBenchmarks = (companyId: string, reportingYear: number, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.benchmark(companyId, reportingYear),
    queryFn: () => apiClient.compareIndustryBenchmarks({
      company_id: companyId,
      reporting_year: reportingYear,
    }),
    enabled: !!companyId && !!reportingYear && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes - benchmarks don't change often
  });
};

// Anomaly Investigation Hook
export const useAnomalyInvestigation = (anomalyId: string, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.investigate(anomalyId),
    queryFn: () => apiClient.investigateAnomaly({ anomaly_id: anomalyId }),
    enabled: !!anomalyId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Dashboard Hook
export const useAnomalyDashboard = () => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.dashboard(),
    queryFn: () => apiClient.getAnomalyDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Alerts Hook
export const useAnomalyAlerts = (unreadOnly = false) => {
  return useQuery({
    queryKey: [...ANOMALY_QUERY_KEYS.alerts(), unreadOnly],
    queryFn: () => apiClient.getAnomalyAlerts(unreadOnly),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for alerts
  });
};

export const useMarkAnomalyAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => apiClient.markAnomalyAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.alerts() });
    },
  });
};

// Configuration Hook
export const useAnomalyConfiguration = () => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.configuration(),
    queryFn: () => apiClient.getAnomalyDetectionConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes - configuration doesn't change often
  });
};

export const useUpdateAnomalyConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AnomalyDetectionConfiguration>) => apiClient.updateAnomalyDetectionConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.configuration() });
    },
  });
};

// Search Hook
export const useSearchAnomalies = (query: string, filters?: AnomalyFilters) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.search(query, filters),
    queryFn: () => apiClient.searchAnomalies(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Single Anomaly Hook
export const useAnomaly = (anomalyId: string, enabled = true) => {
  return useQuery({
    queryKey: ANOMALY_QUERY_KEYS.anomaly(anomalyId),
    queryFn: () => apiClient.getAnomalyById(anomalyId),
    enabled: !!anomalyId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Anomaly Resolution Hook
export const useResolveAnomaly = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ anomalyId, data }: { anomalyId: string; data: AnomalyResolutionData }) =>
      apiClient.resolveAnomaly(anomalyId, data),
    onSuccess: (result, { anomalyId }) => {
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.anomaly(anomalyId) });
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.all });
    },
  });
};

// Anomaly Dismissal Hook
export const useDismissAnomaly = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ anomalyId, reason }: { anomalyId: string; reason: string }) =>
      apiClient.dismissAnomaly(anomalyId, reason),
    onSuccess: (result, { anomalyId }) => {
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.anomaly(anomalyId) });
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ANOMALY_QUERY_KEYS.all });
    },
  });
};

// Export Hook
export const useExportAnomalies = () => {
  return useMutation({
    mutationFn: (data: AnomalyExportRequest) => apiClient.exportAnomalies(data),
  });
};

// Report Generation Hook
export const useGenerateAnomalyReport = () => {
  return useMutation({
    mutationFn: (data: AnomalyReportRequest) => apiClient.generateAnomalyReport(data),
  });
};

// Real-time anomaly monitoring hook (for future implementation)
export const useAnomalyMonitoring = (companyId?: string) => {
  return useQuery({
    queryKey: [...ANOMALY_QUERY_KEYS.all, 'monitoring', companyId],
    queryFn: async () => {
      // This would integrate with real-time anomaly detection
      // For now, return mock data or integrate with WebSocket
      return {
        isMonitoring: true,
        lastUpdate: new Date().toISOString(),
        activeAlerts: 0,
      };
    },
    enabled: !!companyId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};