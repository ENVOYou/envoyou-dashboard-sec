/**
 * Workflow Creation Form Component
 * Form for creating new workflows with approval stages
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Users,
  Clock,
  AlertCircle,
  Save,
  X,
  ArrowRight,
  User,
} from 'lucide-react';

import { useCreateWorkflow } from '@/hooks/use-workflow';
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
import type { WorkflowCreate, WorkflowStageCreate } from '@/types/workflow';

const workflowCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  workflow_type: z.enum(['emissions_approval', 'report_approval', 'entity_approval', 'custom']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
  stages: z.array(z.object({
    stage_name: z.string().min(1, 'Stage name is required'),
    description: z.string().optional(),
    approver_role: z.string().optional(),
    approver_ids: z.array(z.string()).optional(),
    is_required: z.boolean(),
    timeout_hours: z.number().optional(),
  })).min(1, 'At least one stage is required'),
});

type WorkflowCreateFormData = z.infer<typeof workflowCreateSchema>;

interface WorkflowCreateFormProps {
  onClose?: () => void;
  onSuccess?: (workflowId: string) => void;
}

const workflowTypes = [
  { value: 'emissions_approval', label: 'Emissions Approval', description: 'Approval workflow for emissions calculations' },
  { value: 'report_approval', label: 'Report Approval', description: 'Approval workflow for reports and disclosures' },
  { value: 'entity_approval', label: 'Entity Approval', description: 'Approval workflow for company entities' },
  { value: 'custom', label: 'Custom Workflow', description: 'Custom approval workflow' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

export const WorkflowCreateForm: React.FC<WorkflowCreateFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const router = useRouter();

  const createWorkflowMutation = useCreateWorkflow();

  const form = useForm<WorkflowCreateFormData>({
    resolver: zodResolver(workflowCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      workflow_type: undefined,
      priority: undefined,
      due_date: '',
      stages: [{
        stage_name: 'Initial Review',
        description: '',
        is_required: true,
        approver_role: '',
        approver_ids: [],
        timeout_hours: undefined,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stages',
  });

  const onSubmit = async (data: WorkflowCreateFormData) => {
    try {
      const workflowData: WorkflowCreate = {
        title: data.title,
        description: data.description,
        workflow_type: data.workflow_type,
        priority: data.priority,
        due_date: data.due_date || undefined,
        stages: data.stages.map((stage, index) => ({
          stage_name: stage.stage_name,
          description: stage.description,
          approver_role: stage.approver_role,
          approver_ids: stage.approver_ids,
          is_required: stage.is_required,
          timeout_hours: stage.timeout_hours,
        })),
      };

      const result = await createWorkflowMutation.mutateAsync(workflowData);

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        router.push(`/dashboard/workflow/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const addStage = () => {
    append({
      stage_name: `Stage ${fields.length + 1}`,
      description: '',
      approver_role: '',
      approver_ids: [],
      is_required: true,
      timeout_hours: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create New Workflow</h2>
          <p className="text-gray-500 mt-1">Set up a new approval workflow with multiple stages</p>
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
                        <FormLabel>Workflow Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter workflow title..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your workflow
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose and scope of this workflow..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description of the workflow&apos;s purpose and scope
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workflow_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select workflow type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workflowTypes.map((type) => (
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
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
                          Optional deadline for this workflow
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </EnhancedCardContent>
              </EnhancedCard>

              {/* Approval Stages */}
              <EnhancedCard>
                <EnhancedCardHeader
                  title="Approval Stages"
                  description="Define the approval stages and approvers for this workflow"
                />
                <EnhancedCardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">Stage {index + 1}</span>
                        </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`stages.${index}.stage_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stage Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Initial Review, Final Approval"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stages.${index}.approver_role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approver Role (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., manager, cfo, compliance"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Role-based approval assignment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`stages.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                              placeholder="Describe what this stage involves..."
                              rows={2}
                              {...field}
                            />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`stages.${index}.timeout_hours`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timeout (Hours) (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 24, 48, 72"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                Hours before escalation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stages.${index}.is_required`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300"
                                />
                              </FormControl>
                              <FormLabel>Required Stage</FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addStage}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Approval Stage
                  </Button>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Preview */}
              <EnhancedCard>
                <EnhancedCardHeader title="Workflow Preview" />
                <EnhancedCardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 mb-3">
                      Approval flow will follow this sequence:
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {form.watch(`stages.${index}.stage_name`) || `Stage ${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {form.watch(`stages.${index}.approver_role`) || 'No role specified'}
                          </div>
                        </div>
                        {index < fields.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
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
                      <span>Stages:</span>
                      <span className="text-gray-600">
                        {fields.length} stage{fields.length !== 1 ? 's' : ''}
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
              loading={createWorkflowMutation.isPending}
              disabled={!form.formState.isValid}
            >
              <Save className="mr-2 h-4 w-4" />
              Create Workflow
            </EnhancedButton>
          </div>
        </form>
      </Form>
    </div>
  );
};