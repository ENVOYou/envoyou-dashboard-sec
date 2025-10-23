/**
 * Report Activity Component
 * Displays recent activity feed for a report
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Activity,
  User,
  Clock,
  FileText,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Tag,
  Eye,
  Download,
  Archive,
  Trash2,
} from 'lucide-react';

import { useReportActivity } from '@/hooks/use-reports';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';
import type { ReportActivity } from '@/types/reports';

interface ReportActivityProps {
  reportId: string;
  className?: string;
}

interface ActivityItemProps {
  activity: ReportActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'unlocked':
        return <Unlock className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'downloaded':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'border-l-green-500';
      case 'updated':
        return 'border-l-blue-500';
      case 'locked':
        return 'border-l-orange-500';
      case 'unlocked':
        return 'border-l-blue-500';
      case 'approved':
        return 'border-l-green-500';
      case 'commented':
        return 'border-l-purple-500';
      case 'viewed':
        return 'border-l-gray-500';
      case 'downloaded':
        return 'border-l-blue-500';
      case 'archived':
        return 'border-l-gray-500';
      case 'deleted':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className={cn('flex gap-3 pb-4 border-l-2 pl-4', getActivityColor(activity.type))}>
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
          {getActivityIcon(activity.type)}
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
  );
};

export const ReportActivity: React.FC<ReportActivityProps> = ({
  reportId,
  className,
}) => {
  const { data: activities, isLoading, error } = useReportActivity(reportId, 50);

  if (error) {
    return (
      <EnhancedCard className={className}>
        <EnhancedCardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <div className="text-red-500 mb-1">Failed to load activity</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard className={className}>
      <EnhancedCardHeader
        title="Recent Activity"
        description="Latest actions and changes on this report"
      />
      <EnhancedCardContent>
        {isLoading ? (
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
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <div className="text-lg font-medium mb-2">No activity yet</div>
            <div className="text-sm">Activity will appear here as changes are made to this report.</div>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
};