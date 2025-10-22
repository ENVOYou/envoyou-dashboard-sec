// src/lib/validation.ts
import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  report_type: z.enum(['sec_10k', 'ghg_report', 'sustainability_report'], {
    required_error: "You need to select a report type.",
  }),
  reporting_year: z.number({
    required_error: "Reporting year is required.",
    invalid_type_error: "Reporting year must be a number.",
  }).min(2000).max(new Date().getFullYear() + 1),
  company_id: z.string().min(1, { message: "Company ID is required." }), // This might be pre-filled or selected
});

export type CreateReportData = z.infer<typeof createReportSchema>;
