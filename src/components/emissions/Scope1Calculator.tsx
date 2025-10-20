'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Calculator, Fuel, CheckCircle, AlertCircle } from 'lucide-react';
import { EmissionCalculation } from '@/types/api';

const scope1ActivitySchema = z.object({
  activity_type: z.string().min(1, 'Activity type is required'),
  fuel_type: z.string().min(1, 'Fuel type is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  data_quality: z.enum(['high', 'medium', 'low'] as const),
});

const scope1CalculationSchema = z.object({
  calculation_name: z.string().min(1, 'Calculation name is required'),
  company_id: z.string().min(1, 'Company ID is required'),
  reporting_period_start: z.string().min(1, 'Start date is required'),
  reporting_period_end: z.string().min(1, 'End date is required'),
  activity_data: z.array(scope1ActivitySchema).min(1, 'At least one activity is required'),
});

type Scope1CalculationForm = z.infer<typeof scope1CalculationSchema>;

const FUEL_TYPES = [
  'natural_gas',
  'diesel',
  'gasoline',
  'coal',
  'fuel_oil',
  'propane',
  'butane',
  'kerosene',
  'other'
];

const UNITS = [
  'm3', 'ft3', 'gallons', 'liters', 'kg', 'tons', 'mmbtu', 'gj'
];

const ACTIVITY_TYPES = [
  'stationary_combustion',
  'mobile_combustion',
  'fugitive_emissions',
  'process_emissions'
];

export function Scope1Calculator() {
  const [calculationResult, setCalculationResult] = useState<EmissionCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Scope1CalculationForm>({
    resolver: zodResolver(scope1CalculationSchema),
    defaultValues: {
      calculation_name: '',
      company_id: 'default-company',
      reporting_period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      reporting_period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      activity_data: [{
        activity_type: '',
        fuel_type: '',
        quantity: 0,
        unit: '',
        data_quality: 'medium' as const,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'activity_data',
  });

  // Fetch available fuel factors
  const { data: fuelFactors, isLoading: factorsLoading } = useQuery({
    queryKey: ['fuel-factors'],
    queryFn: () => apiClient.getEmissionsFactors({ category: 'fuel' }),
  });

  const calculateMutation = useMutation({
    mutationFn: (data: Scope1CalculationForm) => apiClient.calculateScope1(data),
    onSuccess: (result) => {
      setCalculationResult(result);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      setCalculationResult(null);
    },
  });

  const onSubmit = (data: Scope1CalculationForm) => {
    calculateMutation.mutate(data);
  };

  const addActivity = () => {
    append({
      activity_type: '',
      fuel_type: '',
      quantity: 0,
      unit: '',
      data_quality: 'medium' as const,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Fuel className="h-5 w-5 mr-2" />
            Scope 1 Emissions Calculator
          </CardTitle>
          <CardDescription>
            Calculate direct GHG emissions from fuel combustion and other direct sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calculation_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q4 2024 Fuel Consumption" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company ID</FormLabel>
                      <FormControl>
                        <Input placeholder="default-company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reporting Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reporting_period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Period Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reporting_period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Period End</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Activity Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Fuel Consumption Data</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Activity {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`activity_data.${index}.activity_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ACTIVITY_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace('_', ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activity_data.${index}.fuel_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FUEL_TYPES.map((fuel) => (
                                  <SelectItem key={fuel} value={fuel}>
                                    {fuel.replace('_', ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activity_data.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activity_data.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNITS.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activity_data.${index}.data_quality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Quality</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                    High
                                  </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                    Medium
                                  </div>
                                </SelectItem>
                                <SelectItem value="low">
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                    Low
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={calculateMutation.isPending}
                  className="min-w-32"
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Emissions
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {calculationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Calculation Results
            </CardTitle>
            <CardDescription>
              Scope 1 emissions calculation completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {calculationResult.total_co2e?.toFixed(2)} tCO2e
                </div>
                <div className="text-sm text-gray-600">Total CO2e Emissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {calculationResult.data_quality_score}%
                </div>
                <div className="text-sm text-gray-600">Data Quality Score</div>
              </div>
              <div className="text-center">
                <Badge variant={calculationResult.status === 'completed' ? 'default' : 'secondary'}>
                  {calculationResult.status}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Status</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Calculation Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Calculation ID:</span> {calculationResult.id}
                  </div>
                  <div>
                    <span className="font-medium">Scope:</span> {calculationResult.scope_type}
                  </div>
                  <div>
                    <span className="font-medium">Reporting Year:</span> {calculationResult.reporting_year}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(calculationResult.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}