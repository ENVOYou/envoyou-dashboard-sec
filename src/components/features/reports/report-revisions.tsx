/**
 * Report Revisions Component
 * Displays revision history with changes, timestamps, and user information
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  History,
  User,
  Clock,
  Eye,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Tag,
} from 'lucide-react';

import { useReportRevisions } from '@/hooks/use-reports';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ReportRevision } from '@/types/reports';

interface ReportRevisionsProps {
  reportId: string;
  className?: string;
}

interface RevisionItemProps {
  revision: ReportRevision;
  isExpanded: boolean;
  onToggle: () => void;
}

const RevisionItem: React.FC<RevisionItemProps> = ({
  revision,
  isExpanded,
  onToggle,
}) => {
  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'unlocked':
        return <Unlock className="h-4 w-4 text-blue-500" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'status_changed':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'updated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'locked':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'unlocked':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'commented':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'status_changed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatChanges = (changes: string) => {
    // Simple formatting for change descriptions
    return changes.split('. ').map((change, index) => (
      <li key={index} className="text-sm text-gray-600">
        {change.trim()}
        {index < changes.split('. ').length - 1 && '.'}
      </li>
    ));
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Revision Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          {getChangeTypeIcon(revision.change_type)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {revision.changes_summary}
              </span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full border font-medium',
                getChangeTypeColor(revision.change_type)
              )}>
                {revision.change_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {revision.user_name || 'Unknown User'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(revision.created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Revision Details */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-4">
            {/* Changes Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Changes Made</h4>
              <ul className="space-y-1">
                {formatChanges(revision.changes_summary)}
              </ul>
            </div>

            {/* Previous and New Values */}
            {revision.previous_values && revision.new_values && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {revision.previous_values && Object.keys(revision.previous_values).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Previous Values</h4>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <pre className="text-xs text-red-700 overflow-x-auto">
                        {JSON.stringify(revision.previous_values, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {revision.new_values && Object.keys(revision.new_values).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">New Values</h4>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <pre className="text-xs text-green-700 overflow-x-auto">
                        {JSON.stringify(revision.new_values, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            {revision.metadata && Object.keys(revision.metadata).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(revision.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ReportRevisions: React.FC<ReportRevisionsProps> = ({
  reportId,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(new Set());

  const { data: revisionsData, isLoading, error } = useReportRevisions(reportId);

  const handleToggleRevision = (revisionId: string) => {
    setExpandedRevisions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(revisionId)) {
        newSet.delete(revisionId);
      } else {
        newSet.add(revisionId);
      }
      return newSet;
    });
  };

  const filteredRevisions = revisionsData?.revisions.filter(revision => {
    const matchesSearch = searchTerm === '' ||
      revision.changes_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (revision.user_name && revision.user_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' || revision.change_type === filterType;

    return matchesSearch && matchesFilter;
  }) || [];

  if (error) {
    return (
      <EnhancedCard className={className}>
        <EnhancedCardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <div className="text-red-500 mb-1">Failed to load revisions</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters and Search */}
      <EnhancedCard>
        <EnhancedCardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search revisions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('created')}>
                  Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('updated')}>
                  Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('approved')}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('locked')}>
                  Locked
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('unlocked')}>
                  Unlocked
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('commented')}>
                  Commented
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('status_changed')}>
                  Status Changed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Revisions List */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={`Revision History (${filteredRevisions.length})`}
          description="Track all changes made to this report"
        />
        <EnhancedCardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRevisions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <div className="text-lg font-medium mb-2">No revisions found</div>
              <div className="text-sm">
                {searchTerm || filterType !== 'all'
                  ? 'No revisions match your current filters.'
                  : 'No revision history available for this report.'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRevisions.map((revision) => (
                <RevisionItem
                  key={revision.id}
                  revision={revision}
                  isExpanded={expandedRevisions.has(revision.id)}
                  onToggle={() => handleToggleRevision(revision.id)}
                />
              ))}
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};