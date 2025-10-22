/**
 * Report Detail Component
 * Detailed view of a single report with locking, comments, and revisions
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Lock,
  Unlock,
  MessageSquare,
  History,
  Download,
  Edit,
  Archive,
  Users,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';

import { useReport, useReportLockStatus, useLockReport, useUnlockReport } from '@/hooks/use-reports';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ReportStatusBadge, PriorityBadge, LockStatusBadge } from '@/components/ui/enhanced-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Report, LockReportRequest, UnlockReportRequest } from '@/types/reports';

interface ReportDetailProps {
  reportId: string;
  onClose?: () => void;
  onEdit?: () => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({
  reportId,
  onClose,
  onEdit,
}) => {
  const [lockReason, setLockReason] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const { data: lockStatus } = useReportLockStatus(reportId);
  const lockMutation = useLockReport();
  const unlockMutation = useUnlockReport();

  const handleLock = async () => {
    if (!lockReason.trim()) return;

    try {
      await lockMutation.mutateAsync({
        id: reportId,
        data: { lock_reason: lockReason }
      });
      setLockReason('');
      setShowLockDialog(false);
    } catch (error) {
      console.error('Failed to lock report:', error);
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockMutation.mutateAsync({
        id: reportId,
        data: { unlock_reason: unlockReason }
      });
      setUnlockReason('');
      setShowUnlockDialog(false);
    } catch (error) {
      console.error('Failed to unlock report:', error);
    }
  };

  if (isLoading) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading report...</div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  if (error || !report) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <div className="text-red-500 mb-2">Failed to load report</div>
            <div className="text-gray-500 text-sm">{error?.message || 'Report not found'}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={report.title}
          description={report.description}
          action={
            <div className="flex items-center gap-2">
              <ReportStatusBadge status={report.status} />
              {report.priority && <PriorityBadge priority={report.priority} />}
              <LockStatusBadge
                isLocked={!!lockStatus?.is_locked}
                lockedBy={lockStatus?.locked_by_name}
              />
              <div className="flex items-center gap-1">
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </EnhancedButton>
                {lockStatus?.is_locked ? (
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnlockDialog(true)}
                    loading={unlockMutation.isPending}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock
                  </EnhancedButton>
                ) : (
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLockDialog(true)}
                    loading={lockMutation.isPending}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Lock
                  </EnhancedButton>
                )}
                <EnhancedButton variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </EnhancedButton>
              </div>
            </div>
          }
        />
        <EnhancedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Report Type</div>
              <div className="font-medium capitalize">
                {report.report_type.replace('_', ' ')}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Reporting Year</div>
              <div className="font-medium">{report.reporting_year}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Created By</div>
              <div className="font-medium">{report.created_by}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="font-medium">
                {format(new Date(report.updated_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Lock/Unlock Dialogs */}
      {showLockDialog && (
        <EnhancedCard>
          <EnhancedCardHeader title="Lock Report" />
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lock Reason</label>
              <Input
                placeholder="Reason for locking this report..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                Cancel
              </Button>
              <EnhancedButton
                onClick={handleLock}
                disabled={!lockReason.trim()}
                loading={lockMutation.isPending}
              >
                Lock Report
              </EnhancedButton>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {showUnlockDialog && (
        <EnhancedCard>
          <EnhancedCardHeader title="Unlock Report" />
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unlock Reason (Optional)</label>
              <Input
                placeholder="Reason for unlocking this report..."
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
                Cancel
              </Button>
              <EnhancedButton
                onClick={handleUnlock}
                loading={unlockMutation.isPending}
              >
                Unlock Report
              </EnhancedButton>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="revisions">
            <History className="mr-2 h-4 w-4" />
            Revisions
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Report Content */}
            <EnhancedCard>
              <EnhancedCardHeader title="Report Content" />
              <EnhancedCardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    Report content will be displayed here. This could include:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-600">
                    <li>Emissions calculations and summaries</li>
                    <li>Compliance requirements</li>
                    <li>Supporting documentation</li>
                    <li>Charts and visualizations</li>
                  </ul>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Metadata */}
            <EnhancedCard>
              <EnhancedCardHeader title="Report Information" />
              <EnhancedCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Priority</div>
                      {report.priority ? (
                        <PriorityBadge priority={report.priority} />
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
                      {report.due_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(report.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Last Updated</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(report.updated_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    {report.tags && report.tags.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {report.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
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

        <TabsContent value="revisions">
          <EnhancedCard>
            <EnhancedCardHeader title="Revision History" />
            <EnhancedCardContent>
              <div className="text-center py-8 text-gray-500">
                Revision tracking will be implemented here
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="activity">
          <EnhancedCard>
            <EnhancedCardHeader title="Recent Activity" />
            <EnhancedCardContent>
              <div className="text-center py-8 text-gray-500">
                Activity feed will be implemented here
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};