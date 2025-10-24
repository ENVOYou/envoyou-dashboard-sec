'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { validationEngine } from '@/services/emissions/validation-engine';
import type { ValidationResult } from '@/types/emissions';

interface ValidationFormProps {
  onValidationComplete?: (result: ValidationResult) => void;
}

interface EmissionFormData {
  activityData: {
    value: string;
    unit: string;
  };
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  scope: string;
  fuelType: string;
  description: string;
  methodology: string;
  dataSource: string;
  uncertainty: string;
  comments: string;
}

const initialFormData: EmissionFormData = {
  activityData: {
    value: '',
    unit: ''
  },
  reportingPeriod: {
    startDate: '',
    endDate: ''
  },
  scope: '',
  fuelType: '',
  description: '',
  methodology: '',
  dataSource: '',
  uncertainty: '',
  comments: ''
};

export function ValidationForm({ onValidationComplete }: ValidationFormProps) {
  const [formData, setFormData] = useState<EmissionFormData>(initialFormData);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof EmissionFormData],
            [keys[1]]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Convert form data to validation format
      const validationData = {
        activityData: {
          value: parseFloat(formData.activityData.value) || 0,
          unit: formData.activityData.unit
        },
        reportingPeriod: {
          startDate: formData.reportingPeriod.startDate,
          endDate: formData.reportingPeriod.endDate
        },
        scope: formData.scope,
        fuelType: formData.fuelType,
        description: formData.description,
        methodology: formData.methodology,
        dataSource: formData.dataSource,
        uncertainty: parseFloat(formData.uncertainty) || undefined,
        comments: formData.comments
      };

      const result = await validationEngine.validateEmissionsData(validationData);
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: 'An error occurred during validation',
          field: 'system',
          severity: 'critical'
        }],
        warnings: [],
        qualityScore: 0,
        recommendations: ['Please try again'],
        validatedAt: new Date()
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setValidationResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Emissions Validation</CardTitle>
          <CardDescription>
            Enter your emissions data to validate against EPA standards and business rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Data Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-value">Activity Value *</Label>
              <Input
                id="activity-value"
                type="number"
                placeholder="Enter activity value"
                value={formData.activityData.value}
                onChange={(e) => handleInputChange('activityData.value', e.target.value)}
                data-testid="activity-value"
              />
              {validationResult?.errors.find(e => e.field === 'activityData.value') && (
                <p className="text-sm text-red-600" data-testid="activity-value-error">
                  {validationResult.errors.find(e => e.field === 'activityData.value')?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-unit">Activity Unit *</Label>
              <Select 
                value={formData.activityData.unit} 
                onValueChange={(value) => handleInputChange('activityData.unit', value)}
              >
                <SelectTrigger data-testid="activity-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="mmbtu">MMBtu</SelectItem>
                  <SelectItem value="kwh">kWh</SelectItem>
                  <SelectItem value="mwh">MWh</SelectItem>
                </SelectContent>
              </Select>
              {validationResult?.errors.find(e => e.field === 'activityData.unit') && (
                <p className="text-sm text-red-600" data-testid="activity-unit-error">
                  {validationResult.errors.find(e => e.field === 'activityData.unit')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Reporting Period Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.reportingPeriod.startDate}
                onChange={(e) => handleInputChange('reportingPeriod.startDate', e.target.value)}
                data-testid="start-date"
              />
              {validationResult?.errors.find(e => e.field === 'reportingPeriod.startDate') && (
                <p className="text-sm text-red-600" data-testid="start-date-error">
                  {validationResult.errors.find(e => e.field === 'reportingPeriod.startDate')?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.reportingPeriod.endDate}
                onChange={(e) => handleInputChange('reportingPeriod.endDate', e.target.value)}
                data-testid="end-date"
              />
              {validationResult?.errors.find(e => e.field === 'reportingPeriod.endDate') && (
                <p className="text-sm text-red-600" data-testid="end-date-error">
                  {validationResult.errors.find(e => e.field === 'reportingPeriod.endDate')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Scope and Fuel Type Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Emission Scope *</Label>
              <Select 
                value={formData.scope} 
                onValueChange={(value) => handleInputChange('scope', value)}
              >
                <SelectTrigger data-testid="scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scope_1">Scope 1 - Direct Emissions</SelectItem>
                  <SelectItem value="scope_2">Scope 2 - Indirect Emissions</SelectItem>
                  <SelectItem value="scope_3">Scope 3 - Other Indirect</SelectItem>
                </SelectContent>
              </Select>
              {validationResult?.errors.find(e => e.field === 'scope') && (
                <p className="text-sm text-red-600" data-testid="scope-error">
                  {validationResult.errors.find(e => e.field === 'scope')?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel-type">Fuel Type {formData.scope === 'scope_1' && '*'}</Label>
              <Select 
                value={formData.fuelType} 
                onValueChange={(value) => handleInputChange('fuelType', value)}
                disabled={formData.scope !== 'scope_1'}
              >
                <SelectTrigger data-testid="fuel-type">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural_gas">Natural Gas</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="coal">Coal</SelectItem>
                  <SelectItem value="propane">Propane</SelectItem>
                </SelectContent>
              </Select>
              {validationResult?.errors.find(e => e.code === 'CONSISTENT_SCOPE_DATA') && (
                <p className="text-sm text-red-600" data-testid="fuel-type-error">
                  Bidang &quot;Bahan Bakar&quot; wajib diisi untuk Scope 1 emissions
                </p>
              )}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  data-testid="description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology">Methodology</Label>
                <Input
                  id="methodology"
                  placeholder="Calculation methodology"
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  data-testid="methodology"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Input
                  id="data-source"
                  placeholder="Source of data"
                  value={formData.dataSource}
                  onChange={(e) => handleInputChange('dataSource', e.target.value)}
                  data-testid="data-source"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uncertainty">Uncertainty (%)</Label>
                <Input
                  id="uncertainty"
                  type="number"
                  placeholder="Uncertainty percentage"
                  value={formData.uncertainty}
                  onChange={(e) => handleInputChange('uncertainty', e.target.value)}
                  data-testid="uncertainty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Additional comments or notes"
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                data-testid="comments"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleValidate} 
              disabled={isValidating}
              data-testid="validate-button"
              className="flex-1"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate Data'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              data-testid="reset-button"
            >
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quality Score */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Data Quality Score:</span>
                <span 
                  className="text-2xl font-bold"
                  data-testid="quality-score"
                >
                  {Math.round(validationResult.qualityScore)}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    validationResult.qualityScore >= 90 ? 'bg-green-600' :
                    validationResult.qualityScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${validationResult.qualityScore}%` }}
                />
              </div>
            </div>

            {/* Validation Status */}
            <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription data-testid="validation-status">
                {validationResult.isValid 
                  ? "Data validation successful! All required fields are valid." 
                  : "Data validation failed. Please address the errors below."}
              </AlertDescription>
            </Alert>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Validation Errors:</h4>
                {validationResult.errors.map((error, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription data-testid={`error-${index}`}>
                      <strong>{error.field}:</strong> {error.message}
                      {error.suggestion && (
                        <div className="mt-1 text-sm text-gray-600">
                          Suggestion: {error.suggestion}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Warnings:</h4>
                {validationResult.warnings.map((warning, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription data-testid={`warning-${index}`}>
                      <strong>{warning.field}:</strong> {warning.message}
                      {warning.suggestion && (
                        <div className="mt-1 text-sm text-gray-600">
                          Suggestion: {warning.suggestion}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1" data-testid="recommendations">
                  {validationResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}