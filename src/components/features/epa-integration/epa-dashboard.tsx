/**
 * EPA Integration Dashboard Component
 * Main dashboard for EPA data integration, GHGRP facilities, and compliance monitoring
 */

'use client';

import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Settings,
  Search,
  Filter,
  Building,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Factory,
  Globe,
  BarChart3,
  Calendar,
  Target,
  Activity,
  Eye,
} from 'lucide-react';

import { useEPADashboard, useEPACacheStatus, useEPAFactors } from '@/hooks/use-epa-integration';
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
import type { EPADashboardStats, EPACacheStatus, EPAFactor } from '@/types/epa-integration';

interface EPADashboardProps {
  onFacilitySelect?: (facilityId: string) => void;
  onViewFactors?: () => void;
  onViewCompliance?: () => void;
  onRefreshData?: () => void;
}

export const EPADashboard: React.FC<EPADashboardProps> = ({
  onFacilitySelect,
  onViewFactors,
  onViewCompliance,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: dashboardStats, isLoading, error, refetch } = useEPADashboard();
  const { data: cacheStatus } = useEPACacheStatus();
  const { data: factors } = useEPAFactors();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load EPA dashboard</div>
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
          <h1 className="text-2xl font-bold text-gray-900">EPA Integration</h1>
          <p className="text-gray-500 mt-1">
            Monitor EPA data integration, GHGRP facilities, and regulatory compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnhancedButton variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </EnhancedButton>
          <EnhancedButton variant="outline" onClick={onRefreshData}>
            <Database className="mr-2 h-4 w-4" />
            Sync Data
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
                placeholder="Search facilities, companies, locations..."
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

      {/* Cache Status */}
      <EnhancedCard>
        <EnhancedCardHeader title="Data Cache Status" />
        <EnhancedCardContent>
          {cacheStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cacheStatus.total_factors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Factors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStatus.last_refresh ? new Date(cacheStatus.last_refresh).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-gray-500">Last Refresh</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cacheStatus.cache_size.toLocaleString()} KB
                </div>
                <div className="text-sm text-gray-500">Cache Size</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  'text-2xl font-bold',
                  cacheStatus.refresh_status === 'completed' && 'text-green-600',
                  cacheStatus.refresh_status === 'running' && 'text-blue-600',
                  cacheStatus.refresh_status === 'failed' && 'text-red-600'
                )}>
                  {cacheStatus.refresh_status === 'completed' && <CheckCircle className="inline h-6 w-6" />}
                  {cacheStatus.refresh_status === 'running' && <RefreshCw className="inline h-6 w-6 animate-spin" />}
                  {cacheStatus.refresh_status === 'failed' && <AlertTriangle className="inline h-6 w-6" />}
                  {!cacheStatus.refresh_status && <Clock className="inline h-6 w-6" />}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading cache status...
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.total_facilities?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">GHGRP registered facilities</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.total_emissions ? (dashboardStats.total_emissions / 1000000).toFixed(1) : '0.0'}M
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Factory className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Metric tons CO2e</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.compliance_status?.compliant_companies || 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Companies compliant</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Quality</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.data_quality?.average_score?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Average quality score</span>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="factors">Emission Factors</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions by Sector */}
            <EnhancedCard>
              <EnhancedCardHeader
                title="Emissions by Sector"
                action={
                  <EnhancedButton variant="outline" size="sm" onClick={onViewFactors}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Details
                  </EnhancedButton>
                }
              />
              <EnhancedCardContent>
                {dashboardStats?.emissions_by_sector ? (
                  <div className="space-y-4">
                    {Object.entries(dashboardStats.emissions_by_sector).map(([sector, emissions]) => (
                      <div key={sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Factory className="h-4 w-4 text-gray-400" />
                          <span className="font-medium capitalize">{sector.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(emissions / Math.max(...Object.values(dashboardStats.emissions_by_sector))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            {(emissions / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No sector data available
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Top Emitters */}
            <EnhancedCard>
              <EnhancedCardHeader title="Top Emitting Facilities" />
              <EnhancedCardContent>
                {dashboardStats?.top_emitters ? (
                  <div className="space-y-3">
                    {dashboardStats.top_emitters.slice(0, 5).map((facility) => (
                      <div
                        key={facility.facility_id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onFacilitySelect?.(facility.facility_id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">#{facility.rank}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{facility.facility_name}</div>
                            <div className="text-sm text-gray-500">{facility.parent_company}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {(facility.total_emissions / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-xs text-gray-500">tons CO2e</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No facility data available
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Geographic Distribution */}
          <EnhancedCard className="mt-6">
            <EnhancedCardHeader title="Emissions by State" />
            <EnhancedCardContent>
              {dashboardStats?.emissions_by_sector ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(dashboardStats.emissions_by_sector).map(([state, emissions]) => (
                    <div key={state} className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {(emissions / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-500">{state}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No geographic data available
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="facilities">
          <EnhancedCard>
            <EnhancedCardHeader
              title="GHGRP Facilities"
              action={
                <EnhancedButton variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export List
                </EnhancedButton>
              }
            />
            <EnhancedCardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Emissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardStats?.top_emitters?.slice(0, 10).map((facility) => (
                    <TableRow
                      key={facility.facility_id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onFacilitySelect?.(facility.facility_id)}
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {facility.facility_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {facility.parent_company}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>Location</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          Industry Sector
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {(facility.total_emissions / 1000000).toFixed(1)}M
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status="verified" />
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

        <TabsContent value="factors">
          <EnhancedCard>
            <EnhancedCardHeader
              title="Emission Factors"
              action={
                <EnhancedButton variant="outline" size="sm" onClick={onViewFactors}>
                  <Database className="mr-2 h-4 w-4" />
                  Manage Factors
                </EnhancedButton>
              }
            />
            <EnhancedCardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factor Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>CO2 Factor</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factors?.slice(0, 10).map((factor) => (
                    <TableRow key={factor.id}>
                      <TableCell>
                        <span className="font-medium">{factor.factor_code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 capitalize">
                          {factor.category.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {factor.fuel_type || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {factor.co2_factor.toFixed(3)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {factor.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {factor.source}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(factor.last_updated).toLocaleDateString()}
                        </span>
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
                        <div className="font-medium">Compliant Companies</div>
                        <div className="text-sm text-gray-500">Meeting all requirements</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {dashboardStats?.compliance_status?.compliant_companies || 0}
                      </div>
                      <div className="text-xs text-gray-500">companies</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">Non-Compliant</div>
                        <div className="text-sm text-gray-500">Require attention</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">
                        {dashboardStats?.compliance_status?.non_compliant_companies || 0}
                      </div>
                      <div className="text-xs text-gray-500">companies</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Pending Submissions</div>
                        <div className="text-sm text-gray-500">Awaiting submission</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {dashboardStats?.compliance_status?.pending_submissions || 0}
                      </div>
                      <div className="text-xs text-gray-500">reports</div>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader title="Upcoming Deadlines" />
              <EnhancedCardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-sm">GHGRP Annual Report</div>
                        <div className="text-xs text-gray-500">Due March 31, 2025</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">15</div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium text-sm">TRI Report</div>
                        <div className="text-xs text-gray-500">Due July 1, 2025</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">102</div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium text-sm">EIS Submission</div>
                        <div className="text-xs text-gray-500">Due December 15, 2025</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">320</div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard>
              <EnhancedCardHeader title="Emissions Trends" />
              <EnhancedCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Current Year</div>
                        <div className="text-sm text-gray-500">2024 Emissions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {dashboardStats?.emissions_trends?.current_year?.toFixed(1) || '0.0'}M
                      </div>
                      <div className="text-xs text-gray-500">tons CO2e</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        {getTrendIcon(dashboardStats?.emissions_trends?.trend_direction || 'stable')}
                      </div>
                      <div>
                        <div className="font-medium">Year-over-Year Change</div>
                        <div className="text-sm text-gray-500">Compared to 2023</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'text-lg font-bold',
                        (dashboardStats?.emissions_trends?.change_percentage || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      )}>
                        {(dashboardStats?.emissions_trends?.change_percentage || 0) > 0 ? '+' : ''}
                        {dashboardStats?.emissions_trends?.change_percentage?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {dashboardStats?.emissions_trends?.trend_direction || 'stable'}
                      </div>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader title="Data Quality Metrics" />
              <EnhancedCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Quality</span>
                    <span className="text-sm font-bold text-green-600">
                      {dashboardStats?.data_quality?.high_quality || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${((dashboardStats?.data_quality?.high_quality || 0) / (dashboardStats?.total_facilities || 1)) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medium Quality</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {dashboardStats?.data_quality?.medium_quality || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${((dashboardStats?.data_quality?.medium_quality || 0) / (dashboardStats?.total_facilities || 1)) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Quality</span>
                    <span className="text-sm font-bold text-red-600">
                      {dashboardStats?.data_quality?.low_quality || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${((dashboardStats?.data_quality?.low_quality || 0) / (dashboardStats?.total_facilities || 1)) * 100}%`
                      }}
                    />
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