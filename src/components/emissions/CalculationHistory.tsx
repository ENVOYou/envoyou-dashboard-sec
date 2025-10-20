'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Eye, Download } from 'lucide-react';
import { useState } from 'react';
// import { EmissionCalculation } from '@/types/api';

export function CalculationHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  const { data: calculations, isLoading, error } = useQuery({
    queryKey: ['calculations', { status: statusFilter, scope: scopeFilter }],
    queryFn: () => apiClient.getEmissionsCalculations({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 50,
    }),
  });

  const filteredCalculations = calculations?.items?.filter(calc =>
    calc.calculation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'scope_1':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Scope 1</Badge>;
      case 'scope_2':
        return <Badge variant="outline" className="border-green-500 text-green-700">Scope 2</Badge>;
      case 'scope_3':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Scope 3</Badge>;
      default:
        return <Badge variant="outline">{scope}</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading calculation history: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation History</CardTitle>
        <CardDescription>
          View and manage your emissions calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search calculations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="scope_1">Scope 1</SelectItem>
              <SelectItem value="scope_2">Scope 2</SelectItem>
              <SelectItem value="scope_3">Scope 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Calculation Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CO2e (t)</TableHead>
                <TableHead>Data Quality</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <div className="mt-2 text-sm text-gray-500">Loading calculations...</div>
                  </TableCell>
                </TableRow>
              ) : filteredCalculations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No calculations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{calc.calculation_name}</div>
                        <div className="text-sm text-gray-500">{calc.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getScopeBadge(calc.scope_type)}</TableCell>
                    <TableCell>{getStatusBadge(calc.status)}</TableCell>
                    <TableCell>
                      {calc.total_co2e ? calc.total_co2e.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {calc.data_quality_score ? `${calc.data_quality_score}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(calc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {!isLoading && calculations && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCalculations.length} of {calculations.items?.length || 0} calculations
          </div>
        )}
      </CardContent>
    </Card>
  );
}