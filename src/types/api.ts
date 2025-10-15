// API Response Types matching backend schemas

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'auditor' | 'cfo' | 'finance_team';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  recaptcha_token?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  confirm_password: string;
  role: 'admin' | 'auditor' | 'cfo' | 'finance_team';
  recaptcha_token?: string;
}

export interface CompanyEntity {
  id: string;
  company_id: string;
  name: string;
  entity_type: string;
  ownership_percentage?: number;
  has_operational_control: boolean;
  has_financial_control: boolean;
  level: number;
  path: string;
  location: {
    country: string;
    state?: string;
    city?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmissionCalculation {
  id: string;
  company_id: string;
  entity_id?: string;
  calculation_name: string;
  scope_type: 'scope1' | 'scope2' | 'scope3';
  total_co2e: number;
  total_scope1_co2e?: number;
  total_scope2_co2e?: number;
  total_scope3_co2e?: number;
  data_quality_score: number;
  status: 'draft' | 'completed' | 'approved';
  reporting_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface EmissionsSummary {
  company_id: string;
  reporting_year: number;
  total_scope1_co2e: number;
  total_scope2_co2e: number;
  total_scope3_co2e: number;
  total_co2e: number;
  data_quality_score: number;
  entity_count: number;
  calculation_count: number;
  last_updated: string;
}

export interface Report {
  id: string;
  title: string;
  report_type: 'sec_10k' | 'ghg_report' | 'sustainability_report';
  status: 'draft' | 'in_review' | 'approved' | 'locked';
  company_id: string;
  reporting_year: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  locked_by?: string;
  locked_at?: string;
  expires_at?: string;
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  workflow_type: string;
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  current_stage: number;
  total_stages: number;
}

export interface Consolidation {
  id: string;
  company_id: string;
  reporting_year: number;
  consolidation_method: 'ownership_based' | 'operational_control' | 'financial_control' | 'equity_share';
  total_scope1_co2e: number;
  total_scope2_co2e: number;
  total_scope3_co2e: number;
  total_co2e: number;
  status: 'draft' | 'completed' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface EPAFactor {
  id: string;
  factor_code: string;
  source: string;
  category: string;
  fuel_type?: string;
  co2_factor: number;
  ch4_factor?: number;
  n2o_factor?: number;
  unit: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  company_id?: string;
  entity_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Error Response
export interface APIError {
  detail: string;
  errors?: Record<string, string[]>;
}

// Generic API Response wrapper
export interface APIResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}