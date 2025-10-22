// src/lib/validation.ts
import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  report_type: z.enum(['sec_10k', 'ghg_report', 'sustainability_report']),
  reporting_year: z.coerce.number().min(2000).max(new Date().getFullYear() + 1),
  company_id: z.string().min(1, { message: "Company ID is required." }),
});

export type CreateReportData = z.infer<typeof createReportSchema>;
