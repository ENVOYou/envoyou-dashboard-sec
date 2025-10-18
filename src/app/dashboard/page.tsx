'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { EmissionsSummary } from '@/types/api';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EmissionsChart } from '@/components/dashboard/EmissionsChart';
import { RecentCalculations } from '@/components/dashboard/RecentCalculations';
import { Activity, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch dashboard summary data
  const { data: emissionsSummary, isLoading: summaryLoading } = useQuery<EmissionsSummary>({
    queryKey: ['emissions-summary'],
    queryFn: () => apiClient.getCompanyEmissionsSummary('default-company', new Date().getFullYear()) as Promise<EmissionsSummary>,
    enabled: !!user,
  });

  const stats = [
    {
      name: 'Total CO2e Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_co2e.toFixed(2)} tCO2e` : '0.00 tCO2e',
      change: '+4.75%',
      changeType: 'positive' as const,
      icon: <BarChart3 className="h-5 w-5" />,
      loading: summaryLoading,
    },
    {
      name: 'Scope 1 Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_scope1_co2e?.toFixed(2) || 0} tCO2e` : '0.00 tCO2e',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <Activity className="h-5 w-5" />,
      loading: summaryLoading,
    },
    {
      name: 'Scope 2 Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_scope2_co2e?.toFixed(2) || 0} tCO2e` : '0.00 tCO2e',
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: <TrendingUp className="h-5 w-5" />,
      loading: summaryLoading,
    },
    {
      name: 'Data Quality Score',
      value: emissionsSummary ? `${emissionsSummary.data_quality_score}%` : '0%',
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-5 w-5" />,
      loading: summaryLoading,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&rsquo;s an overview of your emissions data and compliance status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            loading={stat.loading}
          />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <EmissionsChart
          companyId="default-company"
          title="Emissions Trend (Last 12 Months)"
        />
        <RecentCalculations limit={5} />
      </div>
    </div>
  );
}