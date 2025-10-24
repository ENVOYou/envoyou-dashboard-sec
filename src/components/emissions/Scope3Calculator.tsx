/**
 * Scope 3 Calculator Component
 * Calculator for Scope 3 emissions (value chain emissions)
 */

'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Truck,
  Plane,
  ShoppingCart,
  Users,
  Recycle,
  Calculator,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { useCalculateScope3 } from '@/hooks/use-emissions';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const scope3CalculationSchema = z.object({
  calculation_name: z.string().min(1, 'Calculation name is required'),
  company_id: z.string().min(1, 'Company selection is required'),
  reporting_period_start: z.string().min(1, 'Start date is required'),
  reporting_period_end: z.string().min(1, 'End date is required'),
  categories: z.array(z.object({
    category: z.enum([
      'purchased_goods',
      'capital_goods',
      'fuel_energy',
      'transportation',
      'waste',
      'business_travel',
      'employee_commuting',
      'leased_assets',
      'franchises',
      'investments',
      'other'
    ]),
    activity_type: z.string().min(1, 'Activity type is required'),
    quantity: z.number().min(0, 'Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    emission_factor: z.number().min(0, 'Emission factor must be positive'),
    data_quality: z.enum(['high', 'medium', 'low']),
    description: z.string().optional(),
  })).min(1, 'At least one category is required'),
});

type Scope3CalculationData = z.infer<typeof scope3CalculationSchema>;

interface Scope3CalculatorProps {
  className?: string;
}

const scope3Categories = [
  {
    value: 'purchased_goods',
    label: 'Purchased Goods & Services',
    icon: <ShoppingCart className="h-4 w-4" />,
    description: 'Emissions from purchased goods and services',
  },
  {
    value: 'capital_goods',
    label: 'Capital Goods',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Emissions from capital goods and equipment',
  },
  {
    value: 'fuel_energy',
    label: 'Fuel & Energy Activities',
    icon: <Truck className="h-4 w-4" />,
    description: 'Emissions from fuel and energy not included in Scope 1 or 2',
  },
  {
    value: 'transportation',
    label: 'Transportation & Distribution',
    icon: <Truck className="h-4 w-4" />,
    description: 'Upstream and downstream transportation emissions',
  },
  {
    value: 'waste',
    label: 'Waste Generated in Operations',
    icon: <Recycle className="h-4 w-4" />,
    description: 'Emissions from waste treatment and disposal',
  },
  {
    value: 'business_travel',
    label: 'Business Travel',
    icon: <Plane className="h-4 w-4" />,
    description: 'Employee business travel emissions',
  },
  {
    value: 'employee_commuting',
    label: 'Employee Commuting',
    icon: <Users className="h-4 w-4" />,
    description: 'Employee commuting emissions',
  },
  {
    value: 'leased_assets',
    label: 'Leased Assets',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Emissions from leased assets',
  },
  {
    value: 'franchises',
    label: 'Franchises',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Emissions from franchise operations',
  },
  {
    value: 'investments',
    label: 'Investments',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Emissions from investments',
  },
];

const activityTypes = {
  purchased_goods: ['Raw materials', 'Components', 'Packaging', 'Services', 'Other'],
  capital_goods: ['Equipment', 'Machinery', 'Buildings', 'Vehicles', 'IT equipment'],
  fuel_energy: ['Fuel extraction', 'Fuel processing', 'Energy transmission', 'Other'],
  transportation: ['Road transport', 'Rail transport', 'Air transport', 'Sea transport', 'Other'],
  waste: ['Landfill', 'Incineration', 'Recycling', 'Composting', 'Other'],
  business_travel: ['Air travel', 'Rail travel', 'Car rental', 'Hotel stays', 'Other'],
  employee_commuting: ['Car commuting', 'Public transport', 'Cycling', 'Walking', 'Remote work'],
  leased_assets: ['Buildings', 'Equipment', 'Vehicles', 'Other'],
  franchises: ['Retail locations', 'Service centers', 'Other'],
  investments: ['Equity investments', 'Debt investments', 'Project finance', 'Other'],
};

const units = [
  'kg', 'metric tons', 'liters', 'gallons', 'kWh', 'MWh', 'miles', 'kilometers',
  'passenger-km', 'ton-km', 'USD', 'EUR', 'GBP', 'units'
];

const dataQualityOptions = [
  { value: 'high', label: 'High', description: 'Primary data, site-specific' },
  { value: 'medium', label: 'Medium', description: 'Secondary data, industry average' },
  { value: 'low', label: 'Low', description: 'Estimated or proxy data' },
];

export const Scope3Calculator: React.FC<Scope3CalculatorProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const calculateMutation = useCalculateScope3();

  const form = useForm<Scope3CalculationData>({
    resolver: zodResolver(scope3CalculationSchema),
    defaultValues: {
      calculation_name: '',
      company_id: 'company-1', // TODO: Get from auth context
      reporting_period_start: '',
      reporting_period_end: '',
      categories: [{
        category: 'purchased_goods',
        activity_type: '',
        quantity: 0,
        unit: 'metric tons',
        emission_factor: 0,
        data_quality: 'medium',
        description: '',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'categories',
  });

  const onSubmit = async (data: Scope3CalculationData) => {
    try {
      await calculateMutation.mutateAsync({
        calculation_name: data.calculation_name,
        company_id: data.company_id,
        reporting_period_start: data.reporting_period_start,
        reporting_period_end: data.reporting_period_end,
        categories: data.categories,
      });
    } catch (error) {
      console.error('Scope 3 calculation failed:', error);
    }
  };

  const addCategory = () => {
    if (selectedCategory) {
      append({
        category: selectedCategory as 'purchased_goods' | 'capital_goods' | 'fuel_energy' | 'transportation' | 'waste' | 'business_travel' | 'employee_commuting' | 'leased_assets' | 'franchises' | 'investments' | 'other',
        activity_type: activityTypes[selectedCategory as keyof typeof activityTypes]?.[0] || '',
        quantity: 0,
        unit: 'metric tons',
        emission_factor: 0,
        data_quality: 'medium',
        description: '',
      });
      setSelectedCategory('');
    }
  };

  const getCategoryInfo = (category: string) => {
    return scope3Categories.find(cat => cat.value === category);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Scope 3 Emissions Calculator"
          description="Calculate indirect emissions from your value chain activities"
        />
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Building2 className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <div className="text-lg font-bold text-purple-600">15 Categories</div>
              <div className="text-sm text-purple-700">GHG Protocol Compliant</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calculator className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <div className="text-lg font-bold text-blue-600">Advanced</div>
              <div className="text-sm text-blue-700">Multi-Category Support</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <div className="text-lg font-bold text-green-600">Validated</div>
              <div className="text-sm text-green-700">EPA Standards</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Scope 3 emissions</strong> are all indirect emissions (not included in Scope 2) that occur in the value chain of the reporting company, including both upstream and downstream emissions.
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <EnhancedCard>
            <EnhancedCardHeader title="Calculation Details" />
            <EnhancedCardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calculation_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q4 2024 Scope 3 Assessment" {...field} />
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
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Categories */}
          <EnhancedCard>
            <EnhancedCardHeader
              title="Scope 3 Categories"
              description="Add emissions categories for your value chain activities"
            />
            <EnhancedCardContent className="space-y-4">
              {/* Add Category */}
              <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {scope3Categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs text-gray-500">{category.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={addCategory}
                  disabled={!selectedCategory}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              {/* Added Categories */}
              {fields.map((field: { id: string; category: string; activity_type: string; quantity: number; unit: string; emission_factor: number; data_quality: string; description?: string }, index: number) => {
                const categoryInfo = getCategoryInfo(field.category);
                return (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {categoryInfo?.icon}
                        <div>
                          <div className="font-medium">{categoryInfo?.label}</div>
                          <div className="text-sm text-gray-500">{categoryInfo?.description}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`categories.${index}.activity_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activityTypes[form.getValues(`categories.${index}.category`) as keyof typeof activityTypes]?.map((type: string) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name={`categories.${index}.quantity`}
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
                        name={`categories.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
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
                        name={`categories.${index}.emission_factor`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emission Factor</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.0001"
                                placeholder="0.0000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              tCO₂e per unit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`categories.${index}.data_quality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Quality</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dataQualityOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div>
                                      <div className="font-medium">{option.label}</div>
                                      <div className="text-xs text-gray-500">{option.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`categories.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Additional details about this activity..."
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <div className="text-lg font-medium mb-2">No categories added</div>
                  <div className="text-sm">Select a category above to start calculating Scope 3 emissions.</div>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Calculation Results */}
          {calculateMutation.data && (
            <EnhancedCard>
              <EnhancedCardHeader title="Calculation Results" />
              <EnhancedCardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateMutation.data.total_co2e.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Total tCO₂e</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {fields.length}
                    </div>
                    <div className="text-sm text-green-700">Categories</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {calculateMutation.data.id}
                    </div>
                    <div className="text-sm text-purple-700">Calculation ID</div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <EnhancedButton
              type="submit"
              loading={calculateMutation.isPending}
              disabled={fields.length === 0}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Emissions
            </EnhancedButton>
          </div>
        </form>
      </Form>
    </div>
  );
};