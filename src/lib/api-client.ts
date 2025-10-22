import { APIError, AuthResponse, LoginRequest, RegisterRequest, EmissionCalculation, CalculationResponse, CompanyEntity, Report, Workflow, Consolidation, EPAFactor } from '../types/api';
import type { User } from '../types/api';

// Request/Response types for API methods
interface Scope1CalculationRequest {
  calculation_name: string;
  company_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  activity_data: Array<{
    activity_type: string;
    fuel_type: string;
    quantity: number;
    unit: string;
    data_quality: string;
  }>;
}

interface Scope2CalculationRequest {
  calculation_name: string;
  company_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  electricity_consumption: Array<{
    activity_type: string;
    quantity: number;
    unit: string;
    location: string;
    data_quality: string;
  }>;
  calculation_method: 'location_based' | 'market_based';
}

interface EntityRequest {
  company_id: string;
  name: string;
  entity_type: string;
  ownership_percentage?: number;
  has_operational_control: boolean;
  has_financial_control: boolean;
  location: {
    country: string;
    state?: string;
    city?: string;
  };
}

interface ReportRequest {
  title: string;
  report_type: 'sec_10k' | 'ghg_report' | 'sustainability_report';
  company_id: string;
  reporting_year: number;
}

interface WorkflowRequest {
  title: string;
  description?: string;
  workflow_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

interface ConsolidationRequest {
  company_id: string;
  reporting_year: number;
  consolidation_method: 'ownership_based' | 'operational_control' | 'financial_control' | 'equity_share';
}

interface LockUnlockRequest {
  reason: string;
  expires_at?: string;
}

interface WorkflowStatusUpdate {
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'rejected';
  notes?: string;
}

interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getBasicAuthHeader(): string | null {
    // Use environment variables for staging credentials (configurable)
    const username = process.env.NEXT_PUBLIC_STAGING_API_USER;
    const password = process.env.NEXT_PUBLIC_STAGING_API_PASS;

    if (username && password) {
      // Create Basic Auth header: Base64 encoded "username:password"
      const credentials = btoa(`${username}:${password}`);
      return `Basic ${credentials}`;
    }

    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Determine authentication method based on endpoint
    const isLoginEndpoint = endpoint === '/auth/login';
    const isRegisterEndpoint = endpoint === '/auth/register';
    const isRefreshEndpoint = endpoint === '/auth/refresh';

    // Public auth endpoints (login, register, refresh) use Basic Auth in staging
    if (isLoginEndpoint || isRegisterEndpoint || isRefreshEndpoint) {
      // Add Basic Auth header for staging environments
      const basicAuth = this.getBasicAuthHeader();
      if (basicAuth) {
        headers.Authorization = basicAuth;
      }
    } else {
      // All other endpoints (including /auth/me, /auth/change-password, etc.) use Bearer token
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        // If no token available, fall back to Basic Auth for staging
        const basicAuth = this.getBasicAuthHeader();
        if (basicAuth) {
          headers.Authorization = basicAuth;
        }
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && !isRetry) {
          // Token expired or invalid - try to refresh token
          console.log('Token expired, attempting refresh...');
          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.access_token) {
              console.log('Token refreshed successfully');
              // Update stored tokens
              if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', refreshResponse.access_token);
                if (refreshResponse.refresh_token) {
                  localStorage.setItem('refresh_token', refreshResponse.refresh_token);
                }
              }
              // Retry the original request with new token
              return this.request<T>(endpoint, options, true);
            }
          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError);
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please login again.');
          }
        }

        if (response.status === 401) {
          // Token expired and refresh failed or this is a retry
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          throw new Error('Authentication required');
        }

        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: APIError = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If we can't parse the error, use the default message
        }

        throw new Error(errorMessage);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('API Client - Login attempt to:', this.baseURL);
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async changePassword(data: PasswordChangeRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Emissions endpoints
  async getEmissionsFactors(params?: {
    source?: string;
    category?: string;
    fuel_type?: string;
    electricity_region?: string;
    force_refresh?: boolean;
  }): Promise<EPAFactor[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request<EPAFactor[]>(`/emissions/factors${query ? `?${query}` : ''}`);
  }

  async calculateScope1(data: Scope1CalculationRequest): Promise<EmissionCalculation> {
    return this.request<EmissionCalculation>('/emissions/calculate/scope1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateScope2(data: Scope2CalculationRequest): Promise<EmissionCalculation> {
    return this.request<EmissionCalculation>('/emissions/calculate/scope2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmissionsCalculations(params?: {
    company_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CalculationResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/emissions/calculations${query ? `?${query}` : ''}`);
  }

  async getCompanyEmissionsSummary(companyId: string, year?: number) {
    const params = year ? `?reporting_year=${year}` : '';
    return this.request(`/emissions/companies/${companyId}/summary${params}`);
  }

  // Company Entities endpoints
  async getCompanyEntities(companyId: string, includeInactive = false): Promise<CompanyEntity[]> {
    const params = includeInactive ? '?include_inactive=true' : '';
    return this.request<CompanyEntity[]>(`/entities/company/${companyId}${params}`);
  }

  async createEntity(data: EntityRequest): Promise<CompanyEntity> {
    return this.request<CompanyEntity>('/entities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEntity(entityId: string, data: Partial<EntityRequest>): Promise<CompanyEntity> {
    return this.request<CompanyEntity>(`/entities/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEntity(entityId: string) {
    return this.request(`/entities/${entityId}`, {
      method: 'DELETE',
    });
  }

  // Reports endpoints
  async getReports(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/reports${query ? `?${query}` : ''}`);
  }

  async createReport(data: ReportRequest): Promise<Report> {
    return this.request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(reportId: string, data: Partial<ReportRequest>): Promise<Report> {
    return this.request<Report>(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async lockReport(reportId: string, data: LockUnlockRequest): Promise<Report> {
    return this.request<Report>(`/reports/${reportId}/lock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unlockReport(reportId: string, data: LockUnlockRequest): Promise<Report> {
    return this.request<Report>(`/reports/${reportId}/unlock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addComment(reportId: string, content: string): Promise<ReportComment> {
    return this.request<ReportComment>(`/reports/${reportId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Workflow endpoints
  async getWorkflows(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/workflow${query ? `?${query}` : ''}`);
  }

  async createWorkflow(data: WorkflowRequest): Promise<Workflow> {
    return this.request<Workflow>('/workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflowStatus(workflowId: string, data: WorkflowStatusUpdate): Promise<Workflow> {
    return this.request<Workflow>(`/workflow/${workflowId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Consolidation endpoints
  async getCompanyConsolidations(companyId: string, year?: number) {
    const params = year ? `?reporting_year=${year}` : '';
    return this.request(`/consolidation/company/${companyId}${params}`);
  }

  async createConsolidation(data: ConsolidationRequest): Promise<Consolidation> {
    return this.request<Consolidation>('/consolidation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveConsolidation(consolidationId: string, data: { approved_by: string; notes?: string }): Promise<Consolidation> {
    return this.request<Consolidation>(`/consolidation/${consolidationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // EPA Data endpoints
  async refreshEPAData(data?: { force_refresh?: boolean; sources?: string[] }): Promise<{ message: string; updated_count: number }> {
    return this.request<{ message: string; updated_count: number }>('/epa/refresh', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getEPACacheStatus() {
    return this.request('/epa/cache/status');
  }

  // Audit endpoints
  async getAuditLogs(params?: {
    limit?: number;
    offset?: number;
    event_type?: string;
    user_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/audit/logs${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new APIClient();