/**
 * Emissions Import/Export Component
 * Handles importing emissions data and exporting reports
 */

'use client';

import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Calendar,
  Filter,
} from 'lucide-react';

import { useImportEmissionsData, useExportEmissionsData } from '@/hooks/use-emissions';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface EmissionsImportExportProps {
  companyId?: string;
  className?: string;
}

export const EmissionsImportExport: React.FC<EmissionsImportExportProps> = ({
  companyId,
  className,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState('auto');
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('excel');
  const [exportScope, setExportScope] = useState<string[]>(['scope1', 'scope2', 'scope3']);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [includeValidation, setIncludeValidation] = useState(true);

  const importMutation = useImportEmissionsData();
  const exportMutation = useExportEmissionsData();

  const handleImport = async () => {
    if (!importFile) return;

    try {
      await importMutation.mutateAsync({
        file: importFile,
        options: {
          company_id: companyId,
          data_format: importFormat,
          overwrite_existing: overwriteExisting,
        },
      });
      setImportFile(null);
      setImportFormat('auto');
      setOverwriteExisting(false);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        format: exportFormat,
        company_id: companyId,
        date_from: exportDateFrom || undefined,
        date_to: exportDateTo || undefined,
        scope: exportScope.length > 0 ? exportScope : undefined,
        include_validation: includeValidation,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleScopeToggle = (scope: string) => {
    setExportScope(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <EnhancedCard>
          <EnhancedCardHeader
            title="Import Emissions Data"
            description="Upload emissions data from external sources"
          />
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Data File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <div className="text-xs text-gray-500">
                Supported formats: CSV, Excel (.xlsx, .xls), JSON
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-format">Data Format</Label>
              <Select value={importFormat} onValueChange={setImportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="epa">EPA Format</SelectItem>
                  <SelectItem value="ghg_protocol">GHG Protocol</SelectItem>
                  <SelectItem value="custom">Custom Format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite"
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(checked as boolean)}
              />
              <Label htmlFor="overwrite" className="text-sm">
                Overwrite existing data
              </Label>
            </div>

            <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
              <strong>Note:</strong> Imported data will be validated against EPA standards and cross-referenced with existing calculations.
            </div>

            <EnhancedButton
              onClick={handleImport}
              disabled={!importFile}
              loading={importMutation.isPending}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </EnhancedButton>

            {importMutation.isSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Import completed successfully
              </div>
            )}

            {importMutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Import failed. Please check your file format.
              </div>
            )}
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Export Section */}
        <EnhancedCard>
          <EnhancedCardHeader
            title="Export Emissions Data"
            description="Download emissions reports and data"
          />
          <EnhancedCardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'excel' | 'json')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="From date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="To date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scope Selection</Label>
              <div className="space-y-2">
                {[
                  { value: 'scope1', label: 'Scope 1 (Direct Emissions)' },
                  { value: 'scope2', label: 'Scope 2 (Electricity)' },
                  { value: 'scope3', label: 'Scope 3 (Value Chain)' },
                ].map((scope) => (
                  <div key={scope.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={scope.value}
                      checked={exportScope.includes(scope.value)}
                      onCheckedChange={() => handleScopeToggle(scope.value)}
                    />
                    <Label htmlFor={scope.value} className="text-sm">
                      {scope.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="validation"
                checked={includeValidation}
                onCheckedChange={(checked) => setIncludeValidation(checked as boolean)}
              />
              <Label htmlFor="validation" className="text-sm">
                Include validation results
              </Label>
            </div>

            <EnhancedButton
              onClick={handleExport}
              loading={exportMutation.isPending}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </EnhancedButton>

            {exportMutation.isSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Export completed. Check your downloads.
              </div>
            )}
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Data Templates */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Data Templates"
          description="Download templates for common data formats"
        />
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <div className="font-medium text-sm mb-1">Excel Template</div>
              <div className="text-xs text-gray-500 mb-3">Standard format with validation</div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <FileText className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <div className="font-medium text-sm mb-1">CSV Template</div>
              <div className="text-xs text-gray-500 mb-3">Simple format for bulk import</div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <Database className="mx-auto h-8 w-8 text-purple-500 mb-2" />
              <div className="font-medium text-sm mb-1">API Documentation</div>
              <div className="text-xs text-gray-500 mb-3">Integration guide for developers</div>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="mr-2 h-3 w-3" />
                View Docs
              </Button>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Import/Export History */}
      <EnhancedCard>
        <EnhancedCardHeader
          title="Recent Activity"
          description="History of imports and exports"
        />
        <EnhancedCardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Data Import</div>
                  <div className="text-xs text-gray-500">Monthly emissions data - Excel format</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">2,450 records</div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Report Export</div>
                  <div className="text-xs text-gray-500">Q4 2024 Emissions Report - PDF format</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">1.2 MB</div>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">EPA Data Sync</div>
                  <div className="text-xs text-gray-500">Automatic emissions factors update</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Updated</div>
                <div className="text-xs text-gray-500">3 days ago</div>
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};