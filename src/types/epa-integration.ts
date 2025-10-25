/**
 * EPA Integration System Types
 * Based on backend API schemas for EPA data integration and compliance
 */

// Core EPA Data Types
export interface EPAFactor {
  id: string;
  factor_code: string;
  source: string;
  category: string;
  fuel_type?: string;
  electricity_region?: string;
  co2_factor: number;
  ch4_factor?: number;
  n2o_factor?: number;
  unit: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
  last_updated: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export interface EPACacheStatus {
  total_factors: number;
  last_refresh: string;
  next_refresh: string;
  cache_size: number;
  data_sources: string[];
  refresh_status: 'idle' | 'running' | 'completed' | 'failed';
  error_message?: string;
  refresh_duration?: number;
  factors_by_source: Record<string, number>;
  factors_by_category: Record<string, number>;
}

export interface EPARefreshRequest {
  force_refresh?: boolean;
  sources?: string[];
  categories?: string[];
  regions?: string[];
}

export interface EPARefreshResponse {
  message: string;
  updated_count: number;
  new_factors: number;
  updated_factors: number;
  errors: string[];
  processing_time: number;
  started_at: string;
  completed_at: string;
  cache_status: EPACacheStatus;
}

// GHGRP Integration
export interface GHGRPFacility {
  id: string;
  ghgrp_id: string;
  facility_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    county?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  parent_company: string;
  industry_sector: string;
  naics_code: string;
  reporting_year: number;
  emissions_data: GHGREmissionsData;
  verification_status: 'verified' | 'unverified' | 'pending';
  last_updated: string;
  is_active: boolean;
}

export interface GHGREmissionsData {
  total_co2e: number;
  scope1_emissions: number;
  scope2_emissions: number;
  biogenic_emissions?: number;
  emissions_by_gas: {
    co2: number;
    ch4: number;
    n2o: number;
    hfc?: number;
    pfc?: number;
    sf6?: number;
  };
  emissions_by_source: Record<string, number>;
  calculation_method: string;
  uncertainty_percentage: number;
  data_quality: 'high' | 'medium' | 'low';
}

export interface GHGRPSearchRequest {
  facility_name?: string;
  parent_company?: string;
  industry_sector?: string;
  naics_code?: string;
  state?: string;
  city?: string;
  zip_code?: string;
  reporting_year?: number;
  emissions_min?: number;
  emissions_max?: number;
  verification_status?: string;
  limit?: number;
  offset?: number;
}

export interface GHGRPSearchResponse {
  facilities: GHGRPFacility[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  aggregations: {
    by_industry_sector: Record<string, number>;
    by_state: Record<string, number>;
    by_verification_status: Record<string, number>;
    by_emissions_range: Record<string, number>;
  };
}

// EPA Reporting
export interface EPAReportingRequirement {
  id: string;
  report_type: 'ghgrp' | 'tri' | 'eis' | 'neis' | 'custom';
  name: string;
  description: string;
  frequency: 'annual' | 'quarterly' | 'monthly' | 'event_based';
  due_date: string;
  submission_method: 'electronic' | 'paper' | 'both';
  applicable_sectors: string[];
  applicable_naics: string[];
  thresholds: {
    employee_count?: number;
    revenue?: number;
    emissions?: number;
  };
  forms_required: string[];
  penalties: {
    late_filing: number;
    non_compliance: number;
    false_reporting: number;
  };
  is_active: boolean;
  last_updated: string;
}

export interface EPAReportingSchedule {
  id: string;
  company_id: string;
  company_name?: string;
  report_type: string;
  reporting_year: number;
  due_date: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'overdue' | 'exempt';
  assigned_to?: string;
  assigned_to_name?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: EPAReportingRequirement;
  progress_percentage: number;
  last_updated: string;
  submission_date?: string;
  confirmation_number?: string;
  notes?: string;
}

export interface EPAReportingSubmission {
  id: string;
  schedule_id: string;
  company_id: string;
  report_type: string;
  reporting_year: number;
  submission_data: Record<string, unknown>;
  submitted_by: string;
  submitted_by_name?: string;
  submitted_at: string;
  confirmation_number: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'amendment_required';
  review_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  attachments: EPAReportAttachment[];
  validation_results: ValidationResult[];
}

export interface EPAReportAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
  is_confidential: boolean;
}

export interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  suggested_fix?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// EPA Data Analytics
export interface EPADataAnalytics {
  total_facilities: number;
  total_emissions: number;
  facilities_by_sector: Record<string, number>;
  emissions_by_sector: Record<string, number>;
  emissions_by_state: Record<string, number>;
  top_emitters: Array<{
    facility_id: string;
    facility_name: string;
    parent_company: string;
    total_emissions: number;
    rank: number;
  }>;
  emissions_trends: {
    year_over_year_change: number;
    five_year_trend: 'increasing' | 'stable' | 'decreasing';
    seasonal_patterns: Record<string, number>;
  };
  compliance_status: {
    compliant_facilities: number;
    non_compliant_facilities: number;
    pending_submissions: number;
    overdue_submissions: number;
  };
  data_quality: {
    average_quality_score: number;
    high_quality_facilities: number;
    medium_quality_facilities: number;
    low_quality_facilities: number;
  };
}

// EPA Integration Configuration
export interface EPAIntegrationConfig {
  id: string;
  name: string;
  description?: string;
  settings: {
    auto_refresh_enabled: boolean;
    refresh_frequency: 'daily' | 'weekly' | 'monthly';
    refresh_time: string;
    data_sources: string[];
    include_historical_data: boolean;
    data_retention_period: number; // days
    notification_settings: {
      refresh_completion: boolean;
      error_notifications: boolean;
      data_quality_alerts: boolean;
    };
    api_credentials: {
      api_key?: string;
      api_secret?: string;
      rate_limits?: {
        requests_per_minute: number;
        requests_per_hour: number;
      };
    };
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_refresh?: string;
  next_refresh?: string;
}

// EPA Data Import/Export
export interface EPADataImportRequest {
  source: 'ghgrp' | 'egrid' | 'tri' | 'custom';
  file?: File;
  api_endpoint?: string;
  parameters?: Record<string, unknown>;
  mapping_rules?: DataMappingRule[];
  validation_rules?: ValidationRule[];
  overwrite_existing?: boolean;
}

export interface DataMappingRule {
  source_field: string;
  target_field: string;
  transformation?: 'none' | 'convert_units' | 'normalize' | 'custom';
  default_value?: string | number | boolean | null;
  required: boolean;
}

export interface ValidationRule {
  field: string;
  rule_type: 'required' | 'range' | 'format' | 'reference' | 'custom';
  parameters: Record<string, unknown>;
  error_message: string;
}

export interface EPADataImportResponse {
  import_id: string;
  source: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  started_at: string;
  completed_at?: string;
  estimated_completion?: string;
  download_url?: string;
}

export interface ImportError {
  row_number?: number;
  field?: string;
  error_type: string;
  message: string;
  suggested_fix?: string;
}

export interface ImportWarning {
  row_number?: number;
  field?: string;
  warning_type: string;
  message: string;
  suggestion?: string;
}

// EPA Compliance Monitoring

export interface ComplianceViolation {
  id: string;
  violation_type: 'late_submission' | 'incomplete_data' | 'inaccurate_reporting' | 'missing_documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_reports: string[];
  detection_date: string;
  resolution_status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
  penalties?: {
    amount: number;
    currency: string;
    description: string;
  };
}

// EPA Dashboard and Analytics
export interface EPADashboardStats {
  total_facilities: number;
  total_emissions: number;
  facilities_by_sector: Record<string, number>;
  emissions_by_sector: Record<string, number>;
  compliance_status: {
    compliant_companies: number;
    non_compliant_companies: number;
    pending_submissions: number;
    overdue_submissions: number;
  };
  data_quality: {
    high_quality: number;
    medium_quality: number;
    low_quality: number;
    average_score: number;
  };
  recent_activity: EPAActivity[];
  upcoming_deadlines: EPAReportingSchedule[];
  top_emitters: Array<{
    facility_id: string;
    facility_name: string;
    parent_company: string;
    total_emissions: number;
    rank: number;
  }>;
  emissions_trends: {
    current_year: number;
    previous_year: number;
    change_percentage: number;
    trend_direction: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface EPAActivity {
  id: string;
  type: 'data_refresh' | 'report_submission' | 'compliance_check' | 'violation_detected' | 'facility_added';
  description: string;
  user_id: string;
  user_name: string;
  company_id?: string;
  company_name?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  impact_level: 'low' | 'medium' | 'high';
}

// Search and Filter Types
export interface EPAFilters {
  industry_sector?: string[];
  state?: string[];
  company_name?: string;
  facility_name?: string;
  naics_code?: string[];
  reporting_year?: number;
  emissions_min?: number;
  emissions_max?: number;
  verification_status?: string;
  data_quality?: string;
  compliance_status?: string;
  search?: string;
  sort_by?: 'facility_name' | 'emissions' | 'company_name' | 'reporting_year' | 'last_updated';
  sort_order?: 'asc' | 'desc';
}

export interface EPASearchResult {
  facilities: GHGRPFacility[];
  total_results: number;
  search_term: string;
  filters_applied: EPAFilters;
  aggregations: {
    by_industry_sector: Record<string, number>;
    by_state: Record<string, number>;
    by_verification_status: Record<string, number>;
    by_emissions_range: Record<string, number>;
  };
  summary: {
    total_emissions: number;
    average_emissions: number;
    top_sector: string;
    compliance_rate: number;
  };
}

// API Response Types
export interface EPADataResponse {
  success: boolean;
  data: EPACacheStatus | GHGRPSearchResponse | EPADashboardStats | EPAReportingSchedule[];
  message?: string;
  processing_time: number;
  cached: boolean;
  cache_expires_at?: string;
}

export interface EPAError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  suggested_actions?: string[];
}

// Utility Types
export type EPADataSource = 'ghgrp' | 'egrid' | 'tri' | 'neis' | 'custom';
export type EPAReportType = 'ghgrp' | 'tri' | 'eis' | 'neis' | 'custom';
export type EPAComplianceStatus = 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
export type EPADataQuality = 'high' | 'medium' | 'low';
export type EPAVerificationStatus = 'verified' | 'unverified' | 'pending';
export type EPASubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'amendment_required';
export type EPAScheduleStatus = 'pending' | 'in_progress' | 'submitted' | 'overdue' | 'exempt';
export type EPAPriority = 'low' | 'medium' | 'high' | 'critical';
export type EPAImpactLevel = 'low' | 'medium' | 'high';
export type EPATrendDirection = 'increasing' | 'stable' | 'decreasing';