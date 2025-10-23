/**
 * Report Comments Component
 * Handles displaying, adding, and managing report comments with threading support
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
} from 'lucide-react';

import { useReportComments, useAddComment, useResolveComment, useDeleteComment } from '@/hooks/use-reports';
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
import { cn } from '@/lib/utils';
import type { ReportComment, CommentCreate } from '@/types/reports';

interface ReportCommentsProps {
  reportId: string;
  className?: string;
}

interface CommentItemProps {
  comment: ReportComment;
  reportId: string;
  onReply?: (parentId: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  reportId,
  onReply,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const resolveMutation = useResolveComment();
  const deleteMutation = useDeleteComment();
  const addCommentMutation = useAddComment();

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync({ reportId, commentId: comment.id });
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteMutation.mutateAsync({ reportId, commentId: comment.id });
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        reportId,
        data: {
          content: replyContent,
          comment_type: 'comment',
          parent_id: comment.id,
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
      case 'question':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'suggestion':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600';
      case 'closed':
        return 'text-gray-500';
      default:
        return 'text-blue-600';
    }
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
            <span className="text-xs text-gray-500">
              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
            </span>
            {getCommentTypeIcon(comment.comment_type)}
            <span className={cn('text-xs font-medium', getStatusColor(comment.status))}>
              {comment.status.toUpperCase()}
            </span>
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

            {comment.status === 'open' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className="text-xs h-7 px-2 text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleResolve} disabled={comment.status !== 'open'}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Issue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
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

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              reportId={reportId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ReportComments: React.FC<ReportCommentsProps> = ({
  reportId,
  className,
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'question' | 'issue' | 'suggestion'>('comment');

  const { data: commentsData, isLoading, error } = useReportComments(reportId);
  const addCommentMutation = useAddComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        reportId,
        data: {
          content: newComment,
          comment_type: commentType,
        },
      });
      setNewComment('');
      setCommentType('comment');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (error) {
    return (
      <EnhancedCard className={className}>
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
              variant={commentType === 'question' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('question')}
            >
              Question
            </Button>
            <Button
              variant={commentType === 'issue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('issue')}
            >
              Issue
            </Button>
            <Button
              variant={commentType === 'suggestion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCommentType('suggestion')}
            >
              Suggestion
            </Button>
          </div>

          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end">
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

      {/* Comments List */}
      <EnhancedCard>
        <EnhancedCardHeader
          title={`Comments (${commentsData?.total_count || 0})`}
          description={`${commentsData?.unresolved_count || 0} unresolved`}
        />
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
          ) : commentsData?.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <div className="text-lg font-medium mb-2">No comments yet</div>
              <div className="text-sm">Be the first to leave a comment on this report.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {commentsData?.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  reportId={reportId}
                />
              ))}
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};