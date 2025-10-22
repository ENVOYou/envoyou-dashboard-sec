// src/components/features/reports/report-comments.tsx
'use client';

import React from 'react';
import { Report } from '@/types/reports';
import { useAddComment } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';

interface ReportCommentsProps {
  report: Report;
}

export const ReportComments: React.FC<ReportCommentsProps> = ({ report }) => {
  const [newComment, setNewComment] = React.useState('');
  const addCommentMutation = useAddComment();
  const user = useAuthStore((state) => state.user);

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      addCommentMutation.mutate({ reportId: report.id, content: newComment });
      setNewComment('');
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Comments ({report.comments?.length || 0})</h3>
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
        {report.comments && report.comments.length > 0 ? (
          report.comments.map((comment) => (
            <div key={comment.id} className="p-2 border-b">
              <p className="font-semibold">{comment.author?.full_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-700">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
      <div>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2"
          disabled={!user}
        />
        <Button onClick={handleAddComment} size="sm" disabled={addCommentMutation.isPending || !newComment.trim()}>
          {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
        </Button>
        {addCommentMutation.isError && (
          <p className="text-red-600 text-sm mt-2">Error: {addCommentMutation.error.message}</p>
        )}
      </div>
    </div>
  );
};
