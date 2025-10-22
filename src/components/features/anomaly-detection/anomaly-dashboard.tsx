/**
 * Anomaly Detection Dashboard Component
 * Main dashboard for anomaly detection and analysis
 */

'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';

import { useAnomalyDashboard, useAnomalyAlerts } from '@/hooks/use-anomaly-detection';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ReportStatusBadge } from '@/components/ui/enhanced-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { AnomalyDashboardStats, AnomalyAlert } from '@/types/anomaly-detection';

interface AnomalyDashboardProps {
  onAnomalySelect?: (anomalyId: string) => void;
  onCompanySelect?: (companyId: string) => void;
  onViewTrends?: () => void;
  onViewBenchmarks?: () => void;
}

export const AnomalyDashboard: React.FC<AnomalyDashboardProps> = ({
  onAnomalySelect,
  onCompanySelect,
  onViewTrends,
  onViewBenchmarks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dashboardStats, isLoading, error, refetch } = useAnomalyDashboard();
  const { data: alerts } = useAnomalyAlerts(true); // Only unread alerts

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (error) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load anomaly dashboard</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
            <EnhancedButton onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </EnhancedButton>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
          <p className="text-gray-500 mt-1">
            Monitor and analyze emissions data anomalies across all companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnhancedButton variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </EnhancedButton>
          <EnhancedButton variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </EnhancedButton>
          <EnhancedButton variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </EnhancedButton>
        </div>
      </div>

      {/* Search and Filters */}
      <EnhancedCard>
        <EnhancedCardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search anomalies, companies..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.total_anomalies_detected || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Across </span>
              <span className="font-medium text-gray-900 ml-1">
                {dashboardStats?.total_companies_analyzed || 0} companies
              </span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.average_risk_score?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {dashboardStats?.risk_trends?.improving_companies && dashboardStats.risk_trends.improving_companies > 0 && (
                <span className="text-green-600 font-medium">
                  {dashboardStats!.risk_trends!.improving_companies} improving
                </span>
              )}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Companies at Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.companies_requiring_attention || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Require immediate attention</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Unread notifications</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomalies by Severity */}
        <div className="lg:col-span-2">
          <EnhancedCard>
            <EnhancedCardHeader
              title="Anomalies by Severity"
              action={
                <EnhancedButton variant="outline" size="sm" onClick={onViewTrends}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Trends
                </EnhancedButton>
              }
            />
            <EnhancedCardContent>
              {dashboardStats?.anomalies_by_severity ? (
                <div className="space-y-4">
                  {Object.entries(dashboardStats.anomalies_by_severity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(severity)}
                        <span className="font-medium capitalize">{severity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              severity === 'critical' && 'bg-red-500',
                              severity === 'high' && 'bg-orange-500',
                              severity === 'medium' && 'bg-yellow-500',
                              severity === 'low' && 'bg-green-500'
                            )}
                            style={{
                              width: `${(count / Math.max(...Object.values(dashboardStats.anomalies_by_severity))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No anomaly data available
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </div>

        {/* Recent Alerts */}
        <div>
          <EnhancedCard>
            <EnhancedCardHeader
              title="Recent Alerts"
              action={
                <EnhancedButton variant="outline" size="sm">
                  View All
                </EnhancedButton>
              }
            />
            <EnhancedCardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors',
                        getSeverityColor(alert.severity)
                      )}
                      onClick={() => onAnomalySelect?.(alert.anomaly_id)}
                    >
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs opacity-75 mt-1">{alert.message}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p>No active alerts</p>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>

      {/* Top Anomaly Types */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Top Anomaly Types"
          action={
            <EnhancedButton variant="outline" size="sm" onClick={onViewBenchmarks}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare Benchmarks
            </EnhancedButton>
          }
        />
        <EnhancedCardContent>
          {dashboardStats?.top_anomaly_types ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardStats.top_anomaly_types.map((type, index) => (
                <div key={type.type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {type.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{type.count}</span>
                    <span className="text-sm text-gray-500">
                      Avg severity: {type.avg_severity.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No anomaly type data available
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Monthly Trends */}
      <EnhancedCard>
        <EnhancedCardHeader title="Monthly Trends" />
        <EnhancedCardContent>
          {dashboardStats?.monthly_trends ? (
            <div className="space-y-4">
              {dashboardStats.monthly_trends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-sm font-medium text-gray-500">
                      {trend.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {trend.anomaly_count} anomalies
                        </span>
                        <span className="text-xs text-gray-500">
                          Risk score: {trend.risk_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.risk_score > 50 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No trend data available
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};