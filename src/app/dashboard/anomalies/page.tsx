/**
 * Anomaly Detection Page
 * Main page for the anomaly detection dashboard
 */

'use client';

import React, { useState } from 'react';
import { AnomalyDashboard } from '@/components/features/anomaly-detection/anomaly-dashboard';

export default function AnomaliesPage() {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);

  const handleAnomalySelect = (anomalyId: string) => {
    setSelectedAnomalyId(anomalyId);
    // TODO: Navigate to anomaly detail page or open modal
    console.log('Selected anomaly:', anomalyId);
  };

  const handleCompanySelect = (companyId: string) => {
    // TODO: Navigate to company anomaly analysis
    console.log('Selected company:', companyId);
  };

  const handleViewTrends = () => {
    // TODO: Navigate to trends analysis page
    console.log('View trends');
  };

  const handleViewBenchmarks = () => {
    // TODO: Navigate to benchmarks comparison page
    console.log('View benchmarks');
  };

  return (
    <div className="container mx-auto py-6">
      <AnomalyDashboard
        onAnomalySelect={handleAnomalySelect}
        onCompanySelect={handleCompanySelect}
        onViewTrends={handleViewTrends}
        onViewBenchmarks={handleViewBenchmarks}
      />
    </div>
  );
}