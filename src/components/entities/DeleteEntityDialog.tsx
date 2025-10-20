import { CompanyEntity } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteEntityDialogProps {
  isOpen: boolean;
  entity: CompanyEntity | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteEntityDialog({
  isOpen,
  entity,
  onClose,
  onConfirm,
  isLoading
}: DeleteEntityDialogProps) {
  if (!isOpen || !entity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Entity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this entity? This action cannot be undone.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{entity.name}</div>
                <div className="text-gray-600 mt-1">
                  Type: {entity.entity_type} • {entity.location.country}
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting this entity will also remove all associated
                emission calculations and reports. This action cannot be reversed.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Entity'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}