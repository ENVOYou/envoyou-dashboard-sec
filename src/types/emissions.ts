/**
 * Enhanced Emissions Management Types
 * TypeScript interfaces for enhanced emissions functionality
 */

// Generic emissions data type for validation
export interface EmissionsData {
  calculation_name?: string;
  company_id?: string;
  entity_id?: string;
  reporting_period?: {
    start_date: string;
    end_date: string;
    reporting_year: number;
  };
  fuel_data?: FuelData[];
  electricity_data?: ElectricityData[];
  process_data?: ProcessData[];
  fugitive_data?: FugitiveData[];
  methodology?: 'location_based' | 'market_based';
  renewable_percentage?: number;
  calculation_metadata?: CalculationMetadata;
}

// Backend API Response Types (matching existing schema)
export interface Scope1CalculationRequest {
  calculation_name: string; // Required field from backend schema
  company_id: string;
  entity_id?: string;
  reporting_period: {
    start_date: string;
    end_date: string;
    reporting_year: number;
  };
  fuel_data: FuelData[];
  process_data?: ProcessData[];
  fugitive_data?: FugitiveData[];
  calculation_metadata?: CalculationMetadata;
}

export interface Scope2CalculationRequest {
  calculation_name: string; // Required field from backend schema
  company_id: string;
  entity_id?: string;
  reporting_period: {
    start_date: string;
    end_date: string;
    reporting_year: number;
  };
  electricity_data: ElectricityData[];
  methodology: 'location_based' | 'market_based';
  renewable_percentage?: number;
  calculation_metadata?: CalculationMetadata;
}

export interface EmissionsCalculationResponse {
  calculation_id: string;
  company_id: string;
  entity_id?: string;
  scope: 'scope_1' | 'scope_2';
  total_co2e: number;
  total_co2?: number;
  total_ch4?: number;
  total_n2o?: number;
  data_quality_score: number;
  calculation_details: CalculationDetail[];
  epa_factors_used: EPAFactorUsed[];
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
}

export interface FuelData {
  fuel_type: string;
  amount: number;
  unit: string;
  heating_value?: number;
  carbon_content?: number;
  source_description?: string;
}

export interface ElectricityData {
  amount: number;
  unit: string;
  region?: string;
  supplier?: string;
  renewable_percentage?: number;
  source_description?: string;
}

export interface ProcessData {
  process_type: string;
  amount: number;
  unit: string;
  emission_factor?: number;
  source_description?: string;
}

export interface FugitiveData {
  source_type: string;
  amount: number;
  unit: string;
  emission_factor?: number;
  source_description?: string;
}

export interface CalculationMetadata {
  calculation_name?: string;
  description?: string;
  methodology_notes?: string;
  data_sources?: string[];
  uncertainty_notes?: string;
}

export interface CalculationDetail {
  source_category: string;
  activity_data: number;
  activity_unit: string;
  emission_factor: number;
  factor_unit: string;
  co2e_emissions: number;
  uncertainty?: number;
}

export interface EPAFactorUsed {
  factor_code: string;
  factor_name: string;
  factor_value: number;
  factor_unit: string;
  source: string;
  version: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number;
  recommendations: string[];
  validatedAt: Date;
}

export interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: 'critical' | 'major' | 'minor';
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  suggestion?: string;
}

export interface ValidationMetrics {
  total_validations: number;
  success_rate: number;
  average_quality_score: number;
  common_errors: ValidationErrorSummary[];
  quality_trends: QualityTrend[];
}

export interface ValidationErrorSummary {
  error_code: string;
  error_message: string;
  frequency: number;
  percentage: number;
}

export interface QualityTrend {
  date: string;
  average_score: number;
  validation_count: number;
}

// Import/Export Types
export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  currentBatch: number;
  totalBatches: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  startTime: Date;
  estimatedCompletion?: Date;
  canPause: boolean;
  canResume: boolean;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ImportOptions {
  batchSize: number;
  delayBetweenBatches: number;
  maxRetries: number;
  enablePersistence: boolean;
  validateBeforeSubmit: boolean;
}

