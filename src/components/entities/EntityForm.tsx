'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CompanyEntity } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, Building } from 'lucide-react';

interface EntityFormProps {
  isOpen: boolean;
  entity?: CompanyEntity;
  onClose: () => void;
  onSuccess: () => void;
}

const ENTITY_TYPES = [
  'facility',
  'office',
  'warehouse',
  'plant',
  'headquarters',
  'branch',
  'subsidiary',
];

export function EntityForm({ isOpen, entity, onClose, onSuccess }: EntityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    entity_type: '',
    ownership_percentage: '',
    has_operational_control: false,
    has_financial_control: false,
    location: {
      country: '',
      state: '',
      city: '',
    },
  });

  const isEditing = !!entity;

  // Populate form data when editing
  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name,
        entity_type: entity.entity_type,
        ownership_percentage: entity.ownership_percentage?.toString() || '',
        has_operational_control: entity.has_operational_control,
        has_financial_control: entity.has_financial_control,
        location: {
          country: entity.location.country,
          state: entity.location.state || '',
          city: entity.location.city || '',
        },
      });
    } else {
      // Reset form for new entity
      setFormData({
        name: '',
        entity_type: '',
        ownership_percentage: '',
        has_operational_control: false,
        has_financial_control: false,
        location: {
          country: '',
          state: '',
          city: '',
        },
      });
    }
  }, [entity]);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createEntity>[0]) => apiClient.createEntity(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof apiClient.updateEntity>[1] }) => apiClient.updateEntity(id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      company_id: 'default-company', // This should come from auth context
      name: formData.name,
      entity_type: formData.entity_type,
      ownership_percentage: formData.ownership_percentage ? parseFloat(formData.ownership_percentage) : undefined,
      has_operational_control: formData.has_operational_control,
      has_financial_control: formData.has_financial_control,
      location: {
        country: formData.location.country,
        state: formData.location.state || undefined,
        city: formData.location.city || undefined,
      },
    };

    try {
      if (isEditing && entity) {
        await updateMutation.mutateAsync({ id: entity.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Failed to save entity:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {isEditing ? 'Edit Entity' : 'Create New Entity'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Entity Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter entity name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="entity_type" className="block text-sm font-medium text-gray-700">
                    Entity Type *
                  </label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, entity_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="ownership_percentage" className="block text-sm font-medium text-gray-700">
                  Ownership Percentage
                </label>
                <Input
                  id="ownership_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.ownership_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownership_percentage: e.target.value }))}
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            {/* Control Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Control Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="operational_control"
                    checked={formData.has_operational_control}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, has_operational_control: !!checked }))
                    }
                  />
                  <label htmlFor="operational_control" className="text-sm text-gray-700">
                    Has Operational Control
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="financial_control"
                    checked={formData.has_financial_control}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, has_financial_control: !!checked }))
                    }
                  />
                  <label htmlFor="financial_control" className="text-sm text-gray-700">
                    Has Financial Control
                  </label>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <Input
                    id="country"
                    value={formData.location.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, country: e.target.value }
                    }))}
                    placeholder="Enter country"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    placeholder="Enter state/province"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Entity'
                    : 'Create Entity'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}