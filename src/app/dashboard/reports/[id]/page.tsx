// src/app/dashboard/reports/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useReport } from '@/hooks/use-reports';
import { ReportLockControl } from '@/components/features/reports/report-lock-control';
import { ReportComments } from '@/components/features/reports/report-comments';
import { ReportRevisions } from '@/components/features/reports/report-revisions';

const ReportDetailPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // Ensure id is a string before passing it to the hook
  const { data: report, isLoading, isError, error } = useReport(id || '');

  if (isLoading) {
    return <div>Loading report details...</div>;
  }

  if (isError) {
    return <div>Error fetching report: {error.message}</div>;
  }

  if (!report) {
    return <div>Report not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">{report.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Details</h3>
            <div className="space-y-2">
              <p><strong>ID:</strong> {report.id}</p>
              <p><strong>Type:</strong> {report.report_type}</p>
              <p><strong>Year:</strong> {report.reporting_year}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Last Updated:</strong> {new Date(report.updated_at).toLocaleString()}</p>
            </div>
          </div>
          <ReportComments report={report} />
        </div>

        <div className="space-y-6">
          <ReportLockControl report={report} />
          <ReportRevisions report={report} />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