export interface ExportCriteria {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  scopes: ('scope_1' | 'scope_2' | 'scope_3')[];
  entities: string[];
  includeCalculations: boolean;
  includeValidation: boolean;
  includeAuditTrail: boolean;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  format: 'csv' | 'excel' | 'json' | 'pdf';
  downloadUrl?: string;
  startTime: Date;
  completedTime?: Date;
}

// Analytics Types
export interface TrendAnalysis {
  trends: EmissionTrend[];
  projections: EmissionProjection[];
  seasonality: SeasonalPattern[];
  anomalies: EmissionAnomaly[];
  correlations: EmissionCorrelation[];
}

export interface EmissionTrend {
  period: string;
  scope1: number;
  scope2: number;
  scope3?: number;
  total: number;
  target?: number;
  variance?: number;
  changePercent?: number;
}

export interface EmissionProjection {
  period: string;
  projectedEmissions: number;
  confidence: number;
  methodology: string;
}

export interface SeasonalPattern {
  month: number;
  averageEmissions: number;
  variance: number;
}

export interface EmissionAnomaly {
  date: string;
  actualValue: number;
  expectedValue: number;
  variance: number;
  severity: 'low' | 'medium' | 'high';
  explanation?: string;
}

export interface EmissionCorrelation {
  factor: string;
  correlation: number;
  significance: number;
}

export interface PerformanceMetrics {
  targetProgress: TargetProgress[];
  reductionRate: number;
  efficiency: EfficiencyMetric[];
  carbonIntensity: number;
}

export interface TargetProgress {
  targetId: string;
  targetName: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  onTrack: boolean;
  projectedCompletion?: Date;
}

export interface EfficiencyMetric {
  metric: string;
  value: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  benchmarkComparison?: number;
}

// Cross-Validation Types
export interface CrossValidationResult {
  source: string;
  confidence: number;
  variance: number;
  discrepancies: Discrepancy[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface Discrepancy {
  field: string;
  inputValue: number;
  referenceValue: number;
  variance: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface BenchmarkResult {
  industryAverage: number;
  percentile: number;
  comparison: 'above' | 'below' | 'within';
  variance: number;
  peerComparisons: PeerComparison[];
}

export interface PeerComparison {
  companyName: string;
  emissions: number;
  variance: number;
  isAnonymized: boolean;
}

// Company Summary Types (from existing backend)
export interface CompanyEmissionsSummary {
  company_id: string;
  reporting_year: number;
  total_scope1_co2e: number;
  total_scope2_co2e: number;
  total_scope3_co2e?: number;
  total_co2e: number;
  data_quality_score: number;
  entity_count: number;
  calculation_count: number;
  last_updated: string;
}

// Calculation Summary Types (from existing backend)
export interface CalculationSummary {
  calculation_id: string;
  company_id: string;
  entity_id?: string;
  scope: 'scope_1' | 'scope_2';
  total_co2e: number;
  data_quality_score: number;
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  created_at: string;
  created_by: string;
}

// Approval Types
export interface CalculationApprovalRequest {
  decision: 'approve' | 'reject';
  comments?: string;
  conditions?: string[];
}

export interface CalculationAuditTrailResponse {
  event_id: string;
  calculation_id: string;
  event_type: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  details: Record<string, unknown>;
  ip_address?: string;
}

// Emission Factor Types (from existing backend)
export interface EmissionFactorResponse {
  factor_code: string;
  factor_name: string;
  category: string;
  fuel_type?: string;
  electricity_region?: string;
  co2_factor: number;
  ch4_factor?: number;
  n2o_factor?: number;
  co2e_factor: number;
  unit: string;
  source: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
}

// Utility Types
export type EmissionScope = 'scope_1' | 'scope_2' | 'scope_3';
export type CalculationStatus = 'draft' | 'completed' | 'approved' | 'rejected';
export type ImportFormat = 'csv' | 'excel' | 'json';
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';