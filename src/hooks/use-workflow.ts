/**
 * Workflow Management Hooks
 * Custom React hooks for workflow functionality using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Workflow,
  WorkflowSummary,
  WorkflowCreate,
  WorkflowUpdate,
  WorkflowStatusUpdate,
  WorkflowFilters,
  WorkflowListResponse,
  WorkflowDashboardStats,
  WorkflowActivity,
  WorkflowApprover,
  WorkflowStage,
  ApprovalRequest,
  ApprovalResponse,
  WorkflowNotification,
  WorkflowComment,
  WorkflowCommentCreate,
  WorkflowTemplate,
  WorkflowConfiguration,
  BulkWorkflowOperation,
  BulkWorkflowOperationResult,
} from '@/types/workflow';

// Query Keys
export const WORKFLOW_QUERY_KEYS = {
  all: ['workflows'] as const,
  lists: () => [...WORKFLOW_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: WorkflowFilters) => [...WORKFLOW_QUERY_KEYS.lists(), filters] as const,
  details: () => [...WORKFLOW_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WORKFLOW_QUERY_KEYS.details(), id] as const,
  approvers: (id: string) => [...WORKFLOW_QUERY_KEYS.all, 'approvers', id] as const,
  stages: (id: string) => [...WORKFLOW_QUERY_KEYS.all, 'stages', id] as const,
  comments: (id: string) => [...WORKFLOW_QUERY_KEYS.all, 'comments', id] as const,
  dashboard: () => [...WORKFLOW_QUERY_KEYS.all, 'dashboard'] as const,
  activity: (id?: string) => [...WORKFLOW_QUERY_KEYS.all, 'activity', id] as const,
  notifications: () => [...WORKFLOW_QUERY_KEYS.all, 'notifications'] as const,
  templates: () => [...WORKFLOW_QUERY_KEYS.all, 'templates'] as const,
  configuration: () => [...WORKFLOW_QUERY_KEYS.all, 'configuration'] as const,
  pendingApprovals: () => [...WORKFLOW_QUERY_KEYS.all, 'pending-approvals'] as const,
};

// Workflows List Hook
export const useWorkflows = (filters?: WorkflowFilters) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.list(filters),
    queryFn: () => apiClient.getWorkflows(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Single Workflow Hook
export const useWorkflow = (id: string, enabled = true) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.detail(id),
    queryFn: () => apiClient.getWorkflow(id),
    enabled: !!id && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Workflow Creation Hook
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkflowCreate) => apiClient.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Workflow Update Hook
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkflowUpdate }) =>
      apiClient.updateWorkflow(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Workflow Deletion Hook
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Workflow Submission Hook
export const useSubmitWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) => apiClient.submitWorkflow(workflowId),
    onSuccess: (result, workflowId) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.pendingApprovals() });
    },
  });
};

// Workflow Approval Hook
export const useApproveWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: ApprovalRequest }) =>
      apiClient.approveWorkflow(workflowId, data),
    onSuccess: (result, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.pendingApprovals() });
    },
  });
};

// Workflow Status Update Hook
export const useUpdateWorkflowStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: WorkflowStatusUpdate }) =>
      apiClient.updateWorkflowStatus(workflowId, data),
    onSuccess: (result, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Workflow Approvers Hook
export const useWorkflowApprovers = (id: string) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.approvers(id),
    queryFn: () => apiClient.getWorkflowApprovers(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Workflow Stages Hook
export const useWorkflowStages = (id: string) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.stages(id),
    queryFn: () => apiClient.getWorkflowStages(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Pending Approvals Hook
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.pendingApprovals(),
    queryFn: () => apiClient.getPendingApprovals(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for pending approvals
  });
};

// Workflow Escalation Hook
export const useEscalateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: { reason: string; priority_increase?: string } }) =>
      apiClient.escalateWorkflow(workflowId, data),
    onSuccess: (result, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Workflow Approvals History Hook
export const useWorkflowApprovals = (id: string) => {
  return useQuery({
    queryKey: [...WORKFLOW_QUERY_KEYS.all, 'approvals', id],
    queryFn: () => apiClient.getWorkflowApprovals(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Workflow Comments Hooks
export const useWorkflowComments = (id: string, stage?: number) => {
  return useQuery({
    queryKey: [...WORKFLOW_QUERY_KEYS.comments(id), stage],
    queryFn: () => apiClient.getWorkflowComments(id, stage),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddWorkflowComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: WorkflowCommentCreate }) =>
      apiClient.addCommentToWorkflow(workflowId, data),
    onSuccess: (result, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.comments(workflowId) });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(workflowId) });
    },
  });
};

// Dashboard Hooks
export const useWorkflowDashboard = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.dashboard(),
    queryFn: () => apiClient.getWorkflowDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useWorkflowActivity = (workflowId?: string, limit = 20) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.activity(workflowId),
    queryFn: () => apiClient.getWorkflowActivity(workflowId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Notifications Hooks
export const useWorkflowNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: [...WORKFLOW_QUERY_KEYS.notifications(), unreadOnly],
    queryFn: () => apiClient.getWorkflowNotifications(unreadOnly),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for notifications
  });
};

export const useMarkWorkflowNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markWorkflowNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.notifications() });
    },
  });
};

// Templates Hooks
export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.templates(),
    queryFn: () => apiClient.getWorkflowTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes - templates don't change often
  });
};

export const useCreateWorkflowFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<WorkflowCreate> }) =>
      apiClient.createWorkflowFromTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
    },
  });
};

// Configuration Hooks
export const useWorkflowConfiguration = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.configuration(),
    queryFn: () => apiClient.getWorkflowConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes - configuration doesn't change often
  });
};

export const useUpdateWorkflowConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkflowConfiguration>) => apiClient.updateWorkflowConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.configuration() });
    },
  });
};

// Search Hook
export const useSearchWorkflows = (query: string, filters?: WorkflowFilters) => {
  return useQuery({
    queryKey: [...WORKFLOW_QUERY_KEYS.all, 'search', query, filters],
    queryFn: () => apiClient.searchWorkflows(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Bulk Operations Hook
export const useBulkWorkflowOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkWorkflowOperation) => apiClient.bulkWorkflowOperation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.pendingApprovals() });
    },
  });
};