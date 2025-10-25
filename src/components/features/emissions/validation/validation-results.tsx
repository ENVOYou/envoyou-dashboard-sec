'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { ValidationResult } from '@/types/emissions';

interface ValidationResultsProps {
  result: ValidationResult;
  className?: string;
}

export function ValidationResults({ result, className }: ValidationResultsProps) {
  const getStatusIcon = () => {
    if (result.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = () => {
    if (result.isValid) {
      return 'border-green-200 bg-green-50';
    }
    return 'border-red-200 bg-red-50';
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Validation Results
        </CardTitle>
        <CardDescription>
          Validation completed at {result.validatedAt.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <Alert className={getStatusColor()}>
          <AlertDescription data-testid="validation-status">
            {result.isValid 
              ? 'Data validation successful! All required fields are valid and meet quality standards.' 
              : 'Data validation failed. Please address the errors below to proceed.'}
          </AlertDescription>
        </Alert>

        {/* Quality Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Data Quality Score</h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={getQualityScoreColor(result.qualityScore)}
                data-testid="quality-score-badge"
              >
                {getQualityScoreLabel(result.qualityScore)}
              </Badge>
              <span 
                className="text-2xl font-bold"
                data-testid="quality-score"
              >
                {Math.round(result.qualityScore)}/100
              </span>
            </div>
          </div>
          
          {/* Quality Score Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                result.qualityScore >= 90 ? 'bg-green-600' :
                result.qualityScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(result.qualityScore, 100)}%` }}
              data-testid="quality-score-bar"
            />
          </div>
          
          {/* Quality Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium">Completeness</div>
              <div>Required fields filled</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Accuracy</div>
              <div>Data within valid ranges</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Richness</div>
              <div>Additional context provided</div>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.errors.length}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.warnings.length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.recommendations.length}
            </div>
            <div className="text-sm text-gray-600">Recommendations</div>
          </div>
        </div>

        {/* Errors Section */}
        {result.errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Validation Errors ({result.errors.length})
            </h3>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription data-testid={`error-${index}`}>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {error.field}: {error.message}
                      </div>
                      {error.suggestion && (
                        <div className="text-sm text-red-700">
                          💡 Suggestion: {error.suggestion}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant={error.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {error.severity.toUpperCase()}
                        </Badge>
                        <span className="text-gray-500">Code: {error.code}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Warnings Section */}
        {result.warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Warnings ({result.warnings.length})
            </h3>
            <div className="space-y-2">
              {result.warnings.map((warning, index) => (
                <Alert key={index} className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription data-testid={`warning-${index}`}>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {warning.field}: {warning.message}
                      </div>
                      {warning.suggestion && (
                        <div className="text-sm text-yellow-700">
                          💡 Suggestion: {warning.suggestion}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Code: {warning.code}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {result.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-blue-600 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recommendations
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2" data-testid="recommendations">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success Message for Valid Data */}
        {result.isValid && result.qualityScore >= 90 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Excellent! Your data meets all validation requirements and quality standards. 
              You can proceed with confidence.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}