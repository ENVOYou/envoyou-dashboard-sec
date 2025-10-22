// src/app/dashboard/reports/page.tsx
import React from 'react';
import { ReportList } from '@/components/features/reports/report-list';

const ReportsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports Management</h1>
      <ReportList />
    </div>
  );
};

export default ReportsPage;
