'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { useValidationMetrics } from '@/hooks/use-enhanced-emissions';
import { ValidationResults } from './validation-results';
import { DataQualityScore } from './data-quality-score';
import { ValidationErrorList } from './validation-error-list';

interface EmissionsValidationProps {
  companyId: string;
}

export const EmissionsValidation: React.FC<EmissionsValidationProps> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { 
    data: validationMetrics, 
    isLoading, 
    error,
    refetch 
  } = useValidationMetrics(dateRange.startDate, dateRange.endDate);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading validation metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-600 mb-2">Failed to load validation metrics</div>
            <div className="text-gray-500 text-sm mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Emissions Data Validation
              </CardTitle>
              <CardDescription>
                Comprehensive validation of emissions data against EPA standards and business rules
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {validationMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(validationMetrics.success_rate * 100)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationMetrics.total_validations || 0}
                </div>
                <div className="text-sm text-gray-500">Total Validations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(validationMetrics.average_quality_score || 0)}
                </div>
                <div className="text-sm text-gray-500">Avg Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {validationMetrics.common_errors?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Common Issues</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="errors">Common Errors</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Overview</CardTitle>
              <CardDescription>
                Summary of validation metrics for {companyId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {validationMetrics?.total_validations || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Validations</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {((validationMetrics?.success_rate || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationMetrics?.average_quality_score || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Quality Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <DataQualityScore 
            score={validationMetrics?.average_quality_score || 0}
          />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ValidationErrorList 
            commonErrors={validationMetrics?.common_errors || []}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>
                Historical data quality trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(validationMetrics && typeof validationMetrics === 'object' && 'quality_trends' in validationMetrics && Array.isArray(validationMetrics.quality_trends) && validationMetrics.quality_trends.length > 0) ? (
                <div className="space-y-4">
                  {(validationMetrics as { quality_trends: Array<{ date: string; validation_count: number; average_score: number }> }).quality_trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{trend.date}</div>
                        <div className="text-sm text-gray-500">
                          {trend.validation_count} validations
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {Math.round(trend.average_score)}
                        </div>
                        <div className="text-sm text-gray-500">Quality Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-500">No trend data available</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};