/**
 * Audit System Hooks
 * Custom React hooks for audit functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  AuditLog,
  EnhancedAuditLog,
  AuditFilters,
  AuditSearchResult,
  AuditTrailRequest,
  AuditTrailResponse,
  ForensicAnalysisRequest,
  ForensicAnalysisResponse,
  ComplianceReportRequest,
  ComplianceReportResponse,
  SecurityEvent,
  AuditDashboardStats,
  AuditActivity,
  AuditExportRequest,
  AuditReportRequest,
  InvestigationRequest,
  InvestigationResponse,
  AuditLogsResponse,
} from '@/types/audit';

// Type definitions for hook parameters
interface SecurityEventFilters {
  severity?: string[];
  event_type?: string[];
  company_id?: string;
  date_from?: string;
  date_to?: string;
}

interface InvestigationFilters {
  status?: string[];
  priority?: string[];
  assigned_to?: string;
  company_id?: string;
}

interface InvestigationCloseData {
  findings: string;
  recommendations: string[];
  evidence: string[];
}

interface RetentionPolicyUpdate {
  default_retention: string;
  category_retention: Record<string, string>;
}

// Query Keys
export const AUDIT_QUERY_KEYS = {
  all: ['audit'] as const,
  logs: () => [...AUDIT_QUERY_KEYS.all, 'logs'] as const,
  log: (id: string) => [...AUDIT_QUERY_KEYS.all, 'log', id] as const,
  enhancedLogs: () => [...AUDIT_QUERY_KEYS.all, 'enhanced-logs'] as const,
  enhancedLog: (id: string) => [...AUDIT_QUERY_KEYS.all, 'enhanced-log', id] as const,
  trail: () => [...AUDIT_QUERY_KEYS.all, 'trail'] as const,
  forensic: () => [...AUDIT_QUERY_KEYS.all, 'forensic'] as const,
  compliance: () => [...AUDIT_QUERY_KEYS.all, 'compliance'] as const,
  security: () => [...AUDIT_QUERY_KEYS.all, 'security'] as const,
  dashboard: () => [...AUDIT_QUERY_KEYS.all, 'dashboard'] as const,
  activity: () => [...AUDIT_QUERY_KEYS.all, 'activity'] as const,
  investigations: () => [...AUDIT_QUERY_KEYS.all, 'investigations'] as const,
  investigation: (id: string) => [...AUDIT_QUERY_KEYS.all, 'investigation', id] as const,
  search: (query: string, filters?: AuditFilters) => [...AUDIT_QUERY_KEYS.all, 'search', query, filters] as const,
  retention: () => [...AUDIT_QUERY_KEYS.all, 'retention'] as const,
};

// Audit Logs Hook
export const useAuditLogs = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.logs(), filters],
    queryFn: () => apiClient.getAuditLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Enhanced Audit Logs Hook
export const useEnhancedAuditLogs = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.enhancedLogs(), filters],
    queryFn: () => apiClient.getEnhancedAuditLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Single Audit Log Hook
export const useAuditLog = (logId: string) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.log(logId),
    queryFn: () => apiClient.getAuditLogById(logId),
    enabled: !!logId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Enhanced Audit Log Hook
export const useEnhancedAuditLog = (logId: string) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.enhancedLog(logId),
    queryFn: () => apiClient.getEnhancedAuditLogById(logId),
    enabled: !!logId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Audit Trail Hook
export const useAuditTrail = (resourceType: string, resourceId: string, enabled = true) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.trail(), resourceType, resourceId],
    queryFn: () => apiClient.getAuditTrail({ resource_type: resourceType, resource_id: resourceId }),
    enabled: !!resourceType && !!resourceId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Forensic Analysis Hook
export const useForensicAnalysis = (investigationId: string, enabled = true) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.forensic(), investigationId],
    queryFn: () => apiClient.performForensicAnalysis({ investigation_id: investigationId } as ForensicAnalysisRequest),
    enabled: !!investigationId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Compliance Report Hook
export const useComplianceReport = (reportType: string, companyId?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.compliance(), reportType, companyId, dateRange],
    queryFn: () => apiClient.generateComplianceReport({
      report_type: reportType as 'sox' | 'gdpr' | 'hipaa' | 'iso27001' | 'custom',
      company_id: companyId,
      date_range: dateRange!,
      format: 'pdf', // Default format
    }),
    enabled: !!reportType && !!dateRange,
    staleTime: 15 * 60 * 1000, // 15 minutes - compliance reports don't change often
  });
};

// Security Events Hook
export const useSecurityEvents = (filters?: SecurityEventFilters) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.security(), filters],
    queryFn: () => apiClient.getSecurityEvents(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for security events
  });
};

// Dashboard Hook
export const useAuditDashboard = () => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.dashboard(),
    queryFn: () => apiClient.getAuditDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Activity Hook
export const useAuditActivity = (limit = 50) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.activity(), limit],
    queryFn: () => apiClient.getAuditActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Investigations Hook
export const useInvestigations = (filters?: InvestigationFilters) => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.investigations(), filters],
    queryFn: () => apiClient.getInvestigations(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useInvestigation = (investigationId: string, enabled = true) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.investigation(investigationId),
    queryFn: async () => {
      // Get investigation details
      const investigations = await apiClient.getInvestigations();
      return investigations.find(inv => inv.investigation_id === investigationId);
    },
    enabled: !!investigationId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Investigation Management Hooks
export const useCreateInvestigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvestigationRequest) => apiClient.createInvestigation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.investigations() });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.dashboard() });
    },
  });
};

export const useUpdateInvestigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ investigationId, data }: { investigationId: string; data: Partial<InvestigationRequest> }) =>
      apiClient.updateInvestigation(investigationId, data),
    onSuccess: (result, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.investigation(investigationId) });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.investigations() });
    },
  });
};

export const useCloseInvestigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ investigationId, data }: { investigationId: string; data: InvestigationCloseData }) =>
      apiClient.closeInvestigation(investigationId, data),
    onSuccess: (result, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.investigation(investigationId) });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.investigations() });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.dashboard() });
    },
  });
};

// Search Hook
export const useSearchAuditLogs = (query: string, filters?: AuditFilters) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.search(query, filters),
    queryFn: () => apiClient.searchAuditLogs(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Export Hook
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (data: AuditExportRequest) => apiClient.exportAuditLogs(data),
  });
};

// Report Generation Hook
export const useGenerateAuditReport = () => {
  return useMutation({
    mutationFn: (data: AuditReportRequest) => apiClient.generateAuditReport(data),
  });
};

// Retention Policy Hook
export const useAuditRetentionPolicy = () => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.retention(),
    queryFn: () => apiClient.getAuditRetentionPolicy(),
    staleTime: 15 * 60 * 1000, // 15 minutes - retention policy doesn't change often
  });
};

export const useUpdateAuditRetentionPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RetentionPolicyUpdate) => apiClient.updateAuditRetentionPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.retention() });
    },
  });
};

// Archive Logs Hook
export const useArchiveAuditLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (olderThan: string) => apiClient.archiveAuditLogs(olderThan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.logs() });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.enhancedLogs() });
      queryClient.invalidateQueries({ queryKey: AUDIT_QUERY_KEYS.dashboard() });
    },
  });
};

// Real-time audit monitoring hook (for future implementation)
export const useAuditMonitoring = () => {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEYS.all, 'monitoring'],
    queryFn: async () => {
      // This would integrate with real-time audit monitoring
      // For now, return mock data or integrate with WebSocket
      return {
        isMonitoring: true,
        lastUpdate: new Date().toISOString(),
        activeConnections: 0,
        eventsPerMinute: 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};