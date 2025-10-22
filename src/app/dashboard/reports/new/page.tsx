// src/app/dashboard/reports/new/page.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, CreateReportData } from '@/lib/validation';
import { useCreateReport } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const NewReportPage = () => {
  const createReportMutation = useCreateReport();

  const form = useForm<CreateReportData>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      title: '',
      reporting_year: new Date().getFullYear(),
      company_id: 'default-company-id', // This should be replaced with actual company data
    },
  });

  const onSubmit = (data: CreateReportData) => {
    createReportMutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Report</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Annual GHG Report" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="report_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a report type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sec_10k">SEC 10-K</SelectItem>
                    <SelectItem value="ghg_report">GHG Report</SelectItem>
                    <SelectItem value="sustainability_report">Sustainability Report</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reporting_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createReportMutation.isPending}>
            {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
          </Button>

          {createReportMutation.isSuccess && (
            <p className="text-green-600">Report created successfully!</p>
          )}

          {createReportMutation.isError && (
            <p className="text-red-600">
              Error: {createReportMutation.error.message}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
};

export default NewReportPage;
