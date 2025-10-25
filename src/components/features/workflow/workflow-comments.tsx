/**
 * Workflow Comments Component
 * Handles displaying, adding, and managing workflow comments by stage
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare,
  Reply,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Hash,
} from 'lucide-react';

import { useWorkflowComments, useAddWorkflowComment } from '@/hooks/use-workflow';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { WorkflowComment, WorkflowCommentCreate } from '@/types/workflow';

interface WorkflowCommentsProps {
  workflowId: string;
  className?: string;
}

interface CommentItemProps {
  comment: WorkflowComment;
  workflowId: string;
  onReply?: (parentId: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  workflowId,
  onReply,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const addCommentMutation = useAddWorkflowComment();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        workflowId,
        data: {
          content: replyContent,
          comment_type: 'comment',
          is_internal: comment.is_internal,
          stage: comment.stage,
        },
      });
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'approval_note':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejection_reason':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'escalation_note':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVisibilityBadge = (isInternal: boolean) => {
    return isInternal ? (
      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
        Internal
      </span>
    ) : (
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
        Public
      </span>
    );
  };

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-8 border-l-2 border-gray-100 pl-4')}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.user_name || 'Unknown User'}
            </span>
            {comment.user_role && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {comment.user_role}
              </span>
            )}
            {getVisibilityBadge(comment.is_internal)}
            <span className="text-xs text-gray-500">
              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
            </span>
            {getCommentTypeIcon(comment.comment_type)}
            {comment.stage && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Stage {comment.stage}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-700 mb-2">
            {comment.content}
          </div>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Paperclip className="h-3 w-3" />
                Attachments:
              </div>
              <div className="flex flex-wrap gap-1">
                {comment.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachment.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs h-7 px-2"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Like
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Issue
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Flag className="mr-2 h-4 w-4" />
                  Delete Comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2 text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <EnhancedButton
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  loading={addCommentMutation.isPending}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </EnhancedButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const WorkflowComments: React.FC<WorkflowCommentsProps> = ({
  workflowId,
  className,
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'approval_note' | 'rejection_reason' | 'escalation_note'>('comment');
  const [isInternal, setIsInternal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | undefined>();

  const addCommentMutation = useAddWorkflowComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        workflowId,
        data: {
          content: newComment,
          comment_type: commentType,
          is_internal: isInternal,
          stage: selectedStage,
        },
      });
      setNewComment('');
      setCommentType('comment');
      setIsInternal(false);
      setSelectedStage(undefined);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Add Comment Form */}
      <EnhancedCard>
        <EnhancedCardHeader title="Add Comment" />
        <EnhancedCardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={commentType === 'comment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('comment')}
            >
              Comment
            </Button>
            <Button
              variant={commentType === 'approval_note' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('approval_note')}
            >
              Approval Note
            </Button>
            <Button
              variant={commentType === 'rejection_reason' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('rejection_reason')}
            >
              Rejection Reason
            </Button>
            <Button
              variant={commentType === 'escalation_note' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('escalation_note')}
            >
              Escalation Note
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={!isInternal ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsInternal(false)}
            >
              Public
            </Button>
            <Button
              variant={isInternal ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsInternal(true)}
            >
              Internal
            </Button>
          </div>

          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isInternal ? 'Internal comments are only visible to workflow approvers' : 'Public comments are visible to all users'}
            </div>
            <EnhancedButton
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              loading={addCommentMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Add Comment
            </EnhancedButton>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Comments by Stage Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Comments</TabsTrigger>
          <TabsTrigger value="stage1">Stage 1</TabsTrigger>
          <TabsTrigger value="stage2">Stage 2</TabsTrigger>
          <TabsTrigger value="stage3">Stage 3</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CommentsList workflowId={workflowId} />
        </TabsContent>

        {[1, 2, 3].map((stage) => (
          <TabsContent key={stage} value={`stage${stage}`}>
            <CommentsList workflowId={workflowId} stageFilter={stage} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface CommentsListProps {
  workflowId: string;
  stageFilter?: number;
}

const CommentsList: React.FC<CommentsListProps> = ({ workflowId, stageFilter }) => {
  const { data: comments, isLoading, error } = useWorkflowComments(workflowId, stageFilter);

  if (error) {
    return (
      <EnhancedCard>
        <EnhancedCardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <div className="text-red-500 mb-1">Failed to load comments</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard>
      <EnhancedCardHeader title={`Comments ${stageFilter ? `(Stage ${stageFilter})` : '(All Stages)'}`} />
      <EnhancedCardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                workflowId={workflowId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <div className="text-lg font-medium mb-2">No comments yet</div>
            <div className="text-sm">Be the first to leave a comment on this workflow.</div>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
};