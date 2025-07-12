// src/hooks/useAnalysesData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAnalyses,
  createAnalysis,
  removeAnalyses,
  reRunAnalyses,
} from '../services/api';
import type { Analysis, GetAnalysesResponse } from '../services/api';

// Define types for query parameters
type GetAnalysesParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: keyof Analysis;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Custom hook for fetching analyses data.
 */
export const useAnalysesQuery = (params: GetAnalysesParams) => {
  const { page, limit, search, sortBy, sortOrder } = params;

  return useQuery<GetAnalysesResponse, Error>({
    queryKey: ['analyses', page, limit, search, sortBy, sortOrder],
    queryFn: () => fetchAnalyses(page, limit, search, sortBy, sortOrder),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    refetchInterval: (query) => {
      // Only refetch if there are active (queued or processing) analyses
      const analysesData = query.state.data?.data;
      const activeAnalysesExist = analysesData?.some(a => a.status === 'queued' || a.status === 'processing');
      return activeAnalysesExist ? 5000 : false; // Poll every 5 seconds if active analyses exist, otherwise stop
    },
    // No onError here; let the component handle global error display from `error` property
  });
};

/**
 * Custom hook for submitting a new URL for analysis.
 */
export const useAddUrlMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Analysis, Error, string>({ // <returnType, errorType, variablesType>
    mutationFn: createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] }); // Invalidate list to refetch
    },
  });
};

/**
 * Custom hook for deleting selected analyses.
 */
export const useDeleteAnalysesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({ // <returnType, errorType, variablesType>
    mutationFn: removeAnalyses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] }); // Invalidate list to refetch
    },
  });
};

/**
 * Custom hook for rerunning selected analyses.
 */
export const useRerunAnalysesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({ // <returnType, errorType, variablesType>
    mutationFn: reRunAnalyses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] }); // Invalidate list to refetch
    },
  });
};