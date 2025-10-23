/**
 * Report Creation Form Component
 * Form for creating new reports with validation and templates
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Calendar,
  Tag,
  AlertCircle,
  Save,
  X,
  File,
  Users,
  Clock,
} from 'lucide-react';

import { useCreateReport } from '@/hooks/use-reports';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import type { CreateReportRequest } from '@/types/reports';

const reportCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  report_type: z.enum(['sec_10k', 'ghg_report', 'sustainability_report', 'esg_report']),
  company_id: z.string().min(1, 'Company selection is required'),
  reporting_year: z.number().min(2020, 'Reporting year must be 2020 or later').max(2030, 'Reporting year cannot be later than 2030'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  tags: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
}).refine((data) => data.report_type !== undefined, {
  message: 'Please select a report type',
  path: ['report_type'],
}).refine((data) => data.reporting_year !== undefined, {
  message: 'Reporting year is required',
  path: ['reporting_year'],
});

type ReportCreateFormData = z.infer<typeof reportCreateSchema>;

interface ReportCreateFormProps {
  onClose?: () => void;
  onSuccess?: (reportId: string) => void;
  preselectedCompanyId?: string;
}

const reportTypes = [
  { value: 'sec_10k', label: 'SEC 10-K Report', description: 'Annual SEC filing requirements' },
  { value: 'ghg_report', label: 'GHG Emissions Report', description: 'Greenhouse gas emissions tracking' },
  { value: 'sustainability_report', label: 'Sustainability Report', description: 'Corporate sustainability disclosure' },
  { value: 'esg_report', label: 'ESG Report', description: 'Environmental, Social, and Governance report' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

export const ReportCreateForm: React.FC<ReportCreateFormProps> = ({
  onClose,
  onSuccess,
  preselectedCompanyId,
}) => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const createReportMutation = useCreateReport();

  const form = useForm<ReportCreateFormData>({
    resolver: zodResolver(reportCreateSchema),
    defaultValues: {
      title: '',
      report_type: undefined,
      company_id: preselectedCompanyId || '',
      reporting_year: new Date().getFullYear(),
      description: '',
      tags: '',
      priority: 'medium',
      due_date: '',
    },
  });

  const onSubmit = async (data: ReportCreateFormData) => {
    try {
      const reportData: CreateReportRequest = {
        title: data.title,
        report_type: data.report_type,
        company_id: data.company_id,
        reporting_year: data.reporting_year,
        description: data.description,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        priority: data.priority,
        due_date: data.due_date || undefined,
      };

      const result = await createReportMutation.mutateAsync(reportData);

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        router.push(`/dashboard/reports/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // TODO: Load template data and populate form
    console.log('Selected template:', templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
          <p className="text-gray-500 mt-1">Set up a new climate disclosure report</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <EnhancedCard>
                <EnhancedCardHeader title="Basic Information" />
                <EnhancedCardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter report title..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="report_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                  </div>
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
                      name="company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Company ID"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The company this report belongs to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reporting_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reporting Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2020"
                              max="2030"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            The year this report covers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  <span className={priority.color}>{priority.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose and scope of this report..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description of the report's purpose and scope
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="climate, emissions, scope1 (comma-separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags for categorizing the report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional deadline for this report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </EnhancedCardContent>
              </EnhancedCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Templates */}
              <EnhancedCard>
                <EnhancedCardHeader title="Templates" />
                <EnhancedCardContent className="space-y-3">
                  <div className="text-sm text-gray-500 mb-3">
                    Start with a pre-built template to save time
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant={selectedTemplate === 'blank' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect('blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Blank Report
                    </Button>

                    <Button
                      type="button"
                      variant={selectedTemplate === 'sec_standard' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect('sec_standard')}
                    >
                      <File className="mr-2 h-4 w-4" />
                      SEC Standard
                    </Button>

                    <Button
                      type="button"
                      variant={selectedTemplate === 'ghg_comprehensive' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect('ghg_comprehensive')}
                    >
                      <File className="mr-2 h-4 w-4" />
                      GHG Comprehensive
                    </Button>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>

              {/* Quick Actions */}
              <EnhancedCard>
                <EnhancedCardHeader title="Quick Actions" />
                <EnhancedCardContent className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // TODO: Open file import dialog
                      console.log('Import from file');
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Import from File
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // TODO: Open template library
                      console.log('Browse templates');
                    }}
                  >
                    <File className="mr-2 h-4 w-4" />
                    Browse Templates
                  </Button>
                </EnhancedCardContent>
              </EnhancedCard>

              {/* Form Status */}
              <EnhancedCard>
                <EnhancedCardHeader title="Form Status" />
                <EnhancedCardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Required fields:</span>
                      <span className={cn(
                        form.formState.isValid ? 'text-green-600' : 'text-red-600'
                      )}>
                        {form.formState.isValid ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validation:</span>
                      <span className={cn(
                        Object.keys(form.formState.errors).length === 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {Object.keys(form.formState.errors).length === 0 ? 'Passed' : 'Errors'}
                      </span>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <EnhancedButton
              type="submit"
              loading={createReportMutation.isPending}
              disabled={!form.formState.isValid}
            >
              <Save className="mr-2 h-4 w-4" />
              Create Report
            </EnhancedButton>
          </div>
        </form>
      </Form>
    </div>
  );
};