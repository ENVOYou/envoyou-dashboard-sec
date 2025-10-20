import { CompanyEntity } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Building, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityTableProps {
  entities: CompanyEntity[];
  onEdit: (entity: CompanyEntity) => void;
  onDelete: (entity: CompanyEntity) => void;
  isLoading?: boolean;
}

export function EntityTable({ entities, onEdit, onDelete, isLoading }: EntityTableProps) {
  const getEntityTypeColor = (entityType: string) => {
    const colors: Record<string, string> = {
      facility: 'bg-blue-100 text-blue-800',
      office: 'bg-green-100 text-green-800',
      warehouse: 'bg-purple-100 text-purple-800',
      plant: 'bg-orange-100 text-orange-800',
    };
    return colors[entityType.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getControlIcon = (hasControl: boolean) => {
    return hasControl ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  if (entities.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No entities found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first company entity.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entity Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Control
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entities.map((entity) => (
            <tr key={entity.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                    <div className="text-sm text-gray-500">ID: {entity.id.slice(0, 8)}...</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getEntityTypeColor(entity.entity_type)
                )}>
                  {entity.entity_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div>{entity.location.city || 'N/A'}</div>
                    <div className="text-gray-500">{entity.location.country}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {getControlIcon(entity.has_operational_control)}
                    <span className="ml-1 text-sm text-gray-600">Operational</span>
                  </div>
                  <div className="flex items-center">
                    {getControlIcon(entity.has_financial_control)}
                    <span className="ml-1 text-sm text-gray-600">Financial</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  entity.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {entity.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entity)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entity)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}