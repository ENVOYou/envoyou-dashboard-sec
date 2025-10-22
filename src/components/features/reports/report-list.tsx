// src/components/features/reports/report-list.tsx
'use client';

import React from 'react';
import { useReports } from '@/hooks/use-reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Report } from '@/types/reports';

export const ReportList = () => {
  const { data, isLoading, isError, error } = useReports();

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  if (isError) {
    return <div>Error fetching reports: {error.message}</div>;
  }

  const reports = data?.items || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Report List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report: Report) => (
              <TableRow key={report.id}>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.report_type}</TableCell>
                <TableCell>{report.reporting_year}</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>{new Date(report.updated_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No reports found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
