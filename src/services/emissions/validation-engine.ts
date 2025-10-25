/**
 * Validation Engine for Enhanced Emissions Management
 * Validates emissions data against business rules and regulatory requirements
 */

import { apiClient } from "@/lib/api-client";
import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationMetrics,
  EmissionsData,
  Scope1CalculationRequest,
  Scope2CalculationRequest,
  FuelData,
  ElectricityData,
} from "@/types/emissions";
import type { ValidationEngineInterface } from "./types";

export class ValidationEngine implements ValidationEngineInterface {
  /**
   * Validate emissions data against predefined business rules and regulatory requirements
   */
  async validateEmissionsData(data: Scope1CalculationRequest | Scope2CalculationRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    try {
      // Validate based on data type (Scope 1 or Scope 2)
      if (this.isScope1Data(data)) {
        this.validateScope1Data(data, errors, warnings);
      } else if (this.isScope2Data(data)) {
        this.validateScope2Data(data, errors, warnings);
      } else {
        errors.push({
          code: "INVALID_DATA_TYPE",
          message: "Data must be either Scope 1 or Scope 2 calculation request",
          field: "root",
          severity: "critical",
        });
      }

      // Calculate quality score
      const qualityScore = this.calculateDataQualityScore(data);

      // Generate recommendations based on validation results
      if (errors.length > 0) {
        recommendations.push(
          "Address all validation errors before submitting data"
        );
      }
      if (warnings.length > 0) {
        recommendations.push("Review warnings to improve data quality");
      }
      if (qualityScore < 80) {
        recommendations.push(
          "Improve data completeness and accuracy to achieve higher quality scores"
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        qualityScore,
        recommendations,
        validatedAt: new Date(),
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            code: "VALIDATION_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Unknown validation error",
            field: "root",
            severity: "critical",
          },
        ],
        warnings: [],
        qualityScore: 0,
        recommendations: ["Fix validation errors and try again"],
        validatedAt: new Date(),
      };
    }
  }

  /**
   * Validate bulk emissions data
   */
  async validateBulkData(data: (Scope1CalculationRequest | Scope2CalculationRequest)[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const item of data) {
      const result = await this.validateEmissionsData(item);
      results.push(result);
    }

    return results;
  }

  /**
   * Get validation metrics from EPA GHGRP endpoint
   */
  async getValidationMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<ValidationMetrics> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      return await apiClient.getValidationMetrics(params);
    } catch (error) {
      // Return default metrics if API call fails
      return {
        total_validations: 0,
        success_rate: 0,
        average_quality_score: 0,
        common_errors: [],
        quality_trends: [],
      };
    }
  }

  /**
   * Calculate data quality score (0-100)
   */
  calculateDataQualityScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number {
    if (!data) return 0;

    let score = 0;
    let maxScore = 0;

    // Completeness score (40 points)
    const completenessScore = this.calculateCompletenessScore(data);
    score += completenessScore * 0.4;
    maxScore += 40;

    // Accuracy score (30 points)
    const accuracyScore = this.calculateAccuracyScore(data);
    score += accuracyScore * 0.3;
    maxScore += 30;

    // Consistency score (20 points)
    const consistencyScore = this.calculateConsistencyScore(data);
    score += consistencyScore * 0.2;
    maxScore += 20;

    // Timeliness score (10 points)
    const timelinessScore = this.calculateTimelinessScore(data);
    score += timelinessScore * 0.1;
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }

  // Private helper methods

  private isScope1Data(data: unknown): data is Scope1CalculationRequest {
    return !!(data && typeof data === 'object' && 'fuel_data' in data && Array.isArray((data as Record<string, unknown>).fuel_data));
  }

  private isScope2Data(data: unknown): data is Scope2CalculationRequest {
    return !!(
      data && typeof data === 'object' && 'electricity_data' in data && Array.isArray((data as Record<string, unknown>).electricity_data)
    );
  }

  private validateScope1Data(
    data: Scope1CalculationRequest,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Required fields validation
    if (!data.company_id) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Company ID is required",
        field: "company_id",
        severity: "critical",
        suggestion: "Provide a valid company identifier",
      });
    }

    if (!data.reporting_period) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Reporting period is required",
        field: "reporting_period",
        severity: "critical",
        suggestion:
          "Specify the reporting period with start date, end date, and year",
      });
    } else {
      this.validateReportingPeriod(data.reporting_period, errors, warnings);
    }

    // Fuel data validation
    if (!data.fuel_data || data.fuel_data.length === 0) {
      errors.push({
        code: "MISSING_ACTIVITY_DATA",
        message:
          "At least one fuel data entry is required for Scope 1 calculations",
        field: "fuel_data",
        severity: "critical",
        suggestion: "Add fuel consumption data for your emission sources",
      });
    } else {
      data.fuel_data.forEach((fuel, index) => {
        this.validateFuelData(fuel, index, errors, warnings);
      });
    }

    // Process data validation (optional)
    if (data.process_data) {
      data.process_data.forEach((process, index) => {
        this.validateProcessData(process, index, errors, warnings);
      });
    }

    // Fugitive data validation (optional)
    if (data.fugitive_data) {
      data.fugitive_data.forEach((fugitive, index) => {
        this.validateFugitiveData(fugitive, index, errors, warnings);
      });
    }
  }

  private validateScope2Data(
    data: Scope2CalculationRequest,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Required fields validation
    if (!data.company_id) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Company ID is required",
        field: "company_id",
        severity: "critical",
        suggestion: "Provide a valid company identifier",
      });
    }

    if (!data.reporting_period) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Reporting period is required",
        field: "reporting_period",
        severity: "critical",
        suggestion:
          "Specify the reporting period with start date, end date, and year",
      });
    } else {
      this.validateReportingPeriod(data.reporting_period, errors, warnings);
    }

    // Methodology validation
    if (
      !data.methodology ||
      !["location_based", "market_based"].includes(data.methodology)
    ) {
      errors.push({
        code: "INVALID_METHODOLOGY",
        message:
          'Methodology must be either "location_based" or "market_based"',
        field: "methodology",
        severity: "major",
        suggestion: "Select a valid Scope 2 calculation methodology",
      });
    }

    // Electricity data validation
    if (!data.electricity_data || data.electricity_data.length === 0) {
      errors.push({
        code: "MISSING_ACTIVITY_DATA",
        message:
          "At least one electricity data entry is required for Scope 2 calculations",
        field: "electricity_data",
        severity: "critical",
        suggestion: "Add electricity consumption data for your facilities",
      });
    } else {
      data.electricity_data.forEach((electricity, index) => {
        this.validateElectricityData(electricity, index, errors, warnings);
      });
    }

    // Renewable percentage validation
    if (data.renewable_percentage !== undefined) {
      if (data.renewable_percentage < 0 || data.renewable_percentage > 100) {
        errors.push({
          code: "DATA_OUT_OF_RANGE",
          message: "Renewable percentage must be between 0 and 100",
          field: "renewable_percentage",
          severity: "major",
          suggestion: "Provide a valid percentage value (0-100)",
        });
      }
    }
  }

  private validateReportingPeriod(
    period: { start_date?: string; end_date?: string; reporting_year?: number },
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!period.start_date) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Reporting period start date is required",
        field: "reporting_period.start_date",
        severity: "critical",
      });
    }

    if (!period.end_date) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Reporting period end date is required",
        field: "reporting_period.end_date",
        severity: "critical",
      });
    }

    if (!period.reporting_year) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Reporting year is required",
        field: "reporting_period.reporting_year",
        severity: "critical",
      });
    }

    // Date range validation
    if (period.start_date && period.end_date) {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);

      if (startDate >= endDate) {
        errors.push({
          code: "INVALID_DATE_RANGE",
          message: "Start date must be before end date",
          field: "reporting_period",
          severity: "major",
          suggestion: "Ensure the reporting period dates are in correct order",
        });
      }

      // Check if period is too long (more than 1 year)
      const daysDiff =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 366) {
        warnings.push({
          code: "LONG_REPORTING_PERIOD",
          message: "Reporting period is longer than one year",
          field: "reporting_period",
          suggestion:
            "Consider breaking down into shorter periods for better accuracy",
        });
      }
    }
  }

  private validateFuelData(
    fuel: FuelData,
    index: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const fieldPrefix = `fuel_data[${index}]`;

    if (!fuel.fuel_type) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Fuel type is required",
        field: `${fieldPrefix}.fuel_type`,
        severity: "critical",
        suggestion:
          "Specify the type of fuel (e.g., natural_gas, diesel, gasoline)",
      });
    }

    if (fuel.amount === undefined || fuel.amount === null) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Fuel amount is required",
        field: `${fieldPrefix}.amount`,
        severity: "critical",
        suggestion: "Provide the quantity of fuel consumed",
      });
    } else if (fuel.amount < 0) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Fuel amount cannot be negative",
        field: `${fieldPrefix}.amount`,
        severity: "major",
        suggestion: "Provide a positive fuel consumption value",
      });
    } else if (fuel.amount === 0) {
      warnings.push({
        code: "ZERO_ACTIVITY_DATA",
        message: "Fuel amount is zero",
        field: `${fieldPrefix}.amount`,
        suggestion: "Verify if zero consumption is correct",
      });
    }

    if (!fuel.unit) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Fuel unit is required",
        field: `${fieldPrefix}.unit`,
        severity: "critical",
        suggestion:
          "Specify the unit of measurement (e.g., gallons, liters, therms)",
      });
    }

    // Optional field validations
    if (fuel.heating_value !== undefined && fuel.heating_value <= 0) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Heating value must be positive",
        field: `${fieldPrefix}.heating_value`,
        severity: "minor",
      });
    }

    if (
      fuel.carbon_content !== undefined &&
      (fuel.carbon_content < 0 || fuel.carbon_content > 100)
    ) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Carbon content must be between 0 and 100 percent",
        field: `${fieldPrefix}.carbon_content`,
        severity: "minor",
      });
    }
  }

  private validateElectricityData(
    electricity: ElectricityData,
    index: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const fieldPrefix = `electricity_data[${index}]`;

    if (electricity.amount === undefined || electricity.amount === null) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Electricity amount is required",
        field: `${fieldPrefix}.amount`,
        severity: "critical",
        suggestion: "Provide the quantity of electricity consumed",
      });
    } else if (electricity.amount < 0) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Electricity amount cannot be negative",
        field: `${fieldPrefix}.amount`,
        severity: "major",
        suggestion: "Provide a positive electricity consumption value",
      });
    } else if (electricity.amount === 0) {
      warnings.push({
        code: "ZERO_ACTIVITY_DATA",
        message: "Electricity amount is zero",
        field: `${fieldPrefix}.amount`,
        suggestion: "Verify if zero consumption is correct",
      });
    }

    if (!electricity.unit) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Electricity unit is required",
        field: `${fieldPrefix}.unit`,
        severity: "critical",
        suggestion: "Specify the unit of measurement (e.g., kWh, MWh)",
      });
    }

    // Optional field validations
    if (electricity.renewable_percentage !== undefined) {
      if (
        electricity.renewable_percentage < 0 ||
        electricity.renewable_percentage > 100
      ) {
        errors.push({
          code: "DATA_OUT_OF_RANGE",
          message: "Renewable percentage must be between 0 and 100",
          field: `${fieldPrefix}.renewable_percentage`,
          severity: "minor",
        });
      }
    }
  }

  private validateProcessData(
    process: { process_type?: string; amount?: number; unit?: string },
    index: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const fieldPrefix = `process_data[${index}]`;

    if (!process.process_type) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Process type is required",
        field: `${fieldPrefix}.process_type`,
        severity: "major",
      });
    }

    if (process.amount === undefined || process.amount < 0) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Process amount must be non-negative",
        field: `${fieldPrefix}.amount`,
        severity: "major",
      });
    }
  }

  private validateFugitiveData(
    fugitive: { source_type?: string; amount?: number; unit?: string },
    index: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const fieldPrefix = `fugitive_data[${index}]`;

    if (!fugitive.source_type) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Fugitive source type is required",
        field: `${fieldPrefix}.source_type`,
        severity: "major",
      });
    }

    if (fugitive.amount === undefined || fugitive.amount < 0) {
      errors.push({
        code: "DATA_OUT_OF_RANGE",
        message: "Fugitive amount must be non-negative",
        field: `${fieldPrefix}.amount`,
        severity: "major",
      });
    }
  }

  private calculateCompletenessScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number {
    if (!data) return 0;

    let filledFields = 0;
    let totalFields = 0;

    // Required fields
    const requiredFields = ["company_id", "reporting_period"] as const;
    requiredFields.forEach((field) => {
      totalFields++;
      if ((data as any)[field]) filledFields++;
    });

    // Activity data completeness
    if (this.isScope1Data(data) && data.fuel_data) {
      data.fuel_data.forEach((fuel: FuelData) => {
        totalFields += 3; // fuel_type, amount, unit
        if (fuel.fuel_type) filledFields++;
        if (fuel.amount !== undefined && fuel.amount !== null) filledFields++;
        if (fuel.unit) filledFields++;
      });
    }

    if (this.isScope2Data(data) && data.electricity_data) {
      data.electricity_data.forEach((electricity: ElectricityData) => {
        totalFields += 2; // amount, unit
        if (electricity.amount !== undefined && electricity.amount !== null)
          filledFields++;
        if (electricity.unit) filledFields++;
      });
    }

    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  }

  private calculateAccuracyScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number {
    const score = 100;
    let deductions = 0;

    // Check for negative values
    if (this.isScope1Data(data) && data.fuel_data) {
      data.fuel_data.forEach((fuel: FuelData) => {
        if (fuel.amount < 0) deductions += 10;
      });
    }

    if (this.isScope2Data(data) && data.electricity_data) {
      data.electricity_data.forEach((electricity: ElectricityData) => {
        if (electricity.amount < 0) deductions += 10;
      });
    }

    // Check for unrealistic values (very high consumption)
    // This is a simplified check - in real implementation, you'd have industry benchmarks
    if (this.isScope1Data(data) && data.fuel_data) {
      data.fuel_data.forEach((fuel: FuelData) => {
        if (fuel.amount > 1000000) deductions += 5; // Arbitrary large number check
      });
    }

    return Math.max(0, score - deductions);
  }

  private calculateConsistencyScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number {
    const score = 100;
    let deductions = 0;

    // Check for consistent units within the same data type
    if (
      this.isScope1Data(data) &&
      data.fuel_data &&
      data.fuel_data.length > 1
    ) {
      const units = data.fuel_data
        .map((fuel: FuelData) => fuel.unit)
        .filter(Boolean);
      const uniqueUnits = new Set(units);
      if (uniqueUnits.size > 3) {
        // Too many different units might indicate inconsistency
        deductions += 10;
      }
    }

    // Check date consistency
    if (data.reporting_period) {
      const { start_date, end_date, reporting_year } = data.reporting_period;
      if (start_date && end_date && reporting_year) {
        const startYear = new Date(start_date).getFullYear();
        const endYear = new Date(end_date).getFullYear();
        if (startYear !== reporting_year && endYear !== reporting_year) {
          deductions += 15;
        }
      }
    }

    return Math.max(0, score - deductions);
  }

  private calculateTimelinessScore(data: Scope1CalculationRequest | Scope2CalculationRequest): number {
    // For now, return a fixed score since we don't have timestamp data
    // In real implementation, this would check how recent the data is
    return 90;
  }
}

// Export singleton instance
export const validationEngine = new ValidationEngine();
