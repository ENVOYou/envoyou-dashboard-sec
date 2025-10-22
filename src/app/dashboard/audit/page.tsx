/**
 * Audit System Page
 * Main page for the audit and compliance dashboard
 */

'use client';

import React, { useState } from 'react';
import { AuditDashboard } from '@/components/features/audit/audit-dashboard';

export default function AuditPage() {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [selectedSecurityEventId, setSelectedSecurityEventId] = useState<string | null>(null);

  const handleLogSelect = (logId: string) => {
    setSelectedLogId(logId);
    // TODO: Navigate to log detail page or open modal
    console.log('Selected log:', logId);
  };

  const handleInvestigationSelect = (investigationId: string) => {
    setSelectedInvestigationId(investigationId);
    // TODO: Navigate to investigation detail page or open modal
    console.log('Selected investigation:', investigationId);
  };

  const handleSecurityEventSelect = (eventId: string) => {
    setSelectedSecurityEventId(eventId);
    // TODO: Navigate to security event detail page or open modal
    console.log('Selected security event:', eventId);
  };

  const handleViewCompliance = () => {
    // TODO: Navigate to compliance reports page
    console.log('View compliance reports');
  };

  const handleViewForensics = () => {
    // TODO: Navigate to forensic analysis page
    console.log('View forensic analysis');
  };

  return (
    <div className="container mx-auto py-6">
      <AuditDashboard
        onLogSelect={handleLogSelect}
        onInvestigationSelect={handleInvestigationSelect}
        onSecurityEventSelect={handleSecurityEventSelect}
        onViewCompliance={handleViewCompliance}
        onViewForensics={handleViewForensics}
      />
    </div>
  );
}