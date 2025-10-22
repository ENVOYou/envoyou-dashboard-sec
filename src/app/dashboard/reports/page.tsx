/**
 * Reports Management Page
 * Main page for the reports management system
 */

'use client';

import React, { useState } from 'react';
import { ReportsList } from '@/components/features/reports/reports-list';
import type { Report } from '@/types/reports';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    // TODO: Navigate to report detail page or open modal
    console.log('Selected report:', report);
  };

  const handleCreateReport = () => {
    // TODO: Open create report modal or navigate to create page
    console.log('Create new report');
  };

  return (
    <div className="container mx-auto py-6">
      <ReportsList
        onReportSelect={handleReportSelect}
        onCreateReport={handleCreateReport}
      />
    </div>
  );
}