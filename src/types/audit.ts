/**
 * Audit System Types
 * Based on backend API schemas for audit logging and compliance tracking
 */

// Core Audit Types
export interface AuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  company_id?: string;
  company_name?: string;
  entity_id?: string;
  entity_name?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  created_at: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  compliance_relevant: boolean;
  retention_period?: string;
  tags?: string[];
}

export interface EnhancedAuditLog {
  id: string;
  event_type: string;
  category: 'authentication' | 'data_access' | 'data_modification' | 'system' | 'security' | 'compliance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: string;
  user_name?: string;
  user_role?: string;
  company_id?: string;
  company_name?: string;
  entity_id?: string;
  entity_name?: string;
  resource_type: string;
  resource_id?: string;
  action: string;
  details: Record<string, any>;
  before_values?: Record<string, any>;
  after_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  device_info?: {
    browser?: string;
    os?: string;
    device_type?: string;
  };
  risk_score: number;
  compliance_flags: string[];
  created_at: string;
  expires_at?: string;
  retention_category: 'short' | 'medium' | 'long' | 'permanent';
}

// Audit Search and Filtering
export interface AuditFilters {
  event_type?: string[];
  category?: string[];
  severity?: string[];
  user_id?: string;
  company_id?: string;
  entity_id?: string;
  resource_type?: string;
  action?: string;
  risk_score_min?: number;
  risk_score_max?: number;
  compliance_relevant?: boolean;
  date_from?: string;
  date_to?: string;
  ip_address?: string;
  location?: string;
  search?: string;
  sort_by?: 'created_at' | 'event_type' | 'severity' | 'risk_score' | 'user_name';
  sort_order?: 'asc' | 'desc';
}

export interface AuditSearchResult {
  logs: AuditLog[];
  total_results: number;
  search_term: string;
  filters_applied: AuditFilters;
  aggregations: {
    by_event_type: Record<string, number>;
    by_category: Record<string, number>;
    by_severity: Record<string, number>;
    by_user: Record<string, number>;
    by_company: Record<string, number>;
    by_hour: Record<string, number>;
    by_location: Record<string, number>;
  };
  risk_summary: {
    total_risk_score: number;
    average_risk_score: number;
    high_risk_events: number;
    compliance_violations: number;
  };
}

// Enhanced Audit Trail
export interface AuditTrailRequest {
  resource_type: string;
  resource_id: string;
  include_related?: boolean;
  include_system_events?: boolean;
  start_date?: string;
  end_date?: string;
  max_depth?: number;
}

export interface AuditTrailResponse {
  resource_type: string;
  resource_id: string;
  total_events: number;
  timeline: AuditTrailEvent[];
  related_events: AuditTrailEvent[];
  summary: {
    first_event: string;
    last_event: string;
    total_users: number;
    total_companies: number;
    risk_trend: 'increasing' | 'stable' | 'decreasing';
  };
  compliance_status: {
    is_compliant: boolean;
    violations: string[];
    warnings: string[];
    recommendations: string[];
  };
}

export interface AuditTrailEvent {
  id: string;
  event_type: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  details: Record<string, any>;
  risk_level: string;
  compliance_relevant: boolean;
  related_events: string[];
  depth: number;
}

// Forensic Analysis
export interface ForensicAnalysisRequest {
  investigation_id: string;
  scope: {
    users?: string[];
    companies?: string[];
    entities?: string[];
    date_range: {
      start: string;
      end: string;
    };
    event_types?: string[];
  };
  analysis_type: 'timeline' | 'pattern' | 'anomaly' | 'correlation' | 'comprehensive';
  include_raw_data?: boolean;
  correlation_threshold?: number;
}

