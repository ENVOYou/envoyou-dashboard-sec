// src/hooks/use-reports.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Report } from '../types/reports';

// Define the shape of the API response if it's paginated or structured
interface ReportsResponse {
  items: Report[];
  total: number;
  page: number;
  size: number;
}

// A function to fetch reports from the API
const fetchReports = async (): Promise<ReportsResponse> => {
  // Assuming getReports returns a Promise<ReportsResponse>
  // You may need to adjust this based on the actual API response
  return apiClient.getReports();
};

export const useReports = () => {
  return useQuery<ReportsResponse, Error>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });
};

// A function to fetch a single report by its ID
const fetchReportById = async (id: string): Promise<Report> => {
  // This assumes your apiClient has a method like getReport(id)
  // You might need to add this method to your api-client.ts
  return apiClient.request<Report>(`/reports/${id}`);
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateReportData } from '../lib/validation';

export const useReport = (id: string) => {
  return useQuery<Report, Error>({
    queryKey: ['report', id],
    queryFn: () => fetchReportById(id),
    enabled: !!id, // The query will not run until the id is available
  });
};

// A function to create a new report
const createReport = async (data: CreateReportData): Promise<Report> => {
  return apiClient.createReport(data);
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, CreateReportData>({
    mutationFn: createReport,
    onSuccess: () => {
      // Invalidate the reports query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Function for adding a comment
const addComment = async ({ reportId, content }: { reportId: string; content: string }): Promise<ReportComment> => {
  return apiClient.addComment(reportId, content);
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation<ReportComment, Error, { reportId: string; content: string }>({
    mutationFn: addComment,
    onSuccess: (data, variables) => {
      // Invalidate the specific report to refetch comments
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
};

// Functions for locking and unlocking reports
const lockReport = async ({ id, reason }: { id: string; reason: string }): Promise<Report> => {
  return apiClient.lockReport(id, { reason });
};

const unlockReport = async ({ id, reason }: { id: string; reason: string }): Promise<Report> => {
  return apiClient.unlockReport(id, { reason });
};

export const useLockReport = () => {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, { id: string; reason: string }>({
    mutationFn: lockReport,
    onSuccess: (data) => {
      // Invalidate both the specific report and the list of reports
      queryClient.invalidateQueries({ queryKey: ['report', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUnlockReport = () => {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, { id: string; reason: string }>({
    mutationFn: unlockReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
