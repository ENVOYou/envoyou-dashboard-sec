// src/components/features/reports/report-lock-control.tsx
'use client';

import React from 'react';
import { Report } from '@/types/reports';
import { useLockReport, useUnlockReport } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface ReportLockControlProps {
  report: Report;
}

export const ReportLockControl: React.FC<ReportLockControlProps> = ({ report }) => {
  const lockMutation = useLockReport();
  const unlockMutation = useUnlockReport();

  const handleLock = () => {
    // In a real app, you'd likely have a dialog to ask for a reason
    const reason = "Locked for review";
    lockMutation.mutate({ id: report.id, reason });
  };

  const handleUnlock = () => {
    const reason = "Review complete";
    unlockMutation.mutate({ id: report.id, reason });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Lock Status</h3>
      {report.is_locked ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <Lock size={16} />
            <span>Locked</span>
          </div>
          <Button
            onClick={handleUnlock}
            disabled={unlockMutation.isPending}
            variant="outline"
            size="sm"
          >
            {unlockMutation.isPending ? 'Unlocking...' : 'Unlock'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <Unlock size={16} />
            <span>Unlocked</span>
          </div>
          <Button
            onClick={handleLock}
            disabled={lockMutation.isPending}
            variant="outline"
            size="sm"
          >
            {lockMutation.isPending ? 'Locking...' : 'Lock Report'}
          </Button>
        </div>
      )}
      {(lockMutation.isError || unlockMutation.isError) && (
        <p className="text-red-600 mt-2">
          Error: {lockMutation.error?.message || unlockMutation.error?.message}
        </p>
      )}
    </div>
  );
};
