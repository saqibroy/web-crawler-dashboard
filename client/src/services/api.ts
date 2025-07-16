import axios from 'axios'
import type { Analysis, GetAnalysesResponse } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Auto-add JWT token and handle auth errors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.reload()
    }
    return Promise.reject(error)
  },
)

// Auth
export const getAuthToken = async () => {
  const { data } = await api.post<{
    access_token: string
    token_type: string
    expires_in: number
  }>('/auth/token')
  localStorage.setItem('authToken', data.access_token)
  return data
}

// Analyses
export const fetchAnalyses = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
  status?: string,
): Promise<GetAnalysesResponse> => {
  const params = { page, limit, search, sort_by: sortBy, sort_order: sortOrder, status }
  // Remove undefined values
  Object.keys(params).forEach(
    (key) => (params as any)[key] === undefined && delete (params as any)[key],
  )

  const { data } = await api.get('/analyses', { params })
  return data
}

export const fetchSingleAnalysis = async (id: string): Promise<Analysis> => {
  const { data } = await api.get(`/analyses/${id}`)
  return data
}

export const createAnalysis = async (url: string): Promise<Analysis> => {
  const { data } = await api.post('/analyses', { url })
  return data
}

export const deleteAnalyses = async (ids: string[]) => {
  const { data } = await api.delete('/analyses', { data: { ids } })
  return data
}

export const stopAnalyses = async (ids: string[]) => {
  const { data } = await api.post('/analyses/stop', { ids })
  return data
}

export const reRunAnalyses = async (ids: string[]) => {
  const { data } = await api.post('/analyses/rerun', { ids })
  return data
}
