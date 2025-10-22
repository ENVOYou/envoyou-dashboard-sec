/**
 * Anomaly Detection System Types
 * Based on backend API schemas for anomaly detection and analysis
 */

// Core Anomaly Types
export interface AnomalyDetectionRequest {
  company_id: string;
  reporting_year: number;
  anomaly_types?: string[];
  sensitivity?: 'low' | 'medium' | 'high';
  include_benchmarks?: boolean;
}

export interface AnomalyReportResponse {
  company_id: string;
  reporting_year: number;
  analysis_date: string;
  total_anomalies: number;
  anomalies_by_severity: Record<string, number>;
  detected_anomalies: DetectedAnomaly[];
  overall_risk_score: number;
  summary_insights: string[];
  recommendations: string[];
  metadata: AnomalyMetadata;
}

export interface DetectedAnomaly {
  id: string;
  anomaly_type: 'variance' | 'outlier' | 'benchmark_deviation' | 'data_quality' | 'trend_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_value: number;
  expected_range: {
    min: number;
    max: number;
  };
  confidence_score: number;
  recommendations: string[];
  metadata: Record<string, any>;
  related_emissions?: string[];
  impact_assessment?: {
    financial_impact: number;
    compliance_risk: 'low' | 'medium' | 'high';
    reputation_risk: 'low' | 'medium' | 'high';
  };
}

export interface AnomalyMetadata {
  analysis_method: string;
  data_sources: string[];
  confidence_threshold: number;
  processing_time: number;
  data_quality_score: number;
}

// Summary and Analytics
export interface AnomalySummaryResponse {
  company_id: string;
  reporting_year: number;
  total_anomalies: number;
  critical_anomalies: number;
  high_anomalies: number;
  overall_risk_score: number;
  last_analysis_date: string;
  requires_attention: boolean;
  trend_direction: 'improving' | 'stable' | 'worsening';
  risk_category: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnomalyTrendRequest {
  company_id: string;
  start_year: number;
  end_year: number;
  anomaly_types?: string[];
  include_benchmarks?: boolean;
}

export interface AnomalyTrendResponse {
  company_id: string;
  analysis_period: [number, number];
  trend_data: AnomalyTrendDataPoint[];
  trend_analysis: {
    average_risk_score: number;
    risk_score_trend: 'increasing' | 'stable' | 'decreasing';
    total_anomalies_trend: 'increasing' | 'stable' | 'decreasing';
    years_analyzed: number;
  };
  recommendations: string[];
  benchmark_comparison?: {
    industry_average: number;
    percentile_ranking: number;
    performance_category: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  };
}

export interface AnomalyTrendDataPoint {
  year: number;
  total_anomalies: number;
  anomalies_by_type: Record<string, number>;
  risk_score: number;
  critical_anomalies: number;
  high_anomalies: number;
  benchmark_deviation?: number;
}

// Batch Operations
export interface BatchAnomalyDetectionRequest {
  company_ids: string[];
  reporting_year: number;
  anomaly_types?: string[];
  priority_companies?: string[];
}

export interface BatchAnomalyDetectionResponse {
  total_companies: number;
  successful_analyses: number;
  failed_analyses: number;
  results: AnomalySummaryResponse[];
  errors: Array<{
    company_id: string;
    error: string;
  }>;
  processing_summary: {
    total_processing_time: number;
    average_time_per_company: number;
    started_at: string;
    completed_at: string;
  };
}

// Industry Benchmarks
export interface IndustryBenchmarkRequest {
  company_id: string;
  reporting_year: number;
  industry_sector?: string;
  peer_group?: string[];
  metrics?: string[];
}

export interface IndustryBenchmarkResponse {
  company_id: string;
  industry_sector: string;
  reporting_year: number;
  company_metrics: Record<string, number>;
  industry_benchmarks: Record<string, number>;
  deviations: Record<string, number>;
  percentile_ranking: Record<string, number>;
  recommendations: string[];
  peer_comparison?: {
    peer_count: number;
    company_rank: number;
    top_performers: string[];
    improvement_areas: string[];
  };
}

// Anomaly Investigation
export interface AnomalyInvestigationRequest {
  anomaly_id: string;
  include_raw_data?: boolean;
  include_historical_context?: boolean;
  include_correlation_analysis?: boolean;
}

export interface AnomalyInvestigationResponse {
  anomaly_id: string;
  investigation_details: {
    root_cause_analysis: string[];
    contributing_factors: string[];
    data_sources: string[];
    confidence_level: number;
  };
  historical_context: {
    similar_anomalies: DetectedAnomaly[];
    frequency_analysis: {
      occurrences_last_year: number;
      occurrences_last_3_years: number;
      pattern_detected: boolean;
    };
    trend_analysis: {
      direction: 'increasing' | 'decreasing' | 'stable';
      significance: number;
      seasonal_pattern: boolean;
    };
  };
  correlation_analysis: {
    correlated_emissions: string[];
    correlation_strength: Record<string, number>;
    potential_causes: string[];
  };
  remediation_suggestions: {
    immediate_actions: string[];
    long_term_solutions: string[];
    preventive_measures: string[];
    monitoring_recommendations: string[];
  };
  impact_assessment: {
    financial_impact: {
      estimated_cost: number;
      currency: string;
      confidence: number;
    };
    compliance_impact: {
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      potential_penalties: number;
      reporting_deadlines_affected: string[];
    };
    operational_impact: {
      affected_processes: string[];
      recommended_actions: string[];
    };
  };
}

// Dashboard and Analytics
export interface AnomalyDashboardStats {
  total_companies_analyzed: number;
  total_anomalies_detected: number;
  anomalies_by_severity: Record<string, number>;
  anomalies_by_type: Record<string, number>;
  average_risk_score: number;
  companies_requiring_attention: number;
  recent_anomalies: DetectedAnomaly[];
  risk_trends: {
    improving_companies: number;
    stable_companies: number;
    worsening_companies: number;
  };
  top_anomaly_types: Array<{
    type: string;
    count: number;
    avg_severity: number;
  }>;
  monthly_trends: Array<{
    month: string;
    anomaly_count: number;
    risk_score: number;
  }>;
}

// Alert and Notification Types
export interface AnomalyAlert {
  id: string;
  company_id: string;
  company_name?: string;
  anomaly_id: string;
  alert_type: 'new_anomaly' | 'risk_increase' | 'benchmark_deviation' | 'trend_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  detected_value: number;
  threshold_value: number;
  recommendation: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  action_required: boolean;
  assigned_to?: string[];
}

// Configuration Types
export interface AnomalyDetectionConfiguration {
  id: string;
  name: string;
  description?: string;
  settings: {
    enabled_anomaly_types: string[];
    sensitivity_levels: Record<string, number>;
    alert_thresholds: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    notification_settings: {
      email_enabled: boolean;
      in_app_enabled: boolean;
      escalation_rules: EscalationRule[];
    };
    analysis_schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      time: string;
      timezone: string;
    };
    benchmark_comparison: {
      enabled: boolean;
      industry_sector: string;
      peer_group_size: number;
    };
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationRule {
  id: string;
  condition: 'severity_threshold' | 'multiple_anomalies' | 'trend_direction' | 'time_elapsed';
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
  value: any;
  action: 'notify' | 'escalate' | 'create_ticket' | 'require_review';
  target_users?: string[];
  target_roles?: string[];
  delay_minutes?: number;
  message?: string;
}

// Search and Filter Types
export interface AnomalyFilters {
  severity?: string[];
  anomaly_type?: string[];
  company_id?: string;
  reporting_year?: number;
  risk_score_min?: number;
  risk_score_max?: number;
  date_from?: string;
  date_to?: string;
  requires_attention?: boolean;
  search?: string;
  sort_by?: 'detected_at' | 'severity' | 'risk_score' | 'company_name';
  sort_order?: 'asc' | 'desc';
}

export interface AnomalySearchResult {
  anomalies: DetectedAnomaly[];
  total_results: number;
  search_term: string;
  filters_applied: AnomalyFilters;
  aggregations: {
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    by_company: Record<string, number>;
  };
}

// Export and Reporting
export interface AnomalyExportRequest {
  anomaly_ids: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_investigation?: boolean;
  include_benchmarks?: boolean;
  include_recommendations?: boolean;
}

export interface AnomalyReportRequest {
  company_id?: string;
  reporting_year?: number;
  report_type: 'summary' | 'detailed' | 'trends' | 'benchmarks';
  include_charts: boolean;
  include_recommendations: boolean;
  format: 'pdf' | 'excel' | 'csv';
}

// Real-time Monitoring
export interface AnomalyMonitoringConfig {
  id: string;
  company_id: string;
  enabled: boolean;
  monitoring_rules: MonitoringRule[];
  alert_channels: string[];
  escalation_policy: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringRule {
  id: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'deviates_by';
  threshold: number;
  evaluation_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  alert_severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
}

// API Response Types
export interface AnomalyDetectionResponse {
  success: boolean;
  data: AnomalyReportResponse | AnomalySummaryResponse | AnomalyTrendResponse;
  processing_time: number;
  cached: boolean;
  cache_expires_at?: string;
}

// Error Types
export interface AnomalyDetectionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  company_id?: string;
  reporting_year?: number;
  suggested_actions?: string[];
}

// Utility Types
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnomalyType = 'variance' | 'outlier' | 'benchmark_deviation' | 'data_quality' | 'trend_anomaly';
export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';
export type TrendDirection = 'increasing' | 'stable' | 'decreasing';
export type PerformanceCategory = 'excellent' | 'good' | 'average' | 'below_average' | 'poor';