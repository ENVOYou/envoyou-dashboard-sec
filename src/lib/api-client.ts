import {
  APIError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  EmissionCalculation,
  CalculationResponse,
  CompanyEntity,
  Report,
  Consolidation,
} from "../types/api";
import type {
  ValidationMetrics,
  CalculationSummary,
  EmissionsCalculationResponse,
  CalculationAuditTrailResponse,
  EmissionFactorResponse,
  CompanyEmissionsSummary,
} from "../types/emissions";
import type { User } from "../types/api";
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
} from "../types/reports";
import type {
  Workflow,
  WorkflowSummary,
  WorkflowCreate,
  WorkflowUpdate,
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
  WorkflowAttachment,
} from "../types/workflow";
import type {
  AnomalyDetectionRequest,
  AnomalyReportResponse,
  AnomalySummaryResponse,
  AnomalyTrendRequest,
  AnomalyTrendResponse,
  BatchAnomalyDetectionRequest,
  BatchAnomalyDetectionResponse,
  IndustryBenchmarkRequest,
  IndustryBenchmarkResponse,
  AnomalyInvestigationRequest,
  AnomalyInvestigationResponse,
  AnomalyDashboardStats,
  AnomalyAlert,
  AnomalyDetectionConfiguration,
  AnomalyFilters,
  AnomalySearchResult,
  AnomalyExportRequest,
  AnomalyReportRequest,
  AnomalyDetectionResponse,
  AnomalyDetectionError,
  DetectedAnomaly,
} from "../types/anomaly-detection";
import type {
  AuditLog,
  EnhancedAuditLog,
  AuditFilters,
  AuditSearchResult,
  AuditTrailRequest,
  AuditTrailResponse,
  ForensicAnalysisRequest,
  ForensicAnalysisResponse,
  ComplianceReportRequest,
  ComplianceReportResponse,
  SecurityEvent,
  AuditDashboardStats,
  AuditActivity,
  AuditExportRequest,
  AuditReportRequest,
  InvestigationRequest,
  InvestigationResponse,
  AuditLogsResponse,
  AuditError,
} from "../types/audit";
import type {
  EPAFactor,
  EPACacheStatus,
  EPARefreshRequest,
  EPARefreshResponse,
  GHGRPFacility,
  GHGRPSearchRequest,
  GHGRPSearchResponse,
  EPAReportingRequirement,
  EPAReportingSchedule,
  EPAReportingSubmission,
  ValidationResult,
  EPADataAnalytics,
  EPAIntegrationConfig,
  EPADataImportRequest,
  EPADataImportResponse,
  EPAComplianceStatus,
  ComplianceViolation,
  EPADashboardStats,
  EPAActivity,
  EPAFilters,
  EPASearchResult,
  EPADataResponse,
  EPAError,
} from "../types/epa-integration";

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
  calculation_method: "location_based" | "market_based";
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
  report_type: "sec_10k" | "ghg_report" | "sustainability_report";
  company_id: string;
  reporting_year: number;
}

interface WorkflowRequest {
  title: string;
  description?: string;
  workflow_type: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
}

interface ConsolidationRequest {
  company_id: string;
  reporting_year: number;
  consolidation_method:
    | "ownership_based"
    | "operational_control"
    | "financial_control"
    | "equity_share";
}

interface LockUnlockRequest {
  reason: string;
  expires_at?: string;
}

interface WorkflowStatusUpdate {
  status:
    | "draft"
    | "pending"
    | "in_progress"
    | "completed"
    | "rejected"
    | "cancelled";
  reason?: string;
  comments?: string;
}

interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
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
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Determine authentication method based on endpoint
    const isLoginEndpoint = endpoint === "/auth/login";
    const isRegisterEndpoint = endpoint === "/auth/register";
    const isRefreshEndpoint = endpoint === "/auth/refresh";

    // Public auth endpoints (register, refresh) use Basic Auth in staging
    if (isRegisterEndpoint || isRefreshEndpoint) {
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
          console.log("Token expired, attempting refresh...");
          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.access_token) {
              console.log("Token refreshed successfully");
              // Update stored tokens
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "auth_token",
                  refreshResponse.access_token
                );
                if (refreshResponse.refresh_token) {
                  localStorage.setItem(
                    "refresh_token",
                    refreshResponse.refresh_token
                  );
                }
              }
              // Retry the original request with new token
              return this.request<T>(endpoint, options, true);
            }
          } catch (refreshError) {
            console.log("Token refresh failed:", refreshError);
            // Refresh failed, redirect to login
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }
            throw new Error("Session expired. Please login again.");
          }
        }

        if (response.status === 401) {
          // Token expired and refresh failed or this is a retry
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
          throw new Error("Authentication required");
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
      throw new Error("Network error occurred");
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("API Client - Login attempt to:", this.baseURL);
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async changePassword(
    data: PasswordChangeRequest
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
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
    return this.request<EPAFactor[]>(
      `/emissions/factors${query ? `?${query}` : ""}`
    );
  }

  async calculateScope1(
    data: Scope1CalculationRequest
  ): Promise<EmissionCalculation> {
    return this.request<EmissionCalculation>("/emissions/calculate/scope1", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async calculateScope2(
    data: Scope2CalculationRequest
  ): Promise<EmissionCalculation> {
    return this.request<EmissionCalculation>("/emissions/calculate/scope2", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async calculateScope3(data: {
    calculation_name: string;
    company_id: string;
    reporting_period_start: string;
    reporting_period_end: string;
    categories: Array<{
      category: string;
      activity_type: string;
      quantity: number;
      unit: string;
      emission_factor: number;
      data_quality: string;
      description?: string;
    }>;
  }): Promise<EmissionCalculation> {
    return this.request<EmissionCalculation>("/emissions/calculate/scope3", {
      method: "POST",
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
    return this.request(`/emissions/calculations${query ? `?${query}` : ""}`);
  }

  async getCompanyEmissionsSummary(companyId: string, year?: number) {
    const params = year ? `?reporting_year=${year}` : "";
    return this.request(`/emissions/companies/${companyId}/summary${params}`);
  }

  async getEmissionsCalculation(calculationId: string) {
    return this.request(`/emissions/calculations/${calculationId}`);
  }

  async getEmissionsValidation(params?: {
    calculation_id?: string;
    company_id?: string;
    validation_types?: string[];
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/emissions/validation${query ? `?${query}` : ""}`);
  }

  async getEmissionsAnalytics(params?: {
    company_id?: string;
    date_from?: string;
    date_to?: string;
    scope?: string[];
    aggregation?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/emissions/analytics${query ? `?${query}` : ""}`);
  }

  async getEmissionsTrends(params?: {
    company_id?: string;
    date_from?: string;
    date_to?: string;
    scope?: string[];
    comparison_period?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/emissions/trends${query ? `?${query}` : ""}`);
  }

  async getIndustryBenchmarks(params?: {
    industry?: string;
    company_size?: string;
    region?: string;
    scope?: string[];
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/emissions/benchmarks${query ? `?${query}` : ""}`);
  }

  async importEmissionsData(
    file: File,
    options?: {
      company_id?: string;
      data_format?: string;
      overwrite_existing?: boolean;
    }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.company_id) formData.append("company_id", options.company_id);
    if (options?.data_format)
      formData.append("data_format", options.data_format);
    if (options?.overwrite_existing)
      formData.append("overwrite_existing", "true");

    return this.request("/emissions/import", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async exportEmissionsData(data: {
    format: "csv" | "excel" | "json";
    company_id?: string;
    date_from?: string;
    date_to?: string;
    scope?: string[];
    include_validation?: boolean;
  }) {
    return this.request("/emissions/export", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Company Entities endpoints
  async getCompanyEntities(
    companyId: string,
    includeInactive = false
  ): Promise<CompanyEntity[]> {
    const params = includeInactive ? "?include_inactive=true" : "";
    return this.request<CompanyEntity[]>(
      `/entities/company/${companyId}${params}`
    );
  }

  async createEntity(data: EntityRequest): Promise<CompanyEntity> {
    return this.request<CompanyEntity>("/entities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEntity(
    entityId: string,
    data: Partial<EntityRequest>
  ): Promise<CompanyEntity> {
    return this.request<CompanyEntity>(`/entities/${entityId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEntity(entityId: string) {
    return this.request(`/entities/${entityId}`, {
      method: "DELETE",
    });
  }

  // Enhanced Reports Management endpoints
  async getReports(filters?: ReportsFilters): Promise<ReportsListResponse> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<ReportsListResponse>(
      `/reports${query ? `?${query}` : ""}`
    );
  }

  async getReport(reportId: string): Promise<EnhancedReport> {
    return this.request<EnhancedReport>(`/reports/${reportId}`);
  }

  async createReport(data: CreateReportRequest): Promise<EnhancedReport> {
    return this.request<EnhancedReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateReport(
    reportId: string,
    data: UpdateReportRequest
  ): Promise<EnhancedReport> {
    return this.request<EnhancedReport>(`/reports/${reportId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteReport(reportId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/reports/${reportId}`, {
      method: "DELETE",
    });
  }

  // Report Locking System
  async lockReport(
    reportId: string,
    data: LockReportRequest
  ): Promise<ReportLock> {
    return this.request<ReportLock>(`/reports/${reportId}/lock`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async unlockReport(
    reportId: string,
    data: UnlockReportRequest
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/reports/${reportId}/unlock`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getReportLockStatus(reportId: string): Promise<ReportLockStatus> {
    return this.request<ReportLockStatus>(`/reports/${reportId}/lock-status`);
  }

  async getReportLocks(reportId: string): Promise<ReportLock[]> {
    return this.request<ReportLock[]>(`/reports/${reportId}/locks`);
  }

  // Comments System
  async addCommentToReport(
    reportId: string,
    data: CommentCreate
  ): Promise<CommentResponse> {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("comment_type", data.comment_type || "comment");
    if (data.parent_id) formData.append("parent_id", data.parent_id);
    if (data.mentions)
      formData.append("mentions", JSON.stringify(data.mentions));
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<CommentResponse>(`/reports/${reportId}/comments`, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getReportComments(
    reportId: string,
    parentId?: string
  ): Promise<ReportCommentList> {
    const params = parentId ? `?parent_id=${parentId}` : "";
    return this.request<ReportCommentList>(
      `/reports/${reportId}/comments${params}`
    );
  }

  async resolveReportComment(
    reportId: string,
    commentId: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/reports/${reportId}/comments/${commentId}/resolve`,
      {
        method: "PUT",
      }
    );
  }

  async deleteReportComment(
    reportId: string,
    commentId: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/reports/${reportId}/comments/${commentId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Revisions System
  async createReportRevision(
    reportId: string,
    data: {
      change_type: string;
      changes_summary: string;
      previous_values?: Record<string, unknown>;
      new_values?: Record<string, unknown>;
    }
  ): Promise<RevisionResponse> {
    return this.request<RevisionResponse>(`/reports/${reportId}/revisions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getReportRevisions(reportId: string): Promise<ReportRevisionList> {
    return this.request<ReportRevisionList>(`/reports/${reportId}/revisions`);
  }

  // Dashboard and Analytics
  async getReportsDashboardStats(): Promise<ReportsDashboardStats> {
    return this.request<ReportsDashboardStats>("/reports/dashboard/stats");
  }

  async getReportActivity(
    reportId?: string,
    limit = 20
  ): Promise<ReportActivity[]> {
    const params = reportId
      ? `?report_id=${reportId}&limit=${limit}`
      : `?limit=${limit}`;
    return this.request<ReportActivity[]>(`/reports/activity${params}`);
  }

  // Notifications
  async getReportNotifications(
    unreadOnly = false
  ): Promise<ReportNotification[]> {
    const params = unreadOnly ? "?unread_only=true" : "";
    return this.request<ReportNotification[]>(
      `/reports/notifications${params}`
    );
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/reports/notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    );
  }

  // Permissions
  async getReportPermissions(reportId: string): Promise<ReportPermissions> {
    return this.request<ReportPermissions>(`/reports/${reportId}/permissions`);
  }

  // Bulk Operations
  async bulkOperation(data: BulkReportOperation): Promise<BulkOperationResult> {
    return this.request<BulkOperationResult>("/reports/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Search
  async searchReports(
    query: string,
    filters?: ReportsFilters
  ): Promise<ReportsListResponse> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return this.request<ReportsListResponse>(
      `/reports/search?${searchParams.toString()}`
    );
  }

  // Export/Import
  async exportReports(data: {
    report_ids: string[];
    format: "pdf" | "excel" | "csv" | "json";
    include_comments?: boolean;
    include_revisions?: boolean;
  }): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/reports/export",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async importReports(
    file: File,
    options?: {
      report_type?: string;
      company_id?: string;
      overwrite_existing?: boolean;
    }
  ): Promise<{ success: boolean; imported_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.report_type)
      formData.append("report_type", options.report_type);
    if (options?.company_id) formData.append("company_id", options.company_id);
    if (options?.overwrite_existing)
      formData.append("overwrite_existing", "true");

    return this.request<{
      success: boolean;
      imported_count: number;
      errors: string[];
    }>("/reports/import", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  // Enhanced Workflow Management endpoints
  async getWorkflows(filters?: WorkflowFilters): Promise<WorkflowListResponse> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<WorkflowListResponse>(
      `/workflow${query ? `?${query}` : ""}`
    );
  }

  async getWorkflow(workflowId: string): Promise<Workflow> {
    return this.request<Workflow>(`/workflow/${workflowId}`);
  }

  async createWorkflow(data: WorkflowCreate): Promise<Workflow> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("workflow_type", data.workflow_type);
    formData.append("priority", data.priority);
    if (data.description) formData.append("description", data.description);
    if (data.due_date) formData.append("due_date", data.due_date);
    if (data.assigned_users)
      formData.append("assigned_users", JSON.stringify(data.assigned_users));
    if (data.stages) formData.append("stages", JSON.stringify(data.stages));
    if (data.metadata)
      formData.append("metadata", JSON.stringify(data.metadata));
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<Workflow>("/workflow", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async updateWorkflow(
    workflowId: string,
    data: WorkflowUpdate
  ): Promise<Workflow> {
    return this.request<Workflow>(`/workflow/${workflowId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(workflowId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/workflow/${workflowId}`, {
      method: "DELETE",
    });
  }

  async submitWorkflow(workflowId: string): Promise<{
    message: string;
    workflow_id: string;
    status: string;
    next_approvers: string[];
    submitted_at: string;
  }> {
    return this.request(`/workflow/${workflowId}/submit`, {
      method: "POST",
    });
  }

  async approveWorkflow(
    workflowId: string,
    data: ApprovalRequest
  ): Promise<ApprovalResponse> {
    const formData = new FormData();
    formData.append("decision", data.decision);
    if (data.comments) formData.append("comments", data.comments);
    if (data.escalation_reason)
      formData.append("escalation_reason", data.escalation_reason);
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<ApprovalResponse>(`/workflow/${workflowId}/approve`, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async updateWorkflowStatus(
    workflowId: string,
    data: WorkflowStatusUpdate
  ): Promise<{
    message: string;
    workflow_id: string;
    previous_status: string;
    new_status: string;
    updated_by: string;
    updated_at: string;
  }> {
    return this.request(`/workflow/${workflowId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getWorkflowApprovers(workflowId: string): Promise<WorkflowApprover[]> {
    return this.request<WorkflowApprover[]>(
      `/workflow/${workflowId}/approvers`
    );
  }

  async getWorkflowStages(workflowId: string): Promise<WorkflowStage[]> {
    return this.request<WorkflowStage[]>(`/workflow/${workflowId}/stages`);
  }

  async getPendingApprovals(): Promise<{
    total_pending: number;
    workflows: WorkflowSummary[];
  }> {
    return this.request("/workflow/pending-approvals");
  }

  async escalateWorkflow(
    workflowId: string,
    data: {
      reason: string;
      priority_increase?: string;
    }
  ): Promise<{
    message: string;
    workflow_id: string;
    new_priority: string;
    escalated_at: string;
    escalation_reason: string;
  }> {
    return this.request(`/workflow/${workflowId}/escalate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getWorkflowApprovals(workflowId: string): Promise<{
    workflow_id: string;
    total_approvals: number;
    approvals: Array<{
      stage: number;
      approver_id: string;
      approver_name?: string;
      decision: string;
      comments?: string;
      approved_at: string;
      attachments?: WorkflowAttachment[];
    }>;
  }> {
    return this.request(`/workflow/${workflowId}/approvals`);
  }

  // Workflow Comments
  async addCommentToWorkflow(
    workflowId: string,
    data: WorkflowCommentCreate
  ): Promise<WorkflowComment> {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("comment_type", data.comment_type || "comment");
    formData.append("is_internal", String(data.is_internal || false));
    if (data.stage) formData.append("stage", String(data.stage));
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<WorkflowComment>(`/workflow/${workflowId}/comments`, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async getWorkflowComments(
    workflowId: string,
    stage?: number
  ): Promise<WorkflowComment[]> {
    const params = stage ? `?stage=${stage}` : "";
    return this.request<WorkflowComment[]>(
      `/workflow/${workflowId}/comments${params}`
    );
  }

  // Dashboard and Analytics
  async getWorkflowDashboardStats(): Promise<WorkflowDashboardStats> {
    return this.request<WorkflowDashboardStats>("/workflow/dashboard/stats");
  }

  async getWorkflowActivity(
    workflowId?: string,
    limit = 20
  ): Promise<WorkflowActivity[]> {
    const params = workflowId
      ? `?workflow_id=${workflowId}&limit=${limit}`
      : `?limit=${limit}`;
    return this.request<WorkflowActivity[]>(`/workflow/activity${params}`);
  }

  // Notifications
  async getWorkflowNotifications(
    unreadOnly = false
  ): Promise<WorkflowNotification[]> {
    const params = unreadOnly ? "?unread_only=true" : "";
    return this.request<WorkflowNotification[]>(
      `/workflow/notifications${params}`
    );
  }

  async markWorkflowNotificationAsRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/workflow/notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    );
  }

  // Templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return this.request<WorkflowTemplate[]>("/workflow/templates");
  }

  async createWorkflowFromTemplate(
    templateId: string,
    data: Partial<WorkflowCreate>
  ): Promise<Workflow> {
    return this.request<Workflow>("/workflow/from-template", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, ...data }),
    });
  }

  // Configuration
  async getWorkflowConfiguration(): Promise<WorkflowConfiguration> {
    return this.request<WorkflowConfiguration>("/workflow/configuration");
  }

  async updateWorkflowConfiguration(
    data: Partial<WorkflowConfiguration>
  ): Promise<WorkflowConfiguration> {
    return this.request<WorkflowConfiguration>("/workflow/configuration", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Bulk Operations
  async bulkWorkflowOperation(
    data: BulkWorkflowOperation
  ): Promise<BulkWorkflowOperationResult> {
    return this.request<BulkWorkflowOperationResult>("/workflow/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Search
  async searchWorkflows(
    query: string,
    filters?: WorkflowFilters
  ): Promise<WorkflowListResponse> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return this.request<WorkflowListResponse>(
      `/workflow/search?${searchParams.toString()}`
    );
  }

  // Enhanced Anomaly Detection endpoints
  async detectAnomalies(
    data: AnomalyDetectionRequest
  ): Promise<AnomalyReportResponse> {
    return this.request<AnomalyReportResponse>("/anomaly-detection/detect", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAnomalySummary(
    companyId: string,
    reportingYear: number
  ): Promise<AnomalySummaryResponse> {
    return this.request<AnomalySummaryResponse>(
      `/anomaly-detection/summary/${companyId}/${reportingYear}`
    );
  }

  async analyzeAnomalyTrends(
    data: AnomalyTrendRequest
  ): Promise<AnomalyTrendResponse> {
    return this.request<AnomalyTrendResponse>("/anomaly-detection/trends", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async batchDetectAnomalies(
    data: BatchAnomalyDetectionRequest
  ): Promise<BatchAnomalyDetectionResponse> {
    return this.request<BatchAnomalyDetectionResponse>(
      "/anomaly-detection/batch-detect",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async compareIndustryBenchmarks(
    data: IndustryBenchmarkRequest
  ): Promise<IndustryBenchmarkResponse> {
    return this.request<IndustryBenchmarkResponse>(
      "/anomaly-detection/industry-benchmark",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async investigateAnomaly(
    data: AnomalyInvestigationRequest
  ): Promise<AnomalyInvestigationResponse> {
    return this.request<AnomalyInvestigationResponse>(
      "/anomaly-detection/investigate",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getAnomalyDashboardStats(): Promise<AnomalyDashboardStats> {
    return this.request<AnomalyDashboardStats>(
      "/anomaly-detection/dashboard/stats"
    );
  }

  async getAnomalyAlerts(unreadOnly = false): Promise<AnomalyAlert[]> {
    const params = unreadOnly ? "?unread_only=true" : "";
    return this.request<AnomalyAlert[]>(`/anomaly-detection/alerts${params}`);
  }

  async markAnomalyAlertAsRead(alertId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/anomaly-detection/alerts/${alertId}/read`,
      {
        method: "PUT",
      }
    );
  }

  async getAnomalyDetectionConfiguration(): Promise<AnomalyDetectionConfiguration> {
    return this.request<AnomalyDetectionConfiguration>(
      "/anomaly-detection/configuration"
    );
  }

  async updateAnomalyDetectionConfiguration(
    data: Partial<AnomalyDetectionConfiguration>
  ): Promise<AnomalyDetectionConfiguration> {
    return this.request<AnomalyDetectionConfiguration>(
      "/anomaly-detection/configuration",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async searchAnomalies(
    query: string,
    filters?: AnomalyFilters
  ): Promise<AnomalySearchResult> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return this.request<AnomalySearchResult>(
      `/anomaly-detection/search?${searchParams.toString()}`
    );
  }

  async exportAnomalies(
    data: AnomalyExportRequest
  ): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/anomaly-detection/export",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async generateAnomalyReport(
    data: AnomalyReportRequest
  ): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/anomaly-detection/report",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getAnomalyById(anomalyId: string): Promise<DetectedAnomaly> {
    return this.request<DetectedAnomaly>(
      `/anomaly-detection/anomaly/${anomalyId}`
    );
  }

  async resolveAnomaly(
    anomalyId: string,
    data: {
      resolution: string;
      action_taken: string;
      preventive_measures?: string[];
    }
  ): Promise<{ success: boolean; resolution_id: string }> {
    return this.request<{ success: boolean; resolution_id: string }>(
      `/anomaly-detection/anomaly/${anomalyId}/resolve`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async dismissAnomaly(
    anomalyId: string,
    reason: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/anomaly-detection/anomaly/${anomalyId}/dismiss`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  }

  // Enhanced Audit System endpoints
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<AuditLogsResponse>(
      `/audit/logs${query ? `?${query}` : ""}`
    );
  }

  async getEnhancedAuditLogs(
    filters?: AuditFilters
  ): Promise<AuditLogsResponse> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<AuditLogsResponse>(
      `/enhanced-audit/logs${query ? `?${query}` : ""}`
    );
  }

  async getAuditTrail(data: AuditTrailRequest): Promise<AuditTrailResponse> {
    return this.request<AuditTrailResponse>("/audit/trail", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async performForensicAnalysis(
    data: ForensicAnalysisRequest
  ): Promise<ForensicAnalysisResponse> {
    return this.request<ForensicAnalysisResponse>("/audit/forensic-analysis", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateComplianceReport(
    data: ComplianceReportRequest
  ): Promise<ComplianceReportResponse> {
    return this.request<ComplianceReportResponse>("/audit/compliance-report", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSecurityEvents(filters?: {
    severity?: string[];
    event_type?: string[];
    company_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<SecurityEvent[]> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<SecurityEvent[]>(
      `/audit/security-events${query ? `?${query}` : ""}`
    );
  }

  async getAuditDashboardStats(): Promise<AuditDashboardStats> {
    return this.request<AuditDashboardStats>("/audit/dashboard/stats");
  }

  async getAuditActivity(limit = 50): Promise<AuditActivity[]> {
    return this.request<AuditActivity[]>(`/audit/activity?limit=${limit}`);
  }

  async searchAuditLogs(
    query: string,
    filters?: AuditFilters
  ): Promise<AuditSearchResult> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return this.request<AuditSearchResult>(
      `/audit/search?${searchParams.toString()}`
    );
  }

  async exportAuditLogs(
    data: AuditExportRequest
  ): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/audit/export",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async generateAuditReport(
    data: AuditReportRequest
  ): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/audit/report",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async createInvestigation(
    data: InvestigationRequest
  ): Promise<InvestigationResponse> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("priority", data.priority);
    formData.append("assigned_to", JSON.stringify(data.assigned_to));
    formData.append("scope", JSON.stringify(data.scope));
    if (data.initial_findings)
      formData.append("initial_findings", data.initial_findings);
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<InvestigationResponse>("/audit/investigation", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async getInvestigations(filters?: {
    status?: string[];
    priority?: string[];
    assigned_to?: string;
    company_id?: string;
  }): Promise<InvestigationResponse[]> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<InvestigationResponse[]>(
      `/audit/investigations${query ? `?${query}` : ""}`
    );
  }

  async updateInvestigation(
    investigationId: string,
    data: Partial<InvestigationRequest>
  ): Promise<InvestigationResponse> {
    return this.request<InvestigationResponse>(
      `/audit/investigation/${investigationId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async closeInvestigation(
    investigationId: string,
    data: {
      findings: string;
      recommendations: string[];
      evidence: string[];
    }
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/audit/investigation/${investigationId}/close`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getAuditLogById(logId: string): Promise<AuditLog> {
    return this.request<AuditLog>(`/audit/logs/${logId}`);
  }

  async getEnhancedAuditLogById(logId: string): Promise<EnhancedAuditLog> {
    return this.request<EnhancedAuditLog>(`/enhanced-audit/logs/${logId}`);
  }

  async archiveAuditLogs(
    olderThan: string
  ): Promise<{ archived_count: number; message: string }> {
    return this.request<{ archived_count: number; message: string }>(
      "/audit/archive",
      {
        method: "POST",
        body: JSON.stringify({ older_than: olderThan }),
      }
    );
  }

  async getAuditRetentionPolicy(): Promise<{
    default_retention: string;
    category_retention: Record<string, string>;
    compliance_requirements: string[];
  }> {
    return this.request("/audit/retention-policy");
  }

  async updateAuditRetentionPolicy(data: {
    default_retention: string;
    category_retention: Record<string, string>;
  }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      "/audit/retention-policy",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Enhanced Workflow Management endpoints (replacing old basic methods)

  // EPA Integration endpoints
  async getEPACacheStatus(): Promise<EPACacheStatus> {
    return this.request<EPACacheStatus>("/epa/cache/status");
  }

  async refreshEPAData(data?: EPARefreshRequest): Promise<EPARefreshResponse> {
    return this.request<EPARefreshResponse>("/epa/refresh", {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  }

  async searchGHGRPFacilities(
    data: GHGRPSearchRequest
  ): Promise<GHGRPSearchResponse> {
    return this.request<GHGRPSearchResponse>("/epa/ghgrp/search", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getGHGRPFacility(facilityId: string): Promise<GHGRPFacility> {
    return this.request<GHGRPFacility>(`/epa/ghgrp/facility/${facilityId}`);
  }

  async getEPADashboardStats(): Promise<EPADashboardStats> {
    return this.request<EPADashboardStats>("/epa/dashboard/stats");
  }

  async getEPAReportingSchedule(
    companyId?: string
  ): Promise<EPAReportingSchedule[]> {
    const params = companyId ? `?company_id=${companyId}` : "";
    return this.request<EPAReportingSchedule[]>(
      `/epa/reporting/schedule${params}`
    );
  }

  async createEPAReportingSubmission(data: {
    schedule_id: string;
    submission_data: Record<string, unknown>;
    attachments?: File[];
  }): Promise<EPAReportingSubmission> {
    const formData = new FormData();
    formData.append("schedule_id", data.schedule_id);
    formData.append("submission_data", JSON.stringify(data.submission_data));
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request<EPAReportingSubmission>("/epa/reporting/submit", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async getEPAComplianceStatus(
    companyId: string
  ): Promise<EPAComplianceStatus> {
    return this.request<EPAComplianceStatus>(`/epa/compliance/${companyId}`);
  }

  async importEPAData(
    data: EPADataImportRequest
  ): Promise<EPADataImportResponse> {
    const formData = new FormData();
    formData.append("source", data.source);
    if (data.file) formData.append("file", data.file);
    if (data.api_endpoint) formData.append("api_endpoint", data.api_endpoint);
    if (data.parameters)
      formData.append("parameters", JSON.stringify(data.parameters));
    if (data.mapping_rules)
      formData.append("mapping_rules", JSON.stringify(data.mapping_rules));
    if (data.validation_rules)
      formData.append(
        "validation_rules",
        JSON.stringify(data.validation_rules)
      );
    if (data.overwrite_existing) formData.append("overwrite_existing", "true");

    return this.request<EPADataImportResponse>("/epa/import", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async exportEPAData(data: {
    format: "csv" | "excel" | "json";
    facilities?: string[];
    date_range?: { start: string; end: string };
    include_emissions?: boolean;
  }): Promise<{ download_url: string; expires_at: string }> {
    return this.request<{ download_url: string; expires_at: string }>(
      "/epa/export",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getEPAReportingRequirements(): Promise<EPAReportingRequirement[]> {
    return this.request<EPAReportingRequirement[]>(
      "/epa/reporting/requirements"
    );
  }

  async getEPAIntegrationConfig(): Promise<EPAIntegrationConfig> {
    return this.request<EPAIntegrationConfig>("/epa/configuration");
  }

  async updateEPAIntegrationConfig(
    data: Partial<EPAIntegrationConfig>
  ): Promise<EPAIntegrationConfig> {
    return this.request<EPAIntegrationConfig>("/epa/configuration", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Enhanced Emissions Management endpoints
  
  // Validation endpoints
  async getValidationMetrics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ValidationMetrics> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const query = searchParams.toString();
    return this.request<ValidationMetrics>(`/epa/ghgrp/validation-metrics${query ? `?${query}` : ''}`);
  }

  // Calculation management endpoints
  async getCalculations(params?: {
    company_id?: string;
    scope?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CalculationSummary[]> {
    const searchParams = new URLSearchParams();
    if (params?.company_id) searchParams.append('company_id', params.company_id);
    if (params?.scope) searchParams.append('scope', params.scope);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<CalculationSummary[]>(`/emissions/calculations${query ? `?${query}` : ''}`);
  }

  async getCalculation(calculationId: string): Promise<EmissionsCalculationResponse> {
    return this.request<EmissionsCalculationResponse>(`/emissions/calculations/${calculationId}`);
  }

  async approveCalculation(calculationId: string, data: {
    decision: 'approve' | 'reject';
    comments?: string;
    conditions?: string[];
  }): Promise<void> {
    return this.request<void>(`/emissions/calculations/${calculationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCalculationAuditTrail(calculationId: string): Promise<CalculationAuditTrailResponse[]> {
    return this.request<CalculationAuditTrailResponse[]>(`/emissions/calculations/${calculationId}/audit-trail`);
  }

  // EPA factors endpoints
  async getEPAFactors(params?: {
    source?: string;
    category?: string;
    fuel_type?: string;
    electricity_region?: string;
    force_refresh?: boolean;
  }): Promise<EmissionFactorResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.source) searchParams.append('source', params.source);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.fuel_type) searchParams.append('fuel_type', params.fuel_type);
    if (params?.electricity_region) searchParams.append('electricity_region', params.electricity_region);
    if (params?.force_refresh) searchParams.append('force_refresh', params.force_refresh.toString());
    
    const query = searchParams.toString();
    return this.request<EmissionFactorResponse[]>(`/epa/factors${query ? `?${query}` : ''}`);
  }

  async getEPAFactorByCode(factorCode: string, params?: {
    version?: string;
    force_refresh?: boolean;
  }): Promise<EmissionFactorResponse> {
    const searchParams = new URLSearchParams();
    if (params?.version) searchParams.append('version', params.version);
    if (params?.force_refresh) searchParams.append('force_refresh', params.force_refresh.toString());
    
    const query = searchParams.toString();
    return this.request<EmissionFactorResponse>(`/epa/factors/${factorCode}${query ? `?${query}` : ''}`);
  }

  // Company emissions summary endpoints
  async getCompanyEmissionsSummary(companyId: string, params?: {
    reporting_year?: number;
  }): Promise<CompanyEmissionsSummary> {
    const searchParams = new URLSearchParams();
    if (params?.reporting_year) searchParams.append('reporting_year', params.reporting_year.toString());
    
    const query = searchParams.toString();
    return this.request<CompanyEmissionsSummary>(`/emissions/companies/${companyId}/summary${query ? `?${query}` : ''}`);
  }

  async getCompanyAuditSummary(companyId: string, params?: {
    reporting_year?: number;
  }): Promise<CompanyEmissionsSummary> {
    const searchParams = new URLSearchParams();
    if (params?.reporting_year) searchParams.append('reporting_year', params.reporting_year.toString());
    
    const query = searchParams.toString();
    return this.request<CompanyEmissionsSummary>(`/emissions/companies/${companyId}/audit-summary${query ? `?${query}` : ''}`);
  }

  async getConsolidatedEmissionsSummary(companyId: string, reportingYear: number): Promise<CompanyEmissionsSummary> {
    return this.request<CompanyEmissionsSummary>(`/emissions/companies/${companyId}/consolidated-summary?reporting_year=${reportingYear}`);
  }

  async getEntitiesWithEmissions(companyId: string, params: {
    reporting_year: number;
    include_consolidated?: boolean;
  }): Promise<CompanyEntity[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('reporting_year', params.reporting_year.toString());
    if (params.include_consolidated) searchParams.append('include_consolidated', params.include_consolidated.toString());
    
    return this.request<CompanyEntity[]>(`/emissions/companies/${companyId}/entities-with-emissions?${searchParams.toString()}`);
  }

  async triggerConsolidation(companyId: string, params: {
    reporting_year: number;
    consolidation_method?: string;
    include_scope3?: boolean;
  }): Promise<Consolidation> {
    const searchParams = new URLSearchParams();
    searchParams.append('reporting_year', params.reporting_year.toString());
    if (params.consolidation_method) searchParams.append('consolidation_method', params.consolidation_method);
    if (params.include_scope3) searchParams.append('include_scope3', params.include_scope3.toString());
    
    return this.request<Consolidation>(`/emissions/companies/${companyId}/trigger-consolidation?${searchParams.toString()}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new APIClient();
