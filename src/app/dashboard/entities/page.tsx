'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CompanyEntity } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { Plus, Search, Building } from 'lucide-react';
import { EntityForm } from '@/components/entities/EntityForm';
import { EntityTable } from '@/components/entities/EntityTable';
import { DeleteEntityDialog } from '@/components/entities/DeleteEntityDialog';

// Temporary workaround for TypeScript language server issue
// The files exist and compile correctly, but VSCode may need time to refresh

export default function EntitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<CompanyEntity | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<CompanyEntity | null>(null);

  const queryClient = useQueryClient();

  // Fetch entities
  const { data: entities = [], isLoading, error } = useQuery({
    queryKey: ['entities'],
    queryFn: () => apiClient.getCompanyEntities('default-company', true),
  });

  // Filter entities based on search term
  const filteredEntities = entities.filter((entity: CompanyEntity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.location.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (entityId: string) => apiClient.deleteEntity(entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      setEntityToDelete(null);
    },
  });

  const handleEdit = (entity: CompanyEntity) => {
    setSelectedEntity(entity);
    setIsEditFormOpen(true);
  };

  const handleDelete = (entity: CompanyEntity) => {
    setEntityToDelete(entity);
  };

  const confirmDelete = () => {
    if (entityToDelete) {
      deleteMutation.mutate(entityToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Company Entities</h1>
        </div>
        <Loading size="lg" text="Loading entities..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Company Entities</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading entities: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Entities</h1>
          <p className="text-gray-600 mt-1">
            Manage your company entities and their emission tracking
          </p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Entities Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entities by name, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredEntities.length} of {entities.length} entities
            </div>
          </div>

          {/* Entities Table */}
          <EntityTable
            entities={filteredEntities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Create Entity Form */}
      {isCreateFormOpen && (
        <EntityForm
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          onSuccess={() => {
            setIsCreateFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ['entities'] });
          }}
        />
      )}

      {/* Edit Entity Form */}
      {isEditFormOpen && selectedEntity && (
        <EntityForm
          isOpen={isEditFormOpen}
          entity={selectedEntity}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedEntity(null);
          }}
          onSuccess={() => {
            setIsEditFormOpen(false);
            setSelectedEntity(null);
            queryClient.invalidateQueries({ queryKey: ['entities'] });
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {entityToDelete && (
        <DeleteEntityDialog
          isOpen={!!entityToDelete}
          entity={entityToDelete}
          onClose={() => setEntityToDelete(null)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}