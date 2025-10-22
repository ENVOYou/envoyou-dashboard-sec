/**
 * Workflow List Component
 * Main interface for viewing and managing workflows
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  ArrowUp,
} from 'lucide-react';

import { useWorkflows, usePendingApprovals } from '@/hooks/use-workflow';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ReportStatusBadge, PriorityBadge } from '@/components/ui/enhanced-badge';
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
import type { Workflow, WorkflowFilters, WorkflowSummary } from '@/types/workflow';

interface WorkflowListProps {
  onWorkflowSelect?: (workflow: Workflow) => void;
  onCreateWorkflow?: () => void;
  filters?: WorkflowFilters;
  showPendingOnly?: boolean;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  onWorkflowSelect,
  onCreateWorkflow,
  filters = {},
  showPendingOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  const { data: workflowsData, isLoading, error } = useWorkflows({
    ...filters,
    search: searchTerm,
  });

  const { data: pendingData } = usePendingApprovals();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const isWorkflowSummary = (item: Workflow | WorkflowSummary): item is WorkflowSummary => {
    return 'pending_approvals' in item;
  };

  const handleWorkflowClick = (workflow: Workflow | WorkflowSummary) => {
    if (isWorkflowSummary(workflow)) {
      // Convert WorkflowSummary to Workflow for consistency
      const workflowData = {
        ...workflow,
        description: '',
        assigned_users: [],
        approvers: [],
        attachments: [],
        metadata: {},
        updated_at: workflow.created_at, // Use created_at as fallback
      } as unknown as Workflow;
      onWorkflowSelect?.(workflowData);
    } else {
      onWorkflowSelect?.(workflow);
    }
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === workflowsData?.workflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(workflowsData?.workflows.map(w => w.id) || []);
    }
  };

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate?: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    return daysUntilDue !== null && daysUntilDue < 0;
  };

  if (error) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load workflows</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  const displayWorkflows = showPendingOnly
    ? pendingData?.workflows || []
    : workflowsData?.workflows || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showPendingOnly ? 'Pending Approvals' : 'Workflows'}
          </h1>
          <p className="text-gray-500 mt-1">
            {showPendingOnly
              ? 'Review and approve pending workflow requests'
              : 'Manage and track approval workflows'
            }
          </p>
        </div>
        {!showPendingOnly && (
          <EnhancedButton onClick={onCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </EnhancedButton>
        )}
      </div>

      {/* Search and Filters */}
      <EnhancedCard>
        <EnhancedCardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workflows..."
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

      {/* Workflows Table */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={`Workflows (${displayWorkflows.length})`}
          action={
            selectedWorkflows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedWorkflows.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Bulk Approve
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
                    checked={selectedWorkflows.length === displayWorkflows.length && displayWorkflows.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
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
                    <TableCell><div className="w-24 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-8 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : displayWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="text-gray-500">
                      {showPendingOnly
                        ? 'No pending approvals. Great job!'
                        : 'No workflows found. Create your first workflow to get started.'
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayWorkflows.map((workflow) => {
                  const daysUntilDue = getDaysUntilDue(workflow.due_date);
                  const overdue = isOverdue(workflow.due_date);

                  return (
                    <TableRow
                      key={workflow.id}
                      className={cn(
                        'cursor-pointer hover:bg-gray-50 transition-colors',
                        selectedWorkflows.includes(workflow.id) && 'bg-blue-50'
                      )}
                      onClick={() => handleWorkflowClick(workflow)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedWorkflows.includes(workflow.id)}
                          onChange={() => handleSelectWorkflow(workflow.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {workflow.title}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(workflow.status)}
                            <span className="text-xs text-gray-500">
                              {isWorkflowSummary(workflow) ? workflow.pending_approvals || 0 : 0} pending
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 capitalize">
                          {workflow.workflow_type.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={workflow.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={workflow.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            Stage {workflow.current_stage} of {workflow.total_stages}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((workflow.current_stage / workflow.total_stages) * 100)}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {workflow.due_date ? (
                          <div className={cn(
                            'text-sm',
                            overdue ? 'text-red-600 font-medium' : 'text-gray-600'
                          )}>
                            <div className="flex items-center gap-1">
                              {overdue && <AlertTriangle className="h-3 w-3" />}
                              {format(new Date(workflow.due_date), 'MMM d, yyyy')}
                            </div>
                            {daysUntilDue !== null && (
                              <div className={cn(
                                'text-xs',
                                overdue ? 'text-red-500' : 'text-gray-500'
                              )}>
                                {overdue
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : daysUntilDue === 0
                                    ? 'Due today'
                                    : `${daysUntilDue} days left`
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {format(new Date(workflow.created_at), 'MMM d, yyyy')}
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
                            <DropdownMenuItem onClick={() => handleWorkflowClick(workflow)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Approvers
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowUp className="mr-2 h-4 w-4" />
                              Escalate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};