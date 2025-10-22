// src/components/features/reports/report-revisions.tsx
'use client';

import React from 'react';
import { Report } from '@/types/reports';

interface ReportRevisionsProps {
  report: Report;
}

export const ReportRevisions: React.FC<ReportRevisionsProps> = ({ report }) => {
  const revisions = report.revisions || [];

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Revision History ({revisions.length})</h3>
      {revisions.length > 0 ? (
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {revisions.map((revision) => (
            <li key={revision.id} className="border-b pb-2">
              <p className="text-sm">{revision.change_description}</p>
              <p className="text-xs text-gray-500 mt-1">
                By {revision.editor?.full_name || 'Unknown User'} on {new Date(revision.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No revision history.</p>
      )}
    </div>
  );
};
