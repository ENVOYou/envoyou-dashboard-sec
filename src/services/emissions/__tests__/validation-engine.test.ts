/**
 * Unit Tests for ValidationEngine
 * Tests validation logic and data quality scoring
 */

import { ValidationEngine } from '../validation-engine';
import type { Scope1CalculationRequest, Scope2CalculationRequest } from '@/types/emissions';

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getValidationMetrics: jest.fn()
  }
}));

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine;

  beforeEach(() => {
    validationEngine = new ValidationEngine();
    jest.clearAllMocks();
  });

  describe('validateEmissionsData', () => {
    describe('✅ Valid Data Tests', () => {
      it('should return valid result for perfect Scope 1 data', async () => {
        const perfectScope1Data: Scope1CalculationRequest = {
          calculation_name: 'Test Scope 1 Calculation',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms',
              heating_value: 100000,
              carbon_content: 53.06,
              source_description: 'Main facility natural gas consumption'
            }
          ]
        };

        const result = await validationEngine.validateEmissionsData(perfectScope1Data);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.qualityScore).toBeGreaterThan(90);
        expect(result.validatedAt).toBeInstanceOf(Date);
      });

      it('should return valid result for perfect Scope 2 data', async () => {
        const perfectScope2Data: Scope2CalculationRequest = {
          calculation_name: 'Test Scope 2 Calculation',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          electricity_data: [
            {
              amount: 50000,
              unit: 'kWh',
              region: 'WECC',
              supplier: 'Local Utility',
              renewable_percentage: 25,
              source_description: 'Office building electricity consumption'
            }
          ],
          methodology: 'location_based',
          renewable_percentage: 25
        };

        const result = await validationEngine.validateEmissionsData(perfectScope2Data);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.qualityScore).toBeGreaterThan(90);
      });
    });

    describe('❌ Invalid Data Tests - Required Fields', () => {
      it('should return invalid result when company_id is missing', async () => {
        const invalidData = {
          calculation_name: 'Test Missing Company ID',
          // company_id missing
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms'
            }
          ]
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'MISSING_REQUIRED_FIELD',
            field: 'company_id',
            severity: 'critical',
            message: 'Company ID is required'
          })
        );
      });

      it('should return invalid result when fuel amount is missing', async () => {
        const invalidData = {
          calculation_name: 'Test Invalid Fuel Amount',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              // amount missing
              unit: 'therms'
            }
          ]
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'MISSING_REQUIRED_FIELD',
            field: 'fuel_data[0].amount',
            severity: 'critical',
            message: 'Fuel amount is required'
          })
        );
      });

      it('should return invalid result when electricity data is empty', async () => {
        const invalidData = {
          calculation_name: 'Test Empty Electricity Data',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          electricity_data: [], // empty array
          methodology: 'location_based'
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'MISSING_ACTIVITY_DATA',
            field: 'electricity_data',
            severity: 'critical'
          })
        );
      });
    });

    describe('❌ Invalid Data Tests - Range Validation', () => {
      it('should return invalid result for negative fuel amount', async () => {
        const invalidData = {
          calculation_name: 'Test Negative Fuel Amount',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: -100, // negative value
              unit: 'therms'
            }
          ]
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'DATA_OUT_OF_RANGE',
            field: 'fuel_data[0].amount',
            severity: 'major',
            message: 'Fuel amount cannot be negative'
          })
        );
      });

      it('should return invalid result for invalid renewable percentage', async () => {
        const invalidData = {
          calculation_name: 'Test Invalid Renewable Percentage',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          electricity_data: [
            {
              amount: 1000,
              unit: 'kWh',
              renewable_percentage: 150 // invalid percentage > 100
            }
          ],
          methodology: 'location_based'
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'DATA_OUT_OF_RANGE',
            field: 'electricity_data[0].renewable_percentage',
            severity: 'minor'
          })
        );
      });

      it('should return invalid result for invalid date range', async () => {
        const invalidData = {
          calculation_name: 'Test Invalid Date Range',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-12-31', // start after end
            end_date: '2024-01-01',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms'
            }
          ]
        };

        const result = await validationEngine.validateEmissionsData(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'INVALID_DATE_RANGE',
            field: 'reporting_period',
            severity: 'major',
            message: 'Start date must be before end date'
          })
        );
      });
    });

    describe('🛡️ Error Handling Tests', () => {
      it('should handle null data gracefully', async () => {
        const result = await validationEngine.validateEmissionsData(null);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'INVALID_DATA_TYPE',
            field: 'root',
            severity: 'critical'
          })
        );
        expect(result.qualityScore).toBe(0);
      });

      it('should handle undefined data gracefully', async () => {
        const result = await validationEngine.validateEmissionsData(undefined);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'INVALID_DATA_TYPE',
            field: 'root',
            severity: 'critical'
          })
        );
      });

      it('should handle malformed data gracefully', async () => {
        const malformedData = {
          // Invalid structure - neither Scope 1 nor Scope 2
          some_random_field: 'value',
          another_field: 123
        };

        const result = await validationEngine.validateEmissionsData(malformedData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            code: 'INVALID_DATA_TYPE',
            message: 'Data must be either Scope 1 or Scope 2 calculation request'
          })
        );
      });
    });
  });

  describe('calculateDataQualityScore', () => {
    describe('✅ Perfect Score Tests', () => {
      it('should return high score (95-100) for perfect data', () => {
        const perfectData: Scope1CalculationRequest = {
          calculation_name: 'Test Perfect Data',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms',
              heating_value: 100000,
              carbon_content: 53.06,
              source_description: 'Main facility'
            }
          ]
        };

        const score = validationEngine.calculateDataQualityScore(perfectData);

        expect(score).toBeGreaterThanOrEqual(95);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    describe('❌ Poor Score Tests', () => {
      it('should return lower score for data with many missing fields compared to complete data', () => {
        const poorData = {
          // Missing company_id
          // Missing reporting_period  
          fuel_data: [
            {
              // Missing fuel_type
              // Missing amount
              // Missing unit
            },
            {
              // Another incomplete entry
              fuel_type: 'diesel',
              amount: -100, // negative value to reduce accuracy score
              // Missing unit
            }
          ]
        };

        const completeData = {
          calculation_name: 'Test Complete Data',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms'
            }
          ]
        };

        const poorScore = validationEngine.calculateDataQualityScore(poorData);
        const completeScore = validationEngine.calculateDataQualityScore(completeData);
        
        expect(poorScore).toBeLessThan(completeScore);
        expect(poorScore).toBeLessThan(70); // More realistic threshold
      });

      it('should return 0 for null data', () => {
        const score = validationEngine.calculateDataQualityScore(null);
        expect(score).toBe(0);
      });

      it('should return 0 for undefined data', () => {
        const score = validationEngine.calculateDataQualityScore(undefined);
        expect(score).toBe(0);
      });
    });

    describe('📊 Score Components Tests', () => {
      it('should penalize negative values in accuracy score', () => {
        const dataWithNegatives = {
          calculation_name: 'Test Data With Negatives',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: -100, // negative value should reduce accuracy
              unit: 'therms'
            }
          ]
        };

        const perfectData = {
          calculation_name: 'Test Perfect Data 2',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 100, // positive value
              unit: 'therms'
            }
          ]
        };

        const negativeScore = validationEngine.calculateDataQualityScore(dataWithNegatives);
        const perfectScore = validationEngine.calculateDataQualityScore(perfectData);

        expect(negativeScore).toBeLessThan(perfectScore);
      });

      it('should penalize inconsistent date ranges', () => {
        const inconsistentData = {
          calculation_name: 'Test Inconsistent Data',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2023-01-01', // 2023 dates
            end_date: '2023-12-31',
            reporting_year: 2024 // but 2024 reporting year
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 100,
              unit: 'therms'
            }
          ]
        };

        const consistentData = {
          calculation_name: 'Test Consistent Data',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01', // consistent 2024 dates
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 100,
              unit: 'therms'
            }
          ]
        };

        const inconsistentScore = validationEngine.calculateDataQualityScore(inconsistentData);
        const consistentScore = validationEngine.calculateDataQualityScore(consistentData);

        expect(inconsistentScore).toBeLessThan(consistentScore);
      });
    });
  });

  describe('validateBulkData', () => {
    it('should validate multiple data items', async () => {
      const bulkData = [
        {
          calculation_name: 'Test Bulk Data 1',
          company_id: 'company-123',
          reporting_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            reporting_year: 2024
          },
          fuel_data: [
            {
              fuel_type: 'natural_gas',
              amount: 1000,
              unit: 'therms'
            }
          ]
        },
        {
          company_id: 'company-456',
          // Missing reporting_period - should be invalid
          fuel_data: [
            {
              fuel_type: 'diesel',
              amount: 500,
              unit: 'gallons'
            }
          ]
        }
      ];

      const results = await validationEngine.validateBulkData(bulkData);

      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
          field: 'reporting_period'
        })
      );
    });
  });

  describe('getValidationMetrics', () => {
    it('should return default metrics when API call fails', async () => {
      // Mock API failure
      const { apiClient } = await import('@/lib/api-client');
      (apiClient.getValidationMetrics as jest.Mock).mockRejectedValue(new Error('API Error'));

      const metrics = await validationEngine.getValidationMetrics();

      expect(metrics).toEqual({
        total_validations: 0,
        success_rate: 0,
        average_quality_score: 0,
        common_errors: [],
        quality_trends: []
      });
    });

    it('should pass date parameters to API client', async () => {
      const { apiClient } = await import('@/lib/api-client');
      const mockMetrics = {
        total_validations: 100,
        success_rate: 0.95,
        average_quality_score: 88,
        common_errors: [],
        quality_trends: []
      };
      (apiClient.getValidationMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await validationEngine.getValidationMetrics(startDate, endDate);

      expect(apiClient.getValidationMetrics).toHaveBeenCalledWith({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      expect(result).toEqual(mockMetrics);
    });
  });
});