/**
 * Workflow Management Page
 * Main page for the workflow and approval system
 */

'use client';

import React, { useState } from 'react';
import { WorkflowList } from '@/components/features/workflow/workflow-list';
import type { Workflow } from '@/types/workflow';

export default function WorkflowPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    // TODO: Navigate to workflow detail page or open modal
    console.log('Selected workflow:', workflow);
  };

  const handleCreateWorkflow = () => {
    // TODO: Open create workflow modal or navigate to create page
    console.log('Create new workflow');
  };

  return (
    <div className="container mx-auto py-6">
      <WorkflowList
        onWorkflowSelect={handleWorkflowSelect}
        onCreateWorkflow={handleCreateWorkflow}
        showPendingOnly={showPendingOnly}
      />
    </div>
  );
}