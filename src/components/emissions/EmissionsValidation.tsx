/**
 * Emissions Validation Component
 * Validates emissions calculations against external data sources and compliance standards
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Shield,
  AlertTriangle,
} from 'lucide-react';

import { useEmissionsValidation } from '@/hooks/use-emissions';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ValidationResult {
  id: string;
  type: 'cross_validation' | 'benchmark_comparison' | 'compliance_check' | 'data_quality';
  status: 'passed' | 'warning' | 'failed';
  title: string;
  description: string;
  value?: number;
  expected_range?: { min: number; max: number };
  source: string;
  confidence: number;
  timestamp: string;
  details?: string;
  recommendation?: string;
}

interface EmissionsValidationProps {
  calculationId?: string;
  companyId?: string;
  className?: string;
}

interface ValidationResult {
  id: string;
  type: 'cross_validation' | 'benchmark_comparison' | 'compliance_check' | 'data_quality';
  status: 'passed' | 'warning' | 'failed';
  title: string;
  description: string;
  value?: number;
  expected_range?: { min: number; max: number };
  source: string;
  confidence: number;
  timestamp: string;
  details?: string;
  recommendation?: string;
}

const ValidationResultItem: React.FC<{ result: ValidationResult }> = ({ result }) => {
  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn(
      'border rounded-lg p-4',
      getStatusColor(result.status)
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getStatusIcon(result.status)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{result.title}</h4>
              <Badge variant="outline" className="text-xs">
                {result.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm mb-2">{result.description}</p>

            {result.value !== undefined && (
              <div className="text-sm mb-2">
                <span className="font-medium">Calculated Value:</span> {result.value.toLocaleString()}
                {result.expected_range && (
                  <span className="text-gray-600 ml-2">
                    (Expected: {result.expected_range.min.toLocaleString()} - {result.expected_range.max.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Source: {result.source}</span>
              <span className={getConfidenceColor(result.confidence)}>
                Confidence: {Math.round(result.confidence * 100)}%
              </span>
              <span>{format(new Date(result.timestamp), 'MMM d, yyyy h:mm a')}</span>
            </div>

            {result.recommendation && (
              <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                <strong>Recommendation:</strong> {result.recommendation}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const EmissionsValidation: React.FC<EmissionsValidationProps> = ({
  calculationId,
  companyId,
  className,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const { data: validationData, isLoading, error, refetch } = useEmissionsValidation({
    calculation_id: calculationId,
    company_id: companyId,
  });

  const mockValidationResults: ValidationResult[] = [
    {
      id: '1',
      type: 'cross_validation',
      status: 'passed',
      title: 'EPA Database Cross-Validation',
      description: 'Emissions factors match EPA database within acceptable range',
      value: 0.052,
      expected_range: { min: 0.045, max: 0.065 },
      source: 'EPA GHGRP Database',
      confidence: 0.95,
      timestamp: new Date().toISOString(),
      details: 'Cross-referenced with EPA facility-level data for similar operations',
    },
    {
      id: '2',
      type: 'benchmark_comparison',
      status: 'warning',
      title: 'Industry Benchmark Comparison',
      description: 'Emissions intensity higher than industry average',
      value: 0.052,
      expected_range: { min: 0.035, max: 0.045 },
      source: 'Industry Benchmark Database',
      confidence: 0.78,
      timestamp: new Date().toISOString(),
      recommendation: 'Consider energy efficiency improvements or renewable energy adoption',
    },
    {
      id: '3',
      type: 'compliance_check',
      status: 'passed',
      title: 'SEC Reporting Compliance',
      description: 'Calculation methodology meets SEC climate disclosure requirements',
      source: 'SEC Climate Rules',
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      details: 'Validated against SEC Regulation S-K Item 1500 requirements',
    },
    {
      id: '4',
      type: 'data_quality',
      status: 'failed',
      title: 'Data Completeness Check',
      description: 'Missing supporting documentation for fuel consumption data',
      source: 'Internal Validation',
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      recommendation: 'Upload fuel receipts or meter readings to improve data quality',
    },
  ];

  const results = validationData?.results || mockValidationResults;

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter((result: ValidationResult) => result.type === activeTab);

  const getStatusCounts = () => {
    return {
      passed: results.filter((r: ValidationResult) => r.status === 'passed').length,
      warning: results.filter((r: ValidationResult) => r.status === 'warning').length,
      failed: results.filter((r: ValidationResult) => r.status === 'failed').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <EnhancedCard className={className}>
        <EnhancedCardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <div className="text-red-500 mb-1">Failed to load validation results</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Validation Summary */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Emissions Validation Results"
          description="Cross-validation against external data sources and compliance standards"
          action={
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </EnhancedButton>
          }
        />
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusCounts.passed}</div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.warning}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-blue-700">Total Checks</div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Overall Validation Status</div>
                <div className="text-sm text-gray-500">
                  {statusCounts.failed > 0
                    ? 'Requires attention before reporting'
                    : statusCounts.warning > 0
                    ? 'Review recommended before final submission'
                    : 'Ready for reporting and compliance'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusCounts.failed > 0 ? (
                <Badge variant="destructive">Action Required</Badge>
              ) : statusCounts.warning > 0 ? (
                <Badge variant="secondary">Review Recommended</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              )}
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Validation Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="cross_validation">Cross-Validation</TabsTrigger>
          <TabsTrigger value="benchmark_comparison">Benchmarks</TabsTrigger>
          <TabsTrigger value="compliance_check">Compliance</TabsTrigger>
          <TabsTrigger value="data_quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <EnhancedCard>
              <EnhancedCardContent className="flex items-center justify-center py-8">
                <div className="text-center text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <div className="text-lg font-medium mb-2">No validation results</div>
                  <div className="text-sm">
                    {activeTab === 'all'
                      ? 'No validation checks have been performed yet.'
                      : `No ${activeTab.replace('_', ' ')} results found.`
                    }
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result: ValidationResult) => (
                <ValidationResultItem key={result.id} result={result} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Validation Report */}
      <EnhancedCard>
        <EnhancedCardHeader title="Validation Report" />
        <EnhancedCardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Generate comprehensive validation report for compliance and audit purposes
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};