/**
 * Enhanced Reports Management Types
 * Based on backend API schemas for reports, locking, comments, and revisions
 */

// Base Report Types
export interface Report {
  id: string;
  title: string;
  report_type: 'sec_10k' | 'ghg_report' | 'sustainability_report' | 'esg_report';
  status: 'draft' | 'in_review' | 'approved' | 'locked' | 'archived';
  company_id: string;
  reporting_year: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  locked_by?: string;
  locked_at?: string;
  lock_reason?: string;
  expires_at?: string;
  description?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completion_percentage?: number;
}

// Report Locking System
export interface ReportLock {
  id: string;
  report_id: string;
  locked_by: string;
  locked_by_name?: string;
  lock_reason: string;
  locked_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ReportLockStatus {
  is_locked: boolean;
  locked_by?: string;
  locked_by_name?: string;
  lock_reason?: string;
  locked_at?: string;
  expires_at?: string;
  time_remaining?: string;
}

export interface LockReportRequest {
  lock_reason: string;
  expires_in_hours?: number;
}

export interface UnlockReportRequest {
  unlock_reason?: string;
}

// Comments System
export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  content: string;
  comment_type: 'comment' | 'question' | 'issue' | 'suggestion';
  status: 'open' | 'resolved' | 'closed';
  parent_id?: string; // For threaded comments
  mentions?: string[]; // User IDs mentioned in comment
  attachments?: CommentAttachment[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolved_by_name?: string;
  replies?: ReportComment[]; // Nested replies
}

export interface CommentAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CommentCreate {
  content: string;
  comment_type?: 'comment' | 'question' | 'issue' | 'suggestion';
  parent_id?: string;
  mentions?: string[];
  attachments?: File[];
}

export interface CommentResponse {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  content: string;
  comment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCommentList {
  comments: ReportComment[];
  total_count: number;
  unresolved_count: number;
}

// Revisions System
export interface ReportRevision {
  id: string;
  report_id: string;
  user_id: string;
  user_name?: string;
  change_type: 'created' | 'updated' | 'approved' | 'locked' | 'unlocked' | 'commented' | 'status_changed';
  changes_summary: string;
  previous_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RevisionResponse {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  change_type: string;
  changes_summary: string;
  created_at: string;
}

export interface ReportRevisionList {
  revisions: ReportRevision[];
  total_count: number;
}

// API Request/Response Types
export interface ReportsListResponse {
  reports: Report[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ReportsFilters {
  status?: string[];
  report_type?: string[];
  company_id?: string;
  reporting_year?: number;
  created_by?: string;
  tags?: string[];
  priority?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'status' | 'priority';
  sort_order?: 'asc' | 'desc';
}

// Report Creation/Update
export interface CreateReportRequest {
  title: string;
  report_type: 'sec_10k' | 'ghg_report' | 'sustainability_report' | 'esg_report';
  company_id: string;
  reporting_year: number;
  description?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

export interface UpdateReportRequest extends Partial<CreateReportRequest> {
  status?: Report['status'];
}

// Report Templates
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  report_type: Report['report_type'];
  sections: ReportSection[];
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'calculation' | 'chart' | 'table' | 'attachment';
  content?: string;
  configuration?: Record<string, any>;
  order: number;
  is_required: boolean;
}

// Dashboard/Analytics Types
export interface ReportsDashboardStats {
  total_reports: number;
  reports_by_status: Record<Report['status'], number>;
  reports_by_type: Record<Report['report_type'], number>;
  locked_reports: number;
  overdue_reports: number;
  recent_activity: ReportActivity[];
  upcoming_deadlines: Report[];
}

export interface ReportActivity {
  id: string;
  type: 'created' | 'updated' | 'locked' | 'unlocked' | 'commented' | 'approved';
  report_id: string;
  report_title: string;
  user_id: string;
  user_name: string;
  description: string;
  created_at: string;
}

// Export/Import Types
export interface ReportExportRequest {
  report_ids: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_comments?: boolean;
  include_revisions?: boolean;
  include_attachments?: boolean;
}

export interface ReportImportRequest {
  file: File;
  report_type?: Report['report_type'];
  company_id?: string;
  overwrite_existing?: boolean;
}

// Notification Types
export interface ReportNotification {
  id: string;
  type: 'report_locked' | 'report_unlocked' | 'comment_added' | 'deadline_approaching' | 'status_changed';
  report_id: string;
  report_title: string;
  user_id: string;
  triggered_by: string;
  triggered_by_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Search and Filter Types
export interface ReportSearchResult {
  reports: Report[];
  comments: ReportComment[];
  revisions: ReportRevision[];
  total_results: number;
  search_term: string;
  filters_applied: ReportsFilters;
}

// Permission Types
export interface ReportPermissions {
  can_view: boolean;
  can_edit: boolean;
  can_lock: boolean;
  can_unlock: boolean;
  can_comment: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_export: boolean;
  assigned_roles: string[];
}

// Bulk Operations
export interface BulkReportOperation {
  operation: 'lock' | 'unlock' | 'approve' | 'archive' | 'delete' | 'export';
  report_ids: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResult {
  success_count: number;
  failure_count: number;
  results: Array<{
    report_id: string;
    success: boolean;
    error?: string;
  }>;
}