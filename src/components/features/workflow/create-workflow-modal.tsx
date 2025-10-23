/**
 * Create Workflow Modal Component
 * Modal dialog for creating new workflows
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { WorkflowCreateForm } from './workflow-create-form';

interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (workflowId: string) => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Set up a new approval workflow with multiple stages and approvers.
          </DialogDescription>
        </DialogHeader>

        <WorkflowCreateForm
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};