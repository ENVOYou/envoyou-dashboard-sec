/**
 * Reports Management Hooks
 * Custom React hooks for reports functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Report as EnhancedReport,
  ReportLock,
  ReportLockStatus,
  LockReportRequest,
  UnlockReportRequest,
  ReportComment,
  CommentCreate,
  CommentResponse,
  ReportCommentList,
  ReportRevision,
  RevisionResponse,
  ReportRevisionList,
  ReportsListResponse,
  ReportsFilters,
  CreateReportRequest,
  UpdateReportRequest,
  ReportsDashboardStats,
  ReportActivity,
  ReportNotification,
  ReportPermissions,
  BulkReportOperation,
  BulkOperationResult,
} from '@/types/reports';

// Query Keys
export const REPORTS_QUERY_KEYS = {
  all: ['reports'] as const,
  lists: () => [...REPORTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: ReportsFilters) => [...REPORTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...REPORTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REPORTS_QUERY_KEYS.details(), id] as const,
  lockStatus: (id: string) => [...REPORTS_QUERY_KEYS.all, 'lock-status', id] as const,
  locks: (id: string) => [...REPORTS_QUERY_KEYS.all, 'locks', id] as const,
  comments: (id: string) => [...REPORTS_QUERY_KEYS.all, 'comments', id] as const,
  revisions: (id: string) => [...REPORTS_QUERY_KEYS.all, 'revisions', id] as const,
  dashboard: () => [...REPORTS_QUERY_KEYS.all, 'dashboard'] as const,
  activity: (id?: string) => [...REPORTS_QUERY_KEYS.all, 'activity', id] as const,
  notifications: () => [...REPORTS_QUERY_KEYS.all, 'notifications'] as const,
  permissions: (id: string) => [...REPORTS_QUERY_KEYS.all, 'permissions', id] as const,
};

// Reports List Hook
export const useReports = (filters?: ReportsFilters) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.list(filters),
    queryFn: () => apiClient.getReports(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Single Report Hook
export const useReport = (id: string, enabled = true) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.detail(id),
    queryFn: () => apiClient.getReport(id),
    enabled: !!id && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Report Creation Hook
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportRequest) => apiClient.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.dashboard() });
    },
  });
};

// Report Update Hook
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportRequest }) =>
      apiClient.updateReport(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.dashboard() });
    },
  });
};

// Report Deletion Hook
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.dashboard() });
    },
  });
};

// Report Locking Hooks
export const useLockReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LockReportRequest }) =>
      apiClient.lockReport(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lockStatus(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.locks(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
    },
  });
};

export const useUnlockReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnlockReportRequest }) =>
      apiClient.unlockReport(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lockStatus(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.locks(id) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
    },
  });
};

export const useReportLockStatus = (id: string) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.lockStatus(id),
    queryFn: () => apiClient.getReportLockStatus(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds - lock status can change frequently
    refetchInterval: 30 * 1000,
  });
};

export const useReportLocks = (id: string) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.locks(id),
    queryFn: () => apiClient.getReportLocks(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Comments Hooks
export const useReportComments = (id: string, parentId?: string) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEYS.comments(id), parentId],
    queryFn: () => apiClient.getReportComments(id, parentId),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: CommentCreate }) =>
      apiClient.addCommentToReport(reportId, data),
    onSuccess: (result, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.comments(reportId) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(reportId) });
    },
  });
};

export const useResolveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, commentId }: { reportId: string; commentId: string }) =>
      apiClient.resolveReportComment(reportId, commentId),
    onSuccess: (result, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.comments(reportId) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(reportId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, commentId }: { reportId: string; commentId: string }) =>
      apiClient.deleteReportComment(reportId, commentId),
    onSuccess: (result, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.comments(reportId) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(reportId) });
    },
  });
};

// Revisions Hooks
export const useReportRevisions = (id: string) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.revisions(id),
    queryFn: () => apiClient.getReportRevisions(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: any }) =>
      apiClient.createReportRevision(reportId, data),
    onSuccess: (result, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.revisions(reportId) });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.detail(reportId) });
    },
  });
};

// Dashboard Hooks
export const useReportsDashboard = () => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.dashboard(),
    queryFn: () => apiClient.getReportsDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useReportActivity = (reportId?: string, limit = 20) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.activity(reportId),
    queryFn: () => apiClient.getReportActivity(reportId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Notifications Hooks
export const useReportNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEYS.notifications(), unreadOnly],
    queryFn: () => apiClient.getReportNotifications(unreadOnly),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for notifications
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.notifications() });
    },
  });
};

// Permissions Hook
export const useReportPermissions = (id: string) => {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.permissions(id),
    queryFn: () => apiClient.getReportPermissions(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
  });
};

// Search Hook
export const useSearchReports = (query: string, filters?: ReportsFilters) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEYS.all, 'search', query, filters],
    queryFn: () => apiClient.searchReports(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    // Using default query behavior for pagination
  });
};

// Bulk Operations Hook
export const useBulkReportOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkReportOperation) => apiClient.bulkOperation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.dashboard() });
    },
  });
};

// Export Hook
export const useExportReports = () => {
  return useMutation({
    mutationFn: (data: {
      report_ids: string[];
      format: 'pdf' | 'excel' | 'csv' | 'json';
      include_comments?: boolean;
      include_revisions?: boolean;
    }) => apiClient.exportReports(data),
  });
};

// Import Hook
export const useImportReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: any }) =>
      apiClient.importReports(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.dashboard() });
    },
  });
};