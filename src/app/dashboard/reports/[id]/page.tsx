/**
 * Individual Report Detail Page
 * Shows detailed view of a single report with locking, comments, and revisions
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

import { ReportDetail } from '@/components/features/reports/report-detail';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import type { Report } from '@/types/reports';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const handleClose = () => {
    router.push('/dashboard/reports');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit report:', reportId);
  };

  if (!reportId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
          <p className="text-gray-500 mb-6">The requested report could not be found.</p>
          <Button onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
            <p className="text-gray-500">View and manage report details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnhancedButton variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Report
          </EnhancedButton>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Report Detail Component */}
      <ReportDetail
        reportId={reportId}
        onClose={handleClose}
        onEdit={handleEdit}
      />
    </div>
  );
}