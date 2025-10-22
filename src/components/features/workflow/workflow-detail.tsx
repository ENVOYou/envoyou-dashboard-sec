/**
 * Workflow Detail Component
 * Detailed view of a single workflow with approval interface
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  History,
  Send,
  AlertTriangle,
  User,
  ArrowRight,
  FileText,
  Download,
} from 'lucide-react';

import { useWorkflow, useWorkflowApprovers, useApproveWorkflow } from '@/hooks/use-workflow';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ReportStatusBadge, PriorityBadge } from '@/components/ui/enhanced-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Workflow, ApprovalRequest } from '@/types/workflow';

interface WorkflowDetailProps {
  workflowId: string;
  onClose?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const WorkflowDetail: React.FC<WorkflowDetailProps> = ({
  workflowId,
  onClose,
  onApprove,
  onReject,
}) => {
  const [approvalComments, setApprovalComments] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const { data: workflow, isLoading, error } = useWorkflow(workflowId);
  const { data: approvers } = useWorkflowApprovers(workflowId);
  const approveMutation = useApproveWorkflow();

  const handleApproval = async (decision: 'approve' | 'reject') => {
    try {
      await approveMutation.mutateAsync({
        workflowId,
        data: {
          decision,
          comments: approvalComments,
        }
      });
      setApprovalComments('');
      setShowApprovalDialog(false);
      if (decision === 'approve') {
        onApprove?.();
      } else {
        onReject?.();
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getCurrentStageInfo = () => {
    if (!workflow || !approvers) return null;

    const currentApprovers = approvers.filter(a => a.stage === workflow.current_stage);
    return {
      stage: workflow.current_stage,
      totalStages: workflow.total_stages,
      approvers: currentApprovers,
      isPending: currentApprovers.some(a => a.status === 'pending'),
    };
  };

  if (isLoading) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading workflow...</div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  if (error || !workflow) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <div className="text-red-500 mb-2">Failed to load workflow</div>
            <div className="text-gray-500 text-sm">{error?.message || 'Workflow not found'}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  const stageInfo = getCurrentStageInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={workflow.title}
          description={workflow.description}
          action={
            <div className="flex items-center gap-2">
              <ReportStatusBadge status={workflow.status} />
              <PriorityBadge priority={workflow.priority} />
              <div className="flex items-center gap-1">
                <EnhancedButton
                  variant="success"
                  size="sm"
                  onClick={() => setShowApprovalDialog(true)}
                  disabled={!stageInfo?.isPending}
                  loading={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </EnhancedButton>
                <EnhancedButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleApproval('reject')}
                  disabled={!stageInfo?.isPending}
                  loading={approveMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </EnhancedButton>
              </div>
            </div>
          }
        />
        <EnhancedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Workflow Type</div>
              <div className="font-medium capitalize">
                {workflow.workflow_type.replace('_', ' ')}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Priority</div>
              <PriorityBadge priority={workflow.priority} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Created By</div>
              <div className="font-medium">{workflow.created_by_name || workflow.created_by}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Due Date</div>
              <div className="font-medium">
                {workflow.due_date
                  ? format(new Date(workflow.due_date), 'MMM d, yyyy')
                  : 'No due date'
                }
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <EnhancedCard>
          <EnhancedCardHeader title="Approve Workflow" />
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Comments (Optional)</label>
              <Textarea
                placeholder="Add comments about your approval decision..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <EnhancedButton
                variant="danger"
                onClick={() => handleApproval('reject')}
                loading={approveMutation.isPending}
              >
                Reject
              </EnhancedButton>
              <EnhancedButton
                onClick={() => handleApproval('approve')}
                loading={approveMutation.isPending}
              >
                Approve
              </EnhancedButton>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {/* Progress Overview */}
      <EnhancedCard>
        <EnhancedCardHeader title="Progress Overview" />
        <EnhancedCardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Stage {workflow.current_stage} of {workflow.total_stages}</span>
                <span>{Math.round((workflow.current_stage / workflow.total_stages) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(workflow.current_stage / workflow.total_stages) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Stage Info */}
            {stageInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Current Stage</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(workflow.status)}
                    <span>Stage {stageInfo.stage}: Approval Required</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">Pending Approvers</div>
                  <div className="space-y-1">
                    {stageInfo.approvers.map((approver) => (
                      <div key={approver.id} className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{approver.user_name || approver.user_id}</span>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs',
                          approver.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                          approver.status === 'approved' && 'bg-green-100 text-green-800',
                          approver.status === 'rejected' && 'bg-red-100 text-red-800'
                        )}>
                          {approver.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvers">
            <Users className="mr-2 h-4 w-4" />
            Approvers
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Workflow Details */}
            <EnhancedCard>
              <EnhancedCardHeader title="Workflow Information" />
              <EnhancedCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <ReportStatusBadge status={workflow.status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Priority</div>
                      <PriorityBadge priority={workflow.priority} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(workflow.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Last Updated</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(workflow.updated_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {workflow.due_date
                            ? format(new Date(workflow.due_date), 'MMM d, yyyy')
                            : 'No due date'
                          }
                        </span>
                      </div>
                    </div>
                    {workflow.due_date && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Time Remaining</div>
                        <div className="text-sm text-gray-600">
                          {/* Calculate time remaining logic would go here */}
                          Calculated dynamically
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Attachments */}
            {workflow.attachments && workflow.attachments.length > 0 && (
              <EnhancedCard>
                <EnhancedCardHeader title="Attachments" />
                <EnhancedCardContent>
                  <div className="space-y-2">
                    {workflow.attachments.map((attachment) => (
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
                </EnhancedCardContent>
              </EnhancedCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approvers">
          <EnhancedCard>
            <EnhancedCardHeader title="Approval Chain" />
            <EnhancedCardContent>
              <div className="space-y-4">
                {Array.from({ length: workflow.total_stages }, (_, i) => i + 1).map((stage) => {
                  const stageApprovers = approvers?.filter(a => a.stage === stage) || [];
                  const isCurrentStage = stage === workflow.current_stage;
                  const isCompleted = stage < workflow.current_stage;

                  return (
                    <div
                      key={stage}
                      className={cn(
                        'flex items-center gap-4 p-4 border rounded-lg',
                        isCurrentStage && 'border-blue-200 bg-blue-50',
                        isCompleted && 'border-green-200 bg-green-50'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : isCurrentStage ? (
                          <Clock className="h-6 w-6 text-blue-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Stage {stage}</div>
                        <div className="text-sm text-gray-500">
                          {stageApprovers.length} approver{stageApprovers.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {stageApprovers.map((approver) => (
                          <div key={approver.id} className="text-sm">
                            <div className="font-medium">{approver.user_name}</div>
                            <div className={cn(
                              'text-xs px-2 py-1 rounded-full',
                              approver.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                              approver.status === 'approved' && 'bg-green-100 text-green-800',
                              approver.status === 'rejected' && 'bg-red-100 text-red-800'
                            )}>
                              {approver.status}
                            </div>
                          </div>
                        ))}
                      </div>
                      {isCurrentStage && (
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="comments">
          <EnhancedCard>
            <EnhancedCardHeader title="Comments & Discussion" />
            <EnhancedCardContent>
              <div className="text-center py-8 text-gray-500">
                Comments system will be implemented here
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="history">
          <EnhancedCard>
            <EnhancedCardHeader title="Approval History" />
            <EnhancedCardContent>
              <div className="text-center py-8 text-gray-500">
                Approval history will be implemented here
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};