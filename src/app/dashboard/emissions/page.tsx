'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Zap, Fuel, BarChart3 } from 'lucide-react';
import { Scope1Calculator } from '@/components/emissions/Scope1Calculator';
import { Scope2Calculator } from '@/components/emissions/Scope2Calculator';
import { CalculationHistory } from '@/components/emissions/CalculationHistory';

export default function EmissionsPage() {
  const [activeTab, setActiveTab] = useState('scope1');

  // Fetch EPA factors summary
  const { data: factorsSummary, isLoading: factorsLoading } = useQuery({
    queryKey: ['epa-factors-summary'],
    queryFn: () => apiClient.getEmissionsFactors({ category: 'summary' }),
  });

  // Fetch fuel factors count
  const { data: fuelFactors } = useQuery({
    queryKey: ['epa-factors-fuel'],
    queryFn: () => apiClient.getEmissionsFactors({ category: 'fuel' }),
  });

  // Fetch electricity factors count
  const { data: electricityFactors } = useQuery({
    queryKey: ['epa-factors-electricity'],
    queryFn: () => apiClient.getEmissionsFactors({ category: 'electricity' }),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emissions Calculator</h1>
            <p className="mt-2 text-gray-600">
              Calculate GHG emissions using EPA emission factors and SEC compliance standards.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              EPA Factors: {factorsLoading ? 'Loading...' : `${factorsSummary?.length || 0} available`}
            </div>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              EPA Data Status
            </Button>
          </div>
        </div>
      </div>

      {/* EPA Factors Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            EPA Emission Factors
          </CardTitle>
          <CardDescription>
            Current status of EPA emission factors database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Fuel Factors: {fuelFactors?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm">Electricity Factors: {electricityFactors?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Last Updated: Recent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scope1" className="flex items-center">
            <Fuel className="h-4 w-4 mr-2" />
            Scope 1 Calculator
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Scope 2 Calculator
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Calculation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scope1" className="space-y-6">
          <Scope1Calculator />
        </TabsContent>

        <TabsContent value="scope2" className="space-y-6">
          <Scope2Calculator />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CalculationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}