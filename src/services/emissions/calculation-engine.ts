/**
 * Calculation Engine for Enhanced Emissions Management
 * Wraps backend calculation endpoints with additional frontend logic
 */

import { apiClient } from '@/lib/api-client';
import type {
  Scope1CalculationRequest,
  Scope2CalculationRequest,
  ActivityDataInput
} from '@/lib/api-client';
import type {
  EmissionCalculation
} from '@/types/api';
import type {
  CalculationSummary,
  EmissionsCalculationResponse
} from '@/types/emissions';

export interface CalculationFilters {
  company_id?: string;
  scope?: 'scope_1' | 'scope_2' | 'scope_3';
  status?: 'draft' | 'completed' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

export interface CalculationApprovalRequest {
  decision: 'approve' | 'reject';
  comments?: string;
  conditions?: string[];
}

export class CalculationEngine {
  /**
   * Calculate Scope 1 emissions using backend endpoint
   */
  async calculateScope1(request: Scope1CalculationRequest): Promise<EmissionCalculation> {
    try {
      // Validate request before sending
      this.validateScope1Request(request);
      
      // Call backend API
      const response = await apiClient.calculateScope1(request);
      
      return response;
    } catch (error) {
      console.error('Scope 1 calculation error:', error);
      throw new Error(
        `Failed to calculate Scope 1 emissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate Scope 2 emissions using backend endpoint
   */
  async calculateScope2(request: Scope2CalculationRequest): Promise<EmissionCalculation> {
    try {
      // Validate request before sending
      this.validateScope2Request(request);
      
      // Call backend API
      const response = await apiClient.calculateScope2(request);
      
      return response;
    } catch (error) {
      console.error('Scope 2 calculation error:', error);
      throw new Error(
        `Failed to calculate Scope 2 emissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get list of calculations with optional filtering
   */
  async getCalculations(filters?: CalculationFilters): Promise<CalculationSummary[]> {
    try {
      const calculations = await apiClient.getCalculations(filters);
      return calculations;
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw new Error(
        `Failed to fetch calculations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get detailed calculation by ID
   */
  async getCalculation(calculationId: string): Promise<EmissionsCalculationResponse> {
    try {
      const calculation = await apiClient.getCalculation(calculationId);
      return calculation;
    } catch (error) {
      console.error('Error fetching calculation:', error);
      throw new Error(
        `Failed to fetch calculation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Approve or reject a calculation (CFO/General Counsel only)
   */
  async approveCalculation(
    calculationId: string,
    approval: CalculationApprovalRequest
  ): Promise<void> {
    try {
      await apiClient.approveCalculation(calculationId, approval);
    } catch (error) {
      console.error('Error approving calculation:', error);
      throw new Error(
        `Failed to approve calculation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get audit trail for a calculation
   */
  async getCalculationAuditTrail(calculationId: string) {
    try {
      const auditTrail = await apiClient.getCalculationAuditTrail(calculationId);
      return auditTrail;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw new Error(
        `Failed to fetch audit trail: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate Scope 1 calculation request
   */
  private validateScope1Request(request: Scope1CalculationRequest): void {
    if (!request.calculation_name || request.calculation_name.trim() === '') {
      throw new Error('Calculation name is required');
    }

    if (!request.company_id || request.company_id.trim() === '') {
      throw new Error('Company ID is required');
    }

    if (!request.reporting_period_start) {
      throw new Error('Reporting period start date is required');
    }

    if (!request.reporting_period_end) {
      throw new Error('Reporting period end date is required');
    }

    if (!request.activity_data || request.activity_data.length === 0) {
      throw new Error('At least one activity data entry is required');
    }

    // Validate each activity data entry
    request.activity_data.forEach((activity, index) => {
      this.validateActivityData(activity, index);
    });

    // Validate date range
    const startDate = new Date(request.reporting_period_start);
    const endDate = new Date(request.reporting_period_end);
    
    if (endDate <= startDate) {
      throw new Error('Reporting period end date must be after start date');
    }
  }

  /**
   * Validate Scope 2 calculation request
   */
  private validateScope2Request(request: Scope2CalculationRequest): void {
    if (!request.calculation_name || request.calculation_name.trim() === '') {
      throw new Error('Calculation name is required');
    }

    if (!request.company_id || request.company_id.trim() === '') {
      throw new Error('Company ID is required');
    }

    if (!request.reporting_period_start) {
      throw new Error('Reporting period start date is required');
    }

    if (!request.reporting_period_end) {
      throw new Error('Reporting period end date is required');
    }

    if (!request.electricity_consumption || request.electricity_consumption.length === 0) {
      throw new Error('At least one electricity consumption entry is required');
    }

    if (!request.calculation_method) {
      throw new Error('Calculation method is required');
    }

    if (!['location_based', 'market_based'].includes(request.calculation_method)) {
      throw new Error('Calculation method must be either location_based or market_based');
    }

    // Validate each electricity consumption entry
    request.electricity_consumption.forEach((activity, index) => {
      this.validateActivityData(activity, index);
    });

    // Validate date range
    const startDate = new Date(request.reporting_period_start);
    const endDate = new Date(request.reporting_period_end);
    
    if (endDate <= startDate) {
      throw new Error('Reporting period end date must be after start date');
    }
  }

  /**
   * Validate activity data entry
   */
  private validateActivityData(activity: ActivityDataInput, index: number): void {
    if (!activity.activity_type || activity.activity_type.trim() === '') {
      throw new Error(`Activity type is required for entry ${index + 1}`);
    }

    if (activity.quantity === undefined || activity.quantity === null) {
      throw new Error(`Quantity is required for entry ${index + 1}`);
    }

    if (activity.quantity <= 0) {
      throw new Error(`Quantity must be greater than 0 for entry ${index + 1}`);
    }

    if (!activity.unit || activity.unit.trim() === '') {
      throw new Error(`Unit is required for entry ${index + 1}`);
    }
  }

  /**
   * Helper method to create activity data entry
   */
  createActivityData(params: {
    activity_type: string;
    quantity: number;
    unit: string;
    fuel_type?: string;
    location?: string;
    data_quality?: string;
    notes?: string;
  }): ActivityDataInput {
    return {
      activity_type: params.activity_type,
      quantity: params.quantity,
      unit: params.unit,
      fuel_type: params.fuel_type || null,
      location: params.location || null,
      data_quality: params.data_quality || 'measured',
      notes: params.notes || null,
      activity_description: null,
      activity_period_start: null,
      activity_period_end: null,
      data_source: null,
      measurement_method: null,
      additional_data: null
    };
  }
}

// Export singleton instance
export const calculationEngine = new CalculationEngine();
