// src/hooks/useAnalysesData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAnalyses,
  createAnalysis,
  reRunAnalyses,
  stopAnalyses,
  deleteAnalyses,
  fetchSingleAnalysis,
} from '../services/api'
import type { Analysis, GetAnalysesResponse } from '../types'

// Define types for query parameters
type GetAnalysesParams = {
  page: number
  limit: number
  search?: string
  sortBy?: keyof Analysis
  sortOrder?: 'asc' | 'desc'
  status?: string
}

/**
 * Custom hook for fetching analyses data.
 */
export const useAnalysesQuery = (params: GetAnalysesParams) => {
  const { page, limit, search, sortBy, sortOrder, status } = params

  return useQuery<GetAnalysesResponse, Error>({
    queryKey: ['analyses', page, limit, search, sortBy, sortOrder, status],
    queryFn: () => fetchAnalyses(page, limit, search, sortBy, sortOrder, status),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    refetchInterval: (query) => {
      // Only refetch if there are active (queued or processing) analyses
      const analysesData = query.state.data?.data
      const activeAnalysesExist = analysesData?.some(
        (a) => a.status === 'queued' || a.status === 'processing',
      )
      return activeAnalysesExist ? 5000 : false // Poll every 5 seconds if active analyses exist, otherwise stop
    },
    // No onError here; let the component handle global error display from `error` property
  })
}

/**
 * Custom hook for submitting a new URL for analysis.
 */
export const useAddUrlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<Analysis, Error, string>({
    // <returnType, errorType, variablesType>
    mutationFn: createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] }) // Invalidate list to refetch
    },
  })
}

/**
 * Custom hook for rerunning selected analyses.
 */
export const useRerunAnalysesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string[]>({
    // <returnType, errorType, variablesType>
    mutationFn: reRunAnalyses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] }) // Invalidate list to refetch
    },
  })
}

/**
 * Custom hook for deleting selected analyses.
 */
export const useDeleteAnalysesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string[]>({
    mutationFn: deleteAnalyses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}

export const useStopAnalysesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string[]>({
    mutationFn: stopAnalyses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}

/**
 * Custom hook for fetching a single analysis by ID.
 */
export const useSingleAnalysisQuery = (id?: string) => {
  return useQuery<Analysis, Error>({
    queryKey: ['analysis', id],
    queryFn: () => {
      if (!id) throw new Error('No analysis ID provided')
      return fetchSingleAnalysis(id)
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'queued' || status === 'processing' ? 5000 : false
    },
  })
}