export interface ForensicAnalysisResponse {
  investigation_id: string;
  analysis_type: string;
  scope: any;
  findings: ForensicFinding[];
  patterns: DetectedPattern[];
  anomalies: ForensicAnomaly[];
  correlations: CorrelationResult[];
  timeline: TimelineEvent[];
  summary: {
    total_events_analyzed: number;
    suspicious_activities: number;
    compliance_violations: number;
    risk_score: number;
    confidence_level: number;
  };
  recommendations: string[];
  evidence: EvidenceItem[];
  processing_time: number;
  completed_at: string;
}

export interface ForensicFinding {
  id: string;
  type: 'suspicious_activity' | 'policy_violation' | 'data_breach' | 'unauthorized_access' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_resources: string[];
  affected_users: string[];
  timeline: string[];
  evidence: EvidenceItem[];
  risk_assessment: {
    impact: 'minimal' | 'moderate' | 'significant' | 'severe';
    likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
    risk_score: number;
  };
  compliance_impact: string[];
  remediation_steps: string[];
  assigned_to?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface DetectedPattern {
  id: string;
  pattern_type: 'temporal' | 'behavioral' | 'access' | 'data' | 'network';
  description: string;
  frequency: number;
  confidence: number;
  affected_users: string[];
  affected_resources: string[];
  timeline: string[];
  risk_level: string;
  examples: AuditLog[];
}

export interface ForensicAnomaly {
  id: string;
  anomaly_type: 'statistical' | 'behavioral' | 'temporal' | 'geographic';
  description: string;
  deviation_score: number;
  expected_behavior: string;
  actual_behavior: string;
  affected_entities: string[];
  potential_impact: string;
  investigation_required: boolean;
}

export interface CorrelationResult {
  id: string;
  correlation_type: 'user_activity' | 'resource_access' | 'temporal' | 'geographic';
  strength: number;
  confidence: number;
  entities: string[];
  events: string[];
  pattern: string;
  risk_implications: string[];
}

export interface TimelineEvent {
  timestamp: string;
  event_type: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  risk_level: string;
  milestone: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'log_entry' | 'screenshot' | 'file' | 'database_record' | 'network_capture';
  description: string;
  content: any;
  timestamp: string;
  source: string;
  chain_of_custody: string[];
  integrity_hash: string;
}

// Compliance Tracking
export interface ComplianceReportRequest {
  report_type: 'sox' | 'gdpr' | 'hipaa' | 'iso27001' | 'custom';
  company_id?: string;
  date_range: {
    start: string;
    end: string;
  };
  include_audit_trails?: boolean;
  include_risk_assessment?: boolean;
  format: 'pdf' | 'excel' | 'json';
}

export interface ComplianceReportResponse {
  report_id: string;
  report_type: string;
  company_id?: string;
  date_range: {
    start: string;
    end: string;
  };
  compliance_status: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  overall_score: number;
  sections: ComplianceSection[];
  violations: ComplianceViolation[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
  valid_until: string;
  download_url: string;
}

export interface ComplianceSection {
  id: string;
  title: string;
  category: string;
  status: 'compliant' | 'warning' | 'violation';
  score: number;
  requirements: ComplianceRequirement[];
  evidence: EvidenceItem[];
  findings: string[];
}

export interface ComplianceRequirement {
  id: string;
  requirement: string;
  status: 'met' | 'partially_met' | 'not_met' | 'not_applicable';
  evidence: string[];
  notes: string;
  risk_level: string;
}

export interface ComplianceViolation {
  id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_systems: string[];
  affected_users: string[];
  detection_date: string;
  resolution_status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
}

// Security Monitoring
export interface SecurityEvent {
  id: string;
  event_type: 'login_failure' | 'suspicious_access' | 'data_export' | 'privilege_escalation' | 'policy_violation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: string;
  user_name?: string;
  company_id?: string;
  company_name?: string;
  description: string;
  details: Record<string, any>;
  risk_score: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: SecurityIndicator[];
  response_actions: string[];
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SecurityIndicator {
  type: 'ip_reputation' | 'geographic_anomaly' | 'time_anomaly' | 'behavior_anomaly' | 'data_volume';
  value: any;
  risk_score: number;
  description: string;
  confidence: number;
}

// Audit Dashboard and Analytics
export interface AuditDashboardStats {
  total_logs: number;
  logs_by_category: Record<string, number>;
  logs_by_severity: Record<string, number>;
  high_risk_events: number;
  compliance_violations: number;
  security_incidents: number;
  active_investigations: number;
  recent_activity: AuditActivity[];
  risk_trends: {
    direction: 'increasing' | 'stable' | 'decreasing';
    change_percentage: number;
    period: string;
  };
  top_users: Array<{
    user_id: string;
    user_name: string;
    event_count: number;
    risk_score: number;
  }>;
  top_companies: Array<{
    company_id: string;
    company_name: string;
    event_count: number;
    compliance_score: number;
  }>;
  hourly_distribution: Record<string, number>;
  geographic_distribution: Record<string, number>;
}

// Audit Activity
export interface AuditActivity {
  id: string;
  type: 'log_created' | 'investigation_started' | 'violation_detected' | 'report_generated' | 'export_performed';
  description: string;
  user_id: string;
  user_name: string;
  company_id?: string;
  company_name?: string;
  timestamp: string;
  risk_level: string;
  compliance_relevant: boolean;
  metadata: Record<string, any>;
}

// Export and Reporting
export interface AuditExportRequest {
  filters: AuditFilters;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_raw_data?: boolean;
  include_analysis?: boolean;
  include_compliance_summary?: boolean;
  date_range: {
    start: string;
    end: string;
  };
}

export interface AuditReportRequest {
  report_type: 'activity_summary' | 'compliance_report' | 'security_incidents' | 'user_activity' | 'system_audit';
  company_id?: string;
  user_id?: string;
  date_range: {
    start: string;
    end: string;
  };
  include_charts: boolean;
  include_recommendations: boolean;
  format: 'pdf' | 'excel' | 'json';
}

// Real-time Monitoring
export interface AuditMonitoringConfig {
  id: string;
  name: string;
  enabled: boolean;
  monitoring_rules: AuditMonitoringRule[];
  alert_channels: string[];
  escalation_policy: string;
  created_at: string;
  updated_at: string;
}

export interface AuditMonitoringRule {
  id: string;
  event_type: string;
  condition: 'count_threshold' | 'frequency_threshold' | 'pattern_match' | 'risk_threshold';
  threshold: number;
  time_window: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notification_template: string;
}

// Investigation Management
export interface InvestigationRequest {
  title: string;
  description: string;
  type: 'security_incident' | 'compliance_violation' | 'data_breach' | 'policy_violation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string[];
  scope: {
    users?: string[];
    companies?: string[];
    entities?: string[];
    date_range: {
      start: string;
      end: string;
    };
    event_types?: string[];
  };
  initial_findings?: string;
  attachments?: File[];
}

export interface InvestigationResponse {
  investigation_id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: 'open' | 'in_progress' | 'pending_review' | 'closed';
  assigned_to: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  findings: string[];
  evidence: EvidenceItem[];
  recommendations: string[];
  related_audit_logs: string[];
  forensic_analysis?: ForensicAnalysisResponse;
}

// API Response Types
export interface AuditLogsResponse {
  logs: AuditLog[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  aggregations?: any;
  risk_summary?: any;
}

export interface AuditError {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggested_actions?: string[];
}

// Utility Types
export type AuditEventType =
  | 'user_login'
  | 'user_logout'
  | 'password_change'
  | 'role_change'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'report_generation'
  | 'export_data'
  | 'system_config_change'
  | 'security_event'
  | 'compliance_check'
  | 'audit_log_access'
  | 'investigation_start'
  | 'investigation_close';

export type AuditCategory = 'authentication' | 'data_access' | 'data_modification' | 'system' | 'security' | 'compliance';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
export type InvestigationStatus = 'open' | 'in_progress' | 'pending_review' | 'closed';
export type InvestigationPriority = 'low' | 'medium' | 'high' | 'critical';