/**
 * Reports Management Page
 * Main page for the reports management system
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReportsList } from '@/components/features/reports/reports-list';
import { CreateReportModal } from '@/components/features/reports/create-report-modal';
import type { Report } from '@/types/reports';

export default function ReportsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleReportSelect = (report: Report) => {
    // Navigate to individual report detail page
    router.push(`/dashboard/reports/${report.id}`);
  };

  const handleCreateReport = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (reportId: string) => {
    setShowCreateModal(false);
    router.push(`/dashboard/reports/${reportId}`);
  };

  const handleCreateClose = () => {
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <ReportsList
          onReportSelect={handleReportSelect}
          onCreateReport={handleCreateReport}
        />
      </div>

      <CreateReportModal
        open={showCreateModal}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}