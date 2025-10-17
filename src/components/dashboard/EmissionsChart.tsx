'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EmissionsChartProps {
  companyId?: string;
  chartType?: 'line' | 'bar';
  title?: string;
}

export function EmissionsChart({
  companyId = 'default-company',
  chartType = 'line',
  title = 'Emissions Trend'
}: EmissionsChartProps) {
  const { data: emissionsData, isLoading, error } = useQuery({
    queryKey: ['emissions-chart', companyId],
    queryFn: async () => {
      // Get recent calculations for chart data
      const calculations = await apiClient.getEmissionsCalculations({
        company_id: companyId,
        limit: 12,
        status: 'completed'
      });

      // Transform data for chart
      return calculations.items.map(calc => ({
        date: new Date(calc.created_at).toLocaleDateString(),
        scope1: calc.total_scope1_co2e || 0,
        scope2: calc.total_scope2_co2e || 0,
        total: calc.total_co2e || 0,
        calculation_name: calc.calculation_name
      })).reverse(); // Reverse to show chronological order
    },
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="lg" text="Loading emissions data..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load emissions data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!emissionsData || emissionsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No emissions data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Start by calculating your emissions data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={emissionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'CO2e (t)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} tCO2e`,
                  name === 'scope1' ? 'Scope 1' :
                  name === 'scope2' ? 'Scope 2' : 'Total'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              {chartType === 'line' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="scope1"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="scope1"
                  />
                  <Line
                    type="monotone"
                    dataKey="scope2"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="scope2"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="total"
                  />
                </>
              ) : (
                <>
                  <Bar dataKey="scope1" fill="#ef4444" name="scope1" />
                  <Bar dataKey="scope2" fill="#3b82f6" name="scope2" />
                  <Bar dataKey="total" fill="#10b981" name="total" />
                </>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Scope 1</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Scope 2</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}