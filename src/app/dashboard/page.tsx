'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { EmissionsSummary, EmissionCalculation } from '@/types/api';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch dashboard summary data
  const { data: emissionsSummary, isLoading: emissionsLoading } = useQuery<EmissionsSummary>({
    queryKey: ['emissions-summary'],
    queryFn: () => apiClient.getCompanyEmissionsSummary('default-company', new Date().getFullYear()) as Promise<EmissionsSummary>,
    enabled: !!user,
  });

  const { data: recentCalculations, isLoading: calculationsLoading } = useQuery<{ items: EmissionCalculation[] }>({
    queryKey: ['recent-calculations'],
    queryFn: () => apiClient.getEmissionsCalculations({
      limit: 5,
      status: 'completed'
    }) as Promise<{ items: EmissionCalculation[] }>,
    enabled: !!user,
  });

  const stats = [
    {
      name: 'Total CO2e Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_co2e.toFixed(2)} tCO2e` : '0.00 tCO2e',
      change: '+4.75%',
      changeType: 'positive',
    },
    {
      name: 'Scope 1 Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_scope1_co2e?.toFixed(2) || 0} tCO2e` : '0.00 tCO2e',
      change: '+2.1%',
      changeType: 'positive',
    },
    {
      name: 'Scope 2 Emissions',
      value: emissionsSummary ? `${emissionsSummary.total_scope2_co2e?.toFixed(2) || 0} tCO2e` : '0.00 tCO2e',
      change: '-1.2%',
      changeType: 'negative',
    },
    {
      name: 'Data Quality Score',
      value: emissionsSummary ? `${emissionsSummary.data_quality_score}%` : '0%',
      change: '+5.4%',
      changeType: 'positive',
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
          Here's an overview of your emissions data and compliance status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Calculations
          </h3>

          {calculationsLoading ? (
            <div className="animate-pulse">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ) : recentCalculations?.items?.length ? (
            <div className="space-y-4">
              {recentCalculations.items.map((calc: any) => (
                <div key={calc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {calc.calculation_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Scope {calc.scope_type} • {calc.total_co2e?.toFixed(2)} tCO2e
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(calc.created_at).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      calc.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {calc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No calculations found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by calculating your emissions data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">🧮</span>
              New Calculation
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">📄</span>
              Generate Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">🏢</span>
              Add Entity
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">📊</span>
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}