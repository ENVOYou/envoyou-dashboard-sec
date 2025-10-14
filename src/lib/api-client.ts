import { APIError, APIResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
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

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) {
    return this.request('/auth/change-password', {
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
    return this.request(`/emissions/factors${query ? `?${query}` : ''}`);
  }

  async calculateScope1(data: any) {
    return this.request('/emissions/calculate/scope1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateScope2(data: any) {
    return this.request('/emissions/calculate/scope2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmissionsCalculations(params?: {
    company_id?: string;
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
    return this.request(`/emissions/calculations${query ? `?${query}` : ''}`);
  }

  async getCompanyEmissionsSummary(companyId: string, year?: number) {
    const params = year ? `?reporting_year=${year}` : '';
    return this.request(`/emissions/companies/${companyId}/summary${params}`);
  }

  // Company Entities endpoints
  async getCompanyEntities(companyId: string, includeInactive = false) {
    const params = includeInactive ? '?include_inactive=true' : '';
    return this.request(`/entities/company/${companyId}${params}`);
  }

  async createEntity(data: any) {
    return this.request('/entities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEntity(entityId: string, data: any) {
    return this.request(`/entities/${entityId}`, {
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

  async createReport(data: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(reportId: string, data: any) {
    return this.request(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async lockReport(reportId: string, data: any) {
    return this.request(`/reports/${reportId}/lock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unlockReport(reportId: string, data: any) {
    return this.request(`/reports/${reportId}/unlock`, {
      method: 'POST',
      body: JSON.stringify(data),
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

  async createWorkflow(data: any) {
    return this.request('/workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflowStatus(workflowId: string, data: any) {
    return this.request(`/workflow/${workflowId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Consolidation endpoints
  async getCompanyConsolidations(companyId: string, year?: number) {
    const params = year ? `?reporting_year=${year}` : '';
    return this.request(`/consolidation/company/${companyId}${params}`);
  }

  async createConsolidation(data: any) {
    return this.request('/consolidation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveConsolidation(consolidationId: string, data: any) {
    return this.request(`/consolidation/${consolidationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // EPA Data endpoints
  async refreshEPAData(data?: any) {
    return this.request('/epa/refresh', {
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