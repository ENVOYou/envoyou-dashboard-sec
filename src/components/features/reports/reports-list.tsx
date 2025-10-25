/**
 * Reports List Component
 * Main interface for viewing and managing reports
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Lock,
  Unlock,
  MessageSquare,
  History,
  Download,
  Archive,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

import { useReports } from '@/hooks/use-reports';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ReportStatusBadge, PriorityBadge, LockStatusBadge } from '@/components/ui/enhanced-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Report } from '@/types/reports';

interface ReportsListProps {
  onReportSelect?: (report: Report) => void;
  onCreateReport?: () => void;
  filters?: {
    status?: string[];
    report_type?: string[];
    company_id?: string;
    search?: string;
  };
}

export const ReportsList: React.FC<ReportsListProps> = ({
  onReportSelect,
  onCreateReport,
  filters = {},
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const { data: reportsData, isLoading, error } = useReports({
    ...filters,
    search: searchTerm,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleReportClick = (report: Report) => {
    onReportSelect?.(report);
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reportsData?.reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reportsData?.reports.map(r => r.id) || []);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  if (error) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load reports</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            Manage and track your SEC climate disclosure reports
          </p>
        </div>
        <EnhancedButton onClick={onCreateReport}>
          <Plus className="mr-2 h-4 w-4" />
          Create Report
        </EnhancedButton>
      </div>

      {/* Search and Filters */}
      <EnhancedCard>
        <EnhancedCardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
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

      {/* Reports Table */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={`Reports (${reportsData?.total_count || 0})`}
          action={
            selectedReports.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedReports.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            )
          }
        />
        <EnhancedCardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reportsData?.reports.length && reportsData.reports.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-48 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-16 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-16 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-32 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-12 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-8 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : reportsData?.reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="text-gray-500">
                      No reports found. Create your first report to get started.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reportsData?.reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className={cn(
                      'cursor-pointer hover:bg-gray-50 transition-colors',
                      selectedReports.includes(report.id) && 'bg-blue-50'
                    )}
                    onClick={() => handleReportClick(report)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {report.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <LockStatusBadge
                            isLocked={!!report.locked_by}
                            lockedBy={report.locked_by}
                          />
                          {report.description && (
                            <span className="text-xs text-gray-500 truncate max-w-xs">
                              {report.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 capitalize">
                        {report.report_type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ReportStatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      {report.priority && (
                        <PriorityBadge priority={report.priority} />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        Company {report.company_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {report.reporting_year}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {format(new Date(report.updated_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleReportClick(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comments
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="mr-2 h-4 w-4" />
                            Revisions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};