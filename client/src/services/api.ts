import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Automatically add JWT token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const getAuthToken = async () => {
  const response = await api.post('/auth/token');
  localStorage.setItem('authToken', response.data.access_token);
  return response.data;
};

export const submitUrl = (url: string) => api.post('/analyses', { url });

export const getAnalyses = (page = 1, limit = 10) => 
  api.get('/analyses', { params: { page, limit } });

export const deleteAnalyses = (ids: string[]) => 
  api.delete('/analyses', { data: { ids } });

export const rerunAnalyses = (ids: string[]) => 
  api.post('/analyses/rerun', { ids });

// Types
export type Analysis = {
  id: string;
  url: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  title?: string;
  html_version?: string;
  headings?: Record<string, number>;
  internal_links?: number;
  external_links?: number;
  broken_links?: Record<string, number>;
  has_login_form?: boolean;
  created_at: string;
  completed_at?: string;
}; 