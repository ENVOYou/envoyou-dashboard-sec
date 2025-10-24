'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import type { ValidationMetrics } from '@/types/emissions';

interface ValidationResultsProps {
  validationMetrics?: ValidationMetrics;
  companyId: string;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ 
  validationMetrics,
  companyId 
}) => {
  if (!validationMetrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-500">No validation data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSuccessRateStatus = (rate: number) => {
    if (rate >= 0.9) return { color: 'green', icon: CheckCircle, label: 'Excellent' };
    if (rate >= 0.7) return { color: 'yellow', icon: AlertTriangle, label: 'Good' };
    return { color: 'red', icon: AlertTriangle, label: 'Needs Improvement' };
  };

  const getQualityScoreStatus = (score: number) => {
    if (score >= 80) return { color: 'green', icon: TrendingUp, label: 'High Quality' };
    if (score >= 60) return { color: 'yellow', icon: TrendingUp, label: 'Medium Quality' };
    return { color: 'red', icon: TrendingDown, label: 'Low Quality' };
  };

  const successRateStatus = getSuccessRateStatus(validationMetrics.success_rate);
  const qualityScoreStatus = getQualityScoreStatus(validationMetrics.average_quality_score);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <successRateStatus.icon className={`h-5 w-5 mr-2 text-${successRateStatus.color}-600`} />
              Validation Success Rate
            </CardTitle>
            <CardDescription>
              Percentage of emissions data that passes validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold text-${successRateStatus.color}-600`}>
                  {Math.round(validationMetrics.success_rate * 100)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {validationMetrics.total_validations} total validations
                </div>
              </div>
              <Badge variant={successRateStatus.color === 'green' ? 'default' : 'destructive'}>
                {successRateStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <qualityScoreStatus.icon className={`h-5 w-5 mr-2 text-${qualityScoreStatus.color}-600`} />
              Average Data Quality
            </CardTitle>
            <CardDescription>
              Overall quality score of validated emissions data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold text-${qualityScoreStatus.color}-600`}>
                  {Math.round(validationMetrics.average_quality_score)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Out of 100 points
                </div>
              </div>
              <Badge variant={qualityScoreStatus.color === 'green' ? 'default' : 'destructive'}>
                {qualityScoreStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
          <CardDescription>
            Detailed breakdown of validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Successful Validations</div>
                  <div className="text-sm text-gray-500">
                    Data that passed all validation rules
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(validationMetrics.total_validations * validationMetrics.success_rate)}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(validationMetrics.success_rate * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">Failed Validations</div>
                  <div className="text-sm text-gray-500">
                    Data that failed one or more validation rules
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">
                  {Math.round(validationMetrics.total_validations * (1 - validationMetrics.success_rate))}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round((1 - validationMetrics.success_rate) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Suggested actions to improve data quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationMetrics.success_rate < 0.9 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Improve Validation Success Rate
                  </div>
                  <div className="text-sm text-yellow-700">
                    Review and address common validation errors to increase success rate above 90%
                  </div>
                </div>
              </div>
            )}

            {validationMetrics.average_quality_score < 80 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">
                    Enhance Data Quality
                  </div>
                  <div className="text-sm text-blue-700">
                    Focus on improving data completeness, accuracy, and consistency to achieve higher quality scores
                  </div>
                </div>
              </div>
            )}

            {validationMetrics.common_errors && validationMetrics.common_errors.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">
                    Address Common Errors
                  </div>
                  <div className="text-sm text-red-700">
                    Review the most frequent validation errors and implement corrective measures
                  </div>
                </div>
              </div>
            )}

            {validationMetrics.success_rate >= 0.9 && validationMetrics.average_quality_score >= 80 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">
                    Excellent Data Quality
                  </div>
                  <div className="text-sm text-green-700">
                    Your emissions data meets high quality standards. Continue monitoring to maintain this level.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};