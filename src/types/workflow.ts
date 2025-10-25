/**
 * Workflow and Approval System Types
 * Based on backend API schemas for workflow management
 */

// Base Workflow Types
export interface Workflow {
  id: string;
  title: string;
  description?: string;
  workflow_type: 'emissions_approval' | 'report_approval' | 'entity_approval' | 'custom';
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  current_stage: number;
  total_stages: number;
  assigned_users?: string[];
  approvers?: WorkflowApprover[];
  attachments?: WorkflowAttachment[];
  metadata?: Record<string, unknown>;
}

// Workflow Approver
export interface WorkflowApprover {
  id: string;
  workflow_id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  stage: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  assigned_at: string;
  responded_at?: string;
  comments?: string;
  attachments?: WorkflowAttachment[];
  decision?: 'approve' | 'reject' | 'escalate';
  escalation_reason?: string;
}

// Workflow Stages
export interface WorkflowStage {
  id: string;
  workflow_id: string;
  stage_number: number;
  stage_name: string;
  description?: string;
  approver_role?: string;
  approver_ids?: string[];
  is_required: boolean;
  timeout_hours?: number;
  escalation_rules?: EscalationRule[];
  created_at: string;
}

export interface EscalationRule {
  id: string;
  condition: 'timeout' | 'rejection' | 'manual';
  action: 'notify' | 'reassign' | 'escalate_priority' | 'auto_approve' | 'auto_reject';
  target_users?: string[];
  target_roles?: string[];
  delay_hours?: number;
  message?: string;
}

// Workflow Attachments
export interface WorkflowAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  description?: string;
}

// Approval Requests
export interface ApprovalRequest {
  decision: 'approve' | 'reject' | 'escalate';
  comments?: string;
  attachments?: File[];
  escalation_reason?: string;
}

export interface ApprovalResponse {
  workflow_id: string;
  decision: 'approve' | 'reject' | 'escalate';
  approved_by: string;
  approved_by_name?: string;
  approved_at: string;
  next_stage?: number;
  workflow_completed: boolean;
  final_status?: Workflow['status'];
  comments?: string;
  escalation_details?: {
    escalated_to: string[];
    reason: string;
    escalated_at: string;
  };
}

// Workflow Creation/Update
export interface WorkflowCreate {
  title: string;
  description?: string;
  workflow_type: Workflow['workflow_type'];
  priority: Workflow['priority'];
  due_date?: string;
  assigned_users?: string[];
  stages?: WorkflowStageCreate[];
  attachments?: File[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowStageCreate {
  stage_name: string;
  description?: string;
  approver_role?: string;
  approver_ids?: string[];
  is_required: boolean;
  timeout_hours?: number;
  escalation_rules?: EscalationRule[];
}

export interface WorkflowUpdate {
  title?: string;
  description?: string;
  status?: Workflow['status'];
  priority?: Workflow['priority'];
  due_date?: string;
  assigned_users?: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowStatusUpdate {
  status: Workflow['status'];
  reason?: string;
  comments?: string;
}

// Workflow Filters and Search
export interface WorkflowFilters {
  status?: Workflow['status'][];
  workflow_type?: Workflow['workflow_type'][];
  priority?: Workflow['priority'][];
  created_by?: string;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title';
  sort_order?: 'asc' | 'desc';
}

// Workflow List Response
export interface WorkflowListResponse {
  workflows: Workflow[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface WorkflowSummary {
  id: string;
  title: string;
  workflow_type: Workflow['workflow_type'];
  status: Workflow['status'];
  priority: Workflow['priority'];
  created_by: string;
  created_by_name?: string;
  created_at: string;
  due_date?: string;
  current_stage: number;
  total_stages: number;
  pending_approvals: number;
  overdue: boolean;
  days_until_due?: number;
}

// Dashboard and Analytics
export interface WorkflowDashboardStats {
  total_workflows: number;
  workflows_by_status: Record<Workflow['status'], number>;
  workflows_by_priority: Record<Workflow['priority'], number>;
  workflows_by_type: Record<Workflow['workflow_type'], number>;
  pending_approvals: number;
  overdue_workflows: number;
  avg_completion_time: number;
  recent_activity: WorkflowActivity[];
  upcoming_deadlines: Workflow[];
  my_pending_approvals: Workflow[];
}

export interface WorkflowActivity {
  id: string;
  type: 'created' | 'submitted' | 'approved' | 'rejected' | 'escalated' | 'completed' | 'cancelled';
  workflow_id: string;
  workflow_title: string;
  user_id: string;
  user_name: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

// Notifications
export interface WorkflowNotification {
  id: string;
  type: 'approval_required' | 'workflow_escalated' | 'deadline_approaching' | 'status_changed' | 'comment_added';
  workflow_id: string;
  workflow_title: string;
  user_id: string;
  triggered_by: string;
  triggered_by_name: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// Workflow Templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  workflow_type: Workflow['workflow_type'];
  stages: WorkflowStage[];
  is_default: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

// Bulk Operations
export interface BulkWorkflowOperation {
  operation: 'approve' | 'reject' | 'escalate' | 'cancel' | 'reassign';
  workflow_ids: string[];
  parameters?: Record<string, unknown>;
}

export interface BulkWorkflowOperationResult {
  success_count: number;
  failure_count: number;
  results: Array<{
    workflow_id: string;
    success: boolean;
    error?: string;
  }>;
}

// Workflow Comments
export interface WorkflowComment {
  id: string;
  workflow_id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  content: string;
  comment_type: 'comment' | 'approval_note' | 'rejection_reason' | 'escalation_note';
  is_internal: boolean; // Internal notes vs public comments
  stage?: number;
  attachments?: WorkflowAttachment[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowCommentCreate {
  content: string;
  comment_type?: WorkflowComment['comment_type'];
  is_internal?: boolean;
  stage?: number;
  attachments?: File[];
}

// Workflow Analytics
export interface WorkflowAnalytics {
  workflow_id: string;
  total_stages: number;
  completed_stages: number;
  current_stage: number;
  avg_stage_completion_time: number;
  total_approval_time: number;
  bottleneck_stages: Array<{
    stage_number: number;
    stage_name: string;
    avg_completion_time: number;
    rejection_rate: number;
  }>;
  approval_patterns: {
    avg_approvals_per_day: number;
    peak_approval_hours: number[];
    common_rejection_reasons: string[];
  };
  recommendations: string[];
}

// Search and Filter Types
export interface WorkflowSearchResult {
  workflows: Workflow[];
  comments: WorkflowComment[];
  activities: WorkflowActivity[];
  total_results: number;
  search_term: string;
  filters_applied: WorkflowFilters;
}

// Permission Types
export interface WorkflowPermissions {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_approve: boolean;
  can_reject: boolean;
  can_escalate: boolean;
  can_cancel: boolean;
  can_reassign: boolean;
  can_view_internal_comments: boolean;
  assigned_roles: string[];
  max_priority_level: Workflow['priority'];
}

// Workflow Configuration
export interface WorkflowConfiguration {
  id: string;
  name: string;
  description?: string;
  settings: {
    default_timeout_hours: number;
    escalation_enabled: boolean;
    auto_approval_rules: AutoApprovalRule[];
    notification_settings: NotificationSettings;
    approval_chain: ApprovalChain[];
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AutoApprovalRule {
  id: string;
  condition: 'amount_threshold' | 'user_role' | 'workflow_type' | 'time_based';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: string | number | string[];
  action: 'auto_approve' | 'auto_reject' | 'require_additional_approval';
}

export interface NotificationSettings {
  email_enabled: boolean;
  in_app_enabled: boolean;
  escalation_notifications: boolean;
  deadline_reminders: boolean;
  reminder_hours_before_deadline: number[];
}

export interface ApprovalChain {
  level: number;
  role: string;
  user_ids?: string[];
  is_required: boolean;
  can_escalate: boolean;
}