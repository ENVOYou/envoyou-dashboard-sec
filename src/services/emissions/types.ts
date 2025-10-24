/**
 * Service Interface Types for Enhanced Emissions Management
 */

import type {
  ValidationResult,
  ValidationMetrics,
  EmissionsCalculationResponse,
  CalculationSummary,
  CalculationApprovalRequest,
  CalculationAuditTrailResponse,
  Scope1CalculationRequest,
  Scope2CalculationRequest,
  EmissionFactorResponse,
  ImportJob,
  ExportJob,
  ImportOptions,
  ExportCriteria,
  TrendAnalysis,
  PerformanceMetrics,
  CompanyEmissionsSummary,
  CrossValidationResult,
  BenchmarkResult,
  EmissionsData
} from '@/types/emissions';

// Validation Engine Interface
export interface ValidationEngineInterface {
  validateEmissionsData(data: Scope1CalculationRequest | Scope2CalculationRequest): Promise<ValidationResult>;
  validateBulkData(data: (Scope1CalculationRequest | Scope2CalculationRequest)[]): Promise<ValidationResult[]>;
  getValidationMetrics(startDate?: Date, endDate?: Date): Promise<ValidationMetrics>;
  calculateDataQualityScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number;
}

// Calculation Engine Interface
export interface CalculationEngineInterface {
  calculateScope1Emissions(data: Scope1CalculationRequest): Promise<EmissionsCalculationResponse>;
  calculateScope2Emissions(data: Scope2CalculationRequest): Promise<EmissionsCalculationResponse>;
  getCalculations(filters?: CalculationFilters): Promise<CalculationSummary[]>;
  getCalculation(calculationId: string): Promise<EmissionsCalculationResponse>;
  approveCalculation(calculationId: string, approval: CalculationApprovalRequest): Promise<void>;
  getAuditTrail(calculationId: string): Promise<CalculationAuditTrailResponse[]>;
  getEmissionFactors(filters?: FactorFilters): Promise<EmissionFactorResponse[]>;
}

// Import/Export Manager Interface
export interface ImportExportManagerInterface {
  importData(file: File, format: string, options: ImportOptions): Promise<ImportJob>;
  exportData(criteria: ExportCriteria, format: string): Promise<ExportJob>;
  getImportTemplate(scope: string): Promise<Blob>;
  validateImportFile(file: File): Promise<ValidationResult>;
  processImportInBatches(data: EmissionsData[], batchSize: number): Promise<BatchProcessResult>;
  pauseImport(jobId: string): Promise<void>;
  resumeImport(jobId: string): Promise<void>;
  cancelImport(jobId: string): Promise<void>;
}

// Analytics Engine Interface
export interface AnalyticsEngineInterface {
  getCompanySummary(companyId: string, reportingYear?: number): Promise<CompanyEmissionsSummary>;
  getConsolidatedSummary(companyId: string, reportingYear: number): Promise<CompanyEmissionsSummary>;
  getTrendAnalysis(companyId: string, yearRange: number[]): Promise<TrendAnalysis>;
  getVarianceAnalysis(companyId: string, periods: Period[]): Promise<VarianceAnalysisResult>;
  getPerformanceMetrics(companyId: string, targets?: PerformanceTarget[]): Promise<PerformanceMetrics>;
  generateInsights(summaryData: CompanyEmissionsSummary[]): Promise<EmissionsInsight[]>;
}

// Cross-Validation Service Interface
export interface CrossValidationServiceInterface {
  validateAgainstEPA(calculationId: string): Promise<CrossValidationResult>;
  validateAgainstHistoricalData(companyId: string, currentData: EmissionsData): Promise<HistoricalValidationResult>;
  getValidationMetrics(startDate?: Date, endDate?: Date): Promise<ValidationMetrics>;
  calculateIndustryBenchmark(data: EmissionsData, industry: string): Promise<BenchmarkResult>;
}

// Supporting Types
export interface CalculationFilters {
  company_id?: string;
  scope?: 'scope_1' | 'scope_2';
  status?: 'draft' | 'completed' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

export interface FactorFilters {
  category?: string;
  fuel_type?: string;
  electricity_region?: string;
  source?: string;
}

export interface BatchProcessResult {
  totalBatches: number;
  successfulBatches: number;
  failedBatches: number;
  errors: ProcessingError[];
  results: ProcessingResult[];
}

export interface Period {
  startDate: string;
  endDate: string;
  label: string;
}

// Additional supporting types
export interface VarianceAnalysisResult {
  companyId: string;
  periods: Period[];
  variances: {
    scope1: number;
    scope2: number;
    scope3?: number;
    total: number;
  };
  analysis: string;
  recommendations: string[];
}

export interface PerformanceTarget {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

export interface EmissionsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
}

export interface HistoricalValidationResult {
  isValid: boolean;
  deviations: {
    field: string;
    currentValue: number;
    historicalAverage: number;
    deviation: number;
    significance: 'high' | 'medium' | 'low';
  }[];
  recommendations: string[];
  confidence: number;
}

export interface ProcessingError {
  batchId: string;
  rowIndex?: number;
  errorCode: string;
  message: string;
  field?: string;
  value?: unknown;
}

export interface ProcessingResult {
  batchId: string;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  warnings: string[];
  data: Record<string, unknown>;
}