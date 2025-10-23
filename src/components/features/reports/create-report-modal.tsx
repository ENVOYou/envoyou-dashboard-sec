/**
 * Create Report Modal Component
 * Modal dialog for creating new reports
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

import { ReportCreateForm } from './report-create-form';

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (reportId: string) => void;
  preselectedCompanyId?: string;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  open,
  onClose,
  onSuccess,
  preselectedCompanyId,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>
            Set up a new climate disclosure report with all necessary details and configuration.
          </DialogDescription>
        </DialogHeader>

        <ReportCreateForm
          onClose={onClose}
          onSuccess={onSuccess}
          preselectedCompanyId={preselectedCompanyId}
        />
      </DialogContent>
    </Dialog>
  );
};