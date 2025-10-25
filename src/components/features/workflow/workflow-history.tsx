/**
 * Workflow Approval History Component
 * Displays approval history and decision trail for workflows
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  History,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
} from 'lucide-react';

import { useWorkflowApprovals, useWorkflowActivity } from '@/hooks/use-workflow';
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
import type { WorkflowApprover } from '@/types/workflow';

interface WorkflowHistoryProps {
  workflowId: string;
  className?: string;
}

interface HistoryItemProps {
  approver: WorkflowApprover;
  isExpanded: boolean;
  onToggle: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  approver,
  isExpanded,
  onToggle,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'escalated':
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'escalated':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getDecisionIcon = (decision?: string) => {
    switch (decision) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'escalate':
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* History Header */}
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
          {getStatusIcon(approver.status)}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {approver.user_name || approver.user_id}
              </span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full border font-medium',
                getStatusColor(approver.status)
              )}>
                {approver.status.toUpperCase()}
              </span>
              {approver.decision && (
                <span className="text-xs text-gray-500">
                  {approver.decision}d
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Stage {approver.stage}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {approver.responded_at
                  ? format(new Date(approver.responded_at), 'MMM d, yyyy h:mm a')
                  : format(new Date(approver.assigned_at), 'MMM d, yyyy h:mm a')
                }
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

      {/* History Details */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-4">
            {/* Decision Details */}
            {approver.decision && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Decision</h4>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {getDecisionIcon(approver.decision)}
                  <span className="font-medium capitalize">
                    {approver.decision}d
                  </span>
                  {approver.escalation_reason && (
                    <span className="text-sm text-gray-600">
                      - {approver.escalation_reason}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            {approver.comments && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {approver.comments}
                  </p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {approver.attachments && approver.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {approver.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{attachment.file_name}</div>
                          <div className="text-sm text-gray-500">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Time */}
            {approver.responded_at && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
                <div className="text-sm text-gray-600">
                  Responded {format(new Date(approver.responded_at), 'MMM d, yyyy h:mm a')}
                  {(() => {
                    const assignedTime = new Date(approver.assigned_at).getTime();
                    const respondedTime = new Date(approver.responded_at).getTime();
                    const diffHours = Math.round((respondedTime - assignedTime) / (1000 * 60 * 60));
                    return ` (${diffHours} hours after assignment)`;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({
  workflowId,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: approvals, isLoading: approvalsLoading, error: approvalsError } = useWorkflowApprovals(workflowId);
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useWorkflowActivity(workflowId, 50);

  const handleToggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const filteredApprovals = approvals?.approvals.filter(approval => {
    const matchesSearch = searchTerm === '' ||
      (approval.approver_name && approval.approver_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterStatus === 'all' || approval.decision === filterStatus;

    return matchesSearch && matchesFilter;
  }) || [];

  if (approvalsError || activitiesError) {
    return (
      <EnhancedCard className={className}>
        <EnhancedCardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <div className="text-red-500 mb-1">Failed to load history</div>
            <div className="text-gray-500 text-sm">
              {approvalsError?.message || activitiesError?.message}
            </div>
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
                placeholder="Search approval history..."
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
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Decisions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('approve')}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('reject')}>
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('escalate')}>
                  Escalated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Approval History */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={`Approval History (${filteredApprovals.length})`}
          description="Complete trail of all approval decisions and actions"
        />
        <EnhancedCardContent>
          {approvalsLoading ? (
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
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <div className="text-lg font-medium mb-2">No approval history</div>
              <div className="text-sm">
                {searchTerm || filterStatus !== 'all'
                  ? 'No approvals match your current filters.'
                  : 'Approval history will appear here as decisions are made.'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((approval, index) => (
                <HistoryItem
                  key={`${approval.stage}-${approval.approver_id}-${index}`}
                  approver={{
                    id: `${approval.stage}-${approval.approver_id}-${index}`,
                    workflow_id: workflowId,
                    user_id: approval.approver_id,
                    user_name: approval.approver_name,
                    stage: approval.stage,
                    status: approval.decision === 'approve' ? 'approved' :
                           approval.decision === 'reject' ? 'rejected' : 'pending',
                    assigned_at: approval.approved_at,
                    responded_at: approval.approved_at,
                    comments: approval.comments,
                    decision: approval.decision as 'approve' | 'reject' | 'escalate',
                    attachments: approval.attachments,
                  }}
                  isExpanded={expandedItems.has(`${approval.stage}-${approval.approver_id}-${index}`)}
                  onToggle={() => handleToggleItem(`${approval.stage}-${approval.approver_id}-${index}`)}
                />
              ))}
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Activity Timeline */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Activity Timeline"
          description="Chronological view of all workflow activities"
        />
        <EnhancedCardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 pb-4 border-l-2 border-gray-200 pl-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-l-2 border-l-blue-500 pl-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {activity.user_name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {activity.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <div className="text-lg font-medium mb-2">No activity yet</div>
              <div className="text-sm">Activity will appear here as the workflow progresses.</div>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};