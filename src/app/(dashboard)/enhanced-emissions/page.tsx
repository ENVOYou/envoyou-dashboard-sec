import { ValidationForm } from '@/components/features/emissions/validation/validation-form';

export default function EnhancedEmissionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enhanced Emissions Management</h1>
        <p className="text-gray-600 mt-2">
          Validate and manage your emissions data with advanced EPA integration
        </p>
      </div>
      
      <ValidationForm />
    </div>
  );
}