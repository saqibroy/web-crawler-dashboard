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

type GetAnalysesParams = {
  page: number
  limit: number
  search?: string
  sortBy?: keyof Analysis
  sortOrder?: 'asc' | 'desc'
  status?: string
}

const isAnalysisActive = (status: string) => status === 'queued' || status === 'processing'

export const useAnalysesQuery = (params: GetAnalysesParams) => {
  return useQuery<GetAnalysesResponse, Error>({
    queryKey: ['analyses', params],
    queryFn: () =>
      fetchAnalyses(
        params.page,
        params.limit,
        params.search,
        params.sortBy,
        params.sortOrder,
        params.status,
      ),
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      const hasActiveAnalyses = query.state.data?.data?.some((a) => isAnalysisActive(a.status))
      return hasActiveAnalyses ? 5000 : false
    },
  })
}

export const useSingleAnalysisQuery = (id?: string) => {
  return useQuery<Analysis, Error>({
    queryKey: ['analysis', id],
    queryFn: () => fetchSingleAnalysis(id!),
    enabled: !!id,
    refetchInterval: (query) => (isAnalysisActive(query.state.data?.status || '') ? 5000 : false),
  })
}

const createMutationHook = <T>(mutationFn: (data: T) => Promise<any>) => {
  return () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analyses'] }),
    })
  }
}

export const useAddUrlMutation = createMutationHook<string>(createAnalysis)
export const useRerunAnalysesMutation = createMutationHook<string[]>(reRunAnalyses)
export const useDeleteAnalysesMutation = createMutationHook<string[]>(deleteAnalyses)
export const useStopAnalysesMutation = createMutationHook<string[]>(stopAnalyses)
