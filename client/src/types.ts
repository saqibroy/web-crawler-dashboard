// Centralized TypeScript types for the frontend
import type { ReactNode } from 'react';

// Analysis status values
export type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Analysis object structure
export type Analysis = {
  id: string;
  url: string;
  status: AnalysisStatus;
  html_version: string;
  title: string;
  headings: Record<string, number> | null;
  internal_links: number;
  external_links: number;
  broken_links: Record<string, string> | null;
  has_login_form: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// API response for analyses list
export type GetAnalysesResponse = {
  data: Analysis[];
  total_count: number;
  status_counts: Record<string, number>;
};

// Table sort keys
export type SortKey = 'url' | 'status' | 'title' | 'html_version' | 'internal_links' | 'external_links' | 'created_at' | 'updated_at';

// Status display for badges and UI
export interface StatusDisplay {
  icon: ReactNode;
  className: string;
  text: string;
}

// Dashboard stats data structure
export interface DashboardStatsData {
  total: number;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
  cancelled: number;
} 