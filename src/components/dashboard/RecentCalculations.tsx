'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmissionCalculation, CalculationResponse } from '@/types/api';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface RecentCalculationsProps {
  limit?: number;
}

export function RecentCalculations({ limit = 5 }: RecentCalculationsProps) {
  const { data: calculations, isLoading, error } = useQuery<CalculationResponse>({
    queryKey: ['recent-calculations', limit],
    queryFn: () => apiClient.getEmissionsCalculations({
      limit,
      status: 'completed'
    }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="md" text="Loading calculations..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load recent calculations. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calculations</CardTitle>
      </CardHeader>
      <CardContent>
        {calculations?.items?.length ? (
          <div className="space-y-4">
            {calculations.items.map((calc: EmissionCalculation) => (
              <div
                key={calc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(calc.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {calc.calculation_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Scope {calc.scope_type} • {calc.total_co2e?.toFixed(2)} tCO2e
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(calc.created_at).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(calc.status)
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
      </CardContent>
    </Card>
  );
}