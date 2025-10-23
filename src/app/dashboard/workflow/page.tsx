/**
 * Workflow Management Page
 * Main page for the workflow and approval system
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowList } from '@/components/features/workflow/workflow-list';
import { CreateWorkflowModal } from '@/components/features/workflow/create-workflow-modal';
import type { Workflow } from '@/types/workflow';

export default function WorkflowPage() {
  const router = useRouter();
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleWorkflowSelect = (workflow: Workflow) => {
    // Navigate to individual workflow detail page
    router.push(`/dashboard/workflow/${workflow.id}`);
  };

  const handleCreateWorkflow = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (workflowId: string) => {
    setShowCreateModal(false);
    router.push(`/dashboard/workflow/${workflowId}`);
  };

  const handleCreateClose = () => {
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <WorkflowList
          onWorkflowSelect={handleWorkflowSelect}
          onCreateWorkflow={handleCreateWorkflow}
          showPendingOnly={showPendingOnly}
        />
      </div>

      <CreateWorkflowModal
        open={showCreateModal}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}