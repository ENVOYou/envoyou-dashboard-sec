/**
 * Individual Workflow Detail Page
 * Shows detailed view of a single workflow with approval interface
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

import { WorkflowDetail } from '@/components/features/workflow/workflow-detail';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import type { Workflow } from '@/types/workflow';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const handleClose = () => {
    router.push('/dashboard/workflow');
  };

  const handleApprove = () => {
    // TODO: Handle approval success
    console.log('Workflow approved');
  };

  const handleReject = () => {
    // TODO: Handle rejection
    console.log('Workflow rejected');
  };

  if (!workflowId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Workflow Not Found</h1>
          <p className="text-gray-500 mb-6">The requested workflow could not be found.</p>
          <Button onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
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
            Back to Workflows
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Details</h1>
            <p className="text-gray-500">Review and manage workflow approval</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnhancedButton variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Workflow
          </EnhancedButton>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Workflow Detail Component */}
      <WorkflowDetail
        workflowId={workflowId}
        onClose={handleClose}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}