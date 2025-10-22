// src/types/reports.ts

export interface Report {
  id: string;
  title: string;
  report_type: 'sec_10k' | 'ghg_report' | 'sustainability_report';
  company_id: string;
  reporting_year: number;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
  is_locked: boolean;
  locked_by?: User;
  comments: ReportComment[];
  revisions: ReportRevision[];
}

export interface ReportComment {
  id: string;
  content: string;
  author: User;
  created_at: string;
}

export interface ReportRevision {
  id: string;
  change_description: string;
  editor: User;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}
