'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Search, TrendingUp, TrendingDown, Info, ExternalLink } from 'lucide-react';
import type { ValidationErrorSummary } from '@/types/emissions';

interface ValidationErrorListProps {
  commonErrors: ValidationErrorSummary[];
}

export const ValidationErrorList: React.FC<ValidationErrorListProps> = ({ 
  commonErrors 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'frequency' | 'percentage'>('frequency');

  const filteredErrors = commonErrors
    .filter(error => 
      error.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.error_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'frequency') {
        return b.frequency - a.frequency;
      }
      return b.percentage - a.percentage;
    });

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 20) return 'red';
    if (percentage >= 10) return 'yellow';
    return 'blue';
  };

  const getSeverityLabel = (percentage: number) => {
    if (percentage >= 20) return 'Critical';
    if (percentage >= 10) return 'High';
    if (percentage >= 5) return 'Medium';
    return 'Low';
  };

  const getErrorSolution = (errorCode: string) => {
    const solutions: Record<string, string> = {
      'MISSING_REQUIRED_FIELD': 'Ensure all mandatory fields are completed before submission',
      'INVALID_EMISSION_FACTOR': 'Verify emission factors against current EPA standards',
      'DATA_OUT_OF_RANGE': 'Check that values are within acceptable ranges for the data type',
      'INCONSISTENT_UNITS': 'Ensure consistent units are used throughout the calculation',
      'MISSING_ACTIVITY_DATA': 'Provide complete activity data for all emission sources',
      'INVALID_DATE_RANGE': 'Verify that reporting dates are within the correct period',
      'DUPLICATE_ENTRY': 'Remove or consolidate duplicate emission source entries',
      'CALCULATION_ERROR': 'Review calculation methodology and input parameters',
    };
    
    return solutions[errorCode] || 'Review the specific error details and consult documentation';
  };

  if (commonErrors.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-500">No common errors found</div>
            <div className="text-sm text-gray-400 mt-1">
              This indicates excellent data quality
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Common Validation Errors
          </CardTitle>
          <CardDescription>
            Most frequent validation errors and their solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'frequency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('frequency')}
              >
                By Frequency
              </Button>
              <Button
                variant={sortBy === 'percentage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('percentage')}
              >
                By Percentage
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {commonErrors.length}
              </div>
              <div className="text-sm text-gray-500">Error Types</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {commonErrors.reduce((sum, error) => sum + error.frequency, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Occurrences</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(commonErrors.reduce((sum, error) => sum + error.percentage, 0))}%
              </div>
              <div className="text-sm text-gray-500">Total Impact</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <div className="space-y-4">
        {filteredErrors.map((error, index) => {
          const severityColor = getSeverityColor(error.percentage);
          const severityLabel = getSeverityLabel(error.percentage);
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={severityColor === 'red' ? 'destructive' : 'secondary'}>
                        {error.error_code}
                      </Badge>
                      <Badge variant="outline">
                        {severityLabel} Priority
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {error.error_message}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold text-red-600">
                        {error.frequency}
                      </span>
                      {error.percentage >= 10 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {error.percentage.toFixed(1)}% of validations
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        Recommended Solution
                      </div>
                      <div className="text-sm text-gray-700">
                        {getErrorSolution(error.error_code)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Frequency: {error.frequency} occurrences</span>
                    <span>Impact: {error.percentage.toFixed(1)}%</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredErrors.length === 0 && searchTerm && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-500">No errors found matching &quot;{searchTerm}&quot;</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Recommendations */}
      {commonErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Actions</CardTitle>
            <CardDescription>
              Recommended actions based on error frequency and impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonErrors
                .filter(error => error.percentage >= 10)
                .slice(0, 3)
                .map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800">
                        Address {error.error_code} ({error.percentage.toFixed(1)}% impact)
                      </div>
                      <div className="text-sm text-red-700">
                        {getErrorSolution(error.error_code)}
                      </div>
                    </div>
                  </div>
                ))}
              
              {commonErrors.every(error => error.percentage < 10) && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Info className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">
                      Good Error Management
                    </div>
                    <div className="text-sm text-green-700">
                      No critical errors detected. Continue monitoring and maintain current quality standards.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};