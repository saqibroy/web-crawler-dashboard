// src/services/api.ts
import axios from 'axios';
import type { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or invalid token
      localStorage.removeItem('authToken');
      // Optionally redirect to login or show a session expired message
      window.location.reload(); // Simple refresh for this app
    }
    return Promise.reject(error);
  }
);

// Types
export type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type Analysis = {
  id: string;
  url: string;
  status: AnalysisStatus;
  title?: string;
  html_version?: string;
  headings?: Record<string, number>; // Corrected type for headings
  internal_links?: number;
  external_links?: number;
  broken_links?: Record<string, string>; // Corrected type for broken_links
  has_login_form?: boolean;
  created_at: string;
  completed_at?: string;
};

// Assuming the API returns a structure like { data: Analysis[], total_count: number }
export type GetAnalysesResponse = {
  data: Analysis[];
  total_count: number;
};

// Auth token function (not directly used with useQuery/useMutation but kept for login flow)
export const getAuthToken = async (): Promise<{ access_token: string; token_type: string; expires_in: number }> => {
  const response: AxiosResponse<{ access_token: string; token_type: string; expires_in: number }> = await api.post('/auth/token');
  localStorage.setItem('authToken', response.data.access_token);
  return response.data;
};

// Query function for fetching analyses
export const fetchAnalyses = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy?: keyof Analysis,
  sortOrder?: 'asc' | 'desc'
): Promise<GetAnalysesResponse> => {
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (sortBy) params.sort_by = sortBy; // Backend typically uses snake_case for query params
  if (sortOrder) params.sort_order = sortOrder;

  const response = await api.get('/analyses', { params });
  return response.data;
};

// Mutation function for submitting a URL
export const createAnalysis = async (url: string): Promise<Analysis> =>
  api.post('/analyses', { url }).then(res => res.data);

// Mutation function for deleting analyses
export const removeAnalyses = async (ids: string[]): Promise<void> =>
  api.delete('/analyses', { data: { ids } }).then(res => res.data); // Assuming it returns empty or success message

// Mutation function for rerunning analyses
export const reRunAnalyses = async (ids: string[]): Promise<void> =>
  api.post('/analyses/rerun', { ids }).then(res => res.data); // Assuming it returns empty or success message