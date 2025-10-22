/**
 * Audit System Dashboard Component
 * Main dashboard for audit logging, compliance tracking, and security monitoring
 */

'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Eye,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Database,
  Lock,
  Unlock,
} from 'lucide-react';

import { useAuditDashboard, useAuditLogs, useSecurityEvents, useInvestigations } from '@/hooks/use-audit';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { AuditLog, SecurityEvent, InvestigationResponse } from '@/types/audit';

interface AuditDashboardProps {
  onLogSelect?: (logId: string) => void;
  onInvestigationSelect?: (investigationId: string) => void;
  onSecurityEventSelect?: (eventId: string) => void;
  onViewCompliance?: () => void;
  onViewForensics?: () => void;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  onLogSelect,
  onInvestigationSelect,
  onSecurityEventSelect,
  onViewCompliance,
  onViewForensics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: dashboardStats, isLoading, error, refetch } = useAuditDashboard();
  const { data: auditLogs } = useAuditLogs();
  const { data: securityEvents } = useSecurityEvents();
  const { data: investigations } = useInvestigations();

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

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'user_login':
      case 'user_logout':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'data_access':
      case 'data_modification':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'security_event':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'system_config_change':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
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
            <div className="text-red-500 mb-2">Failed to load audit dashboard</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Audit & Compliance</h1>
          <p className="text-gray-500 mt-1">
            Monitor system activity, security events, and compliance status
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
                placeholder="Search audit logs, users, events..."
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
                <p className="text-sm font-medium text-gray-600">Total Audit Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.total_logs?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Across </span>
              <span className="font-medium text-gray-900 ml-1">
                {dashboardStats?.logs_by_category?.system || 0} categories
              </span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.security_incidents || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {dashboardStats?.risk_trends?.direction === 'increasing' ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Increasing risk
                </span>
              ) : (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Stable
                </span>
              )}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.top_companies?.[0]?.compliance_score?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Top performing company</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investigations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.active_investigations || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Require attention</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="investigations">Investigations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <EnhancedCard>
              <EnhancedCardHeader
                title="Recent Activity"
                action={
                  <EnhancedButton variant="outline" size="sm">
                    View All
                  </EnhancedButton>
                }
              />
              <EnhancedCardContent>
                {dashboardStats?.recent_activity ? (
                  <div className="space-y-3">
                    {dashboardStats.recent_activity.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onLogSelect?.(activity.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getEventTypeIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {activity.user_name}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getSeverityIcon(activity.risk_level)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Risk Distribution */}
            <EnhancedCard>
              <EnhancedCardHeader
                title="Risk Distribution"
                action={
                  <EnhancedButton variant="outline" size="sm" onClick={onViewForensics}>
                    <Activity className="mr-2 h-4 w-4" />
                    View Analysis
                  </EnhancedButton>
                }
              />
              <EnhancedCardContent>
                {dashboardStats?.logs_by_severity ? (
                  <div className="space-y-4">
                    {Object.entries(dashboardStats.logs_by_severity).map(([severity, count]) => (
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
                                width: `${(count / Math.max(...Object.values(dashboardStats.logs_by_severity))) * 100}%`
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
                    No risk data available
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Top Users and Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <EnhancedCard>
              <EnhancedCardHeader title="Top Active Users" />
              <EnhancedCardContent>
                {dashboardStats?.top_users ? (
                  <div className="space-y-3">
                    {dashboardStats.top_users.slice(0, 5).map((user, index) => (
                      <div key={user.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.user_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.event_count} events
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded-full text-xs border',
                          getRiskColor(user.risk_score > 50 ? 'high' : user.risk_score > 25 ? 'medium' : 'low')
                        )}>
                          Risk: {user.risk_score.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No user activity data
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader title="Company Compliance" />
              <EnhancedCardContent>
                {dashboardStats?.top_companies ? (
                  <div className="space-y-3">
                    {dashboardStats.top_companies.slice(0, 5).map((company, index) => (
                      <div key={company.company_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {company.company_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {company.event_count} events
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.compliance_score.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No company data available
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <EnhancedCard>
            <EnhancedCardHeader
              title="Recent Audit Logs"
              action={
                <EnhancedButton variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </EnhancedButton>
              }
            />
            <EnhancedCardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.logs?.slice(0, 10).map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onLogSelect?.(log.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(log.event_type)}
                          <span className="text-sm font-medium capitalize">
                            {log.event_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.user_name || 'System'}</div>
                          <div className="text-xs text-gray-500">{log.user_role}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {log.company_name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                          getRiskColor(log.risk_level || 'low')
                        )}>
                          {getSeverityIcon(log.risk_level || 'low')}
                          {log.risk_level || 'Low'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="security">
          <EnhancedCard>
            <EnhancedCardHeader
              title="Security Events"
              action={
                <EnhancedButton variant="outline" size="sm" onClick={onViewForensics}>
                  <Shield className="mr-2 h-4 w-4" />
                  View Forensics
                </EnhancedButton>
              }
            />
            <EnhancedCardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Threat Level</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents?.slice(0, 10).map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onSecurityEventSelect?.(event.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(event.severity)}
                          <span className="text-sm font-medium capitalize">
                            {event.event_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{event.user_name || 'System'}</div>
                          <div className="text-xs text-gray-500">{event.company_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                          getRiskColor(event.threat_level)
                        )}>
                          {event.threat_level}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {event.risk_score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="investigations">
          <EnhancedCard>
            <EnhancedCardHeader
              title="Active Investigations"
              action={
                <EnhancedButton variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  New Investigation
                </EnhancedButton>
              }
            />
            <EnhancedCardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investigation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investigations?.slice(0, 10).map((investigation) => (
                    <TableRow
                      key={investigation.investigation_id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onInvestigationSelect?.(investigation.investigation_id)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {investigation.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {investigation.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 capitalize">
                          {investigation.type.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={investigation.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {investigation.assigned_to.map(user => user).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={investigation.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(investigation.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard>
              <EnhancedCardHeader
                title="Compliance Status"
                action={
                  <EnhancedButton variant="outline" size="sm" onClick={onViewCompliance}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    View Reports
                  </EnhancedButton>
                }
              />
              <EnhancedCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">SOX Compliance</div>
                        <div className="text-sm text-gray-500">Sarbanes-Oxley Act</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">98.5%</div>
                      <div className="text-xs text-gray-500">Compliant</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">GDPR Compliance</div>
                        <div className="text-sm text-gray-500">General Data Protection Regulation</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">87.2%</div>
                      <div className="text-xs text-gray-500">Minor issues</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">ISO 27001</div>
                        <div className="text-sm text-gray-500">Information Security Management</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">94.1%</div>
                      <div className="text-xs text-gray-500">Compliant</div>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader title="Compliance Violations" />
              <EnhancedCardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium text-sm">Unauthorized Data Access</div>
                        <div className="text-xs text-gray-500">Multiple attempts detected</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">High</div>
                      <div className="text-xs text-gray-500">2 days ago</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="font-medium text-sm">Late Audit Submission</div>
                        <div className="text-xs text-gray-500">Quarterly report overdue</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600">Medium</div>
                      <div className="text-xs text-gray-500">1 week ago</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium text-sm">Policy Violation</div>
                        <div className="text-xs text-gray-500">Data retention exceeded</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">Medium</div>
                      <div className="text-xs text-gray-500">3 days ago</div>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};