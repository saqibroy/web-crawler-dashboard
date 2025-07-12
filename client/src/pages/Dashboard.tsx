// client/src/pages/Dashboard.tsx (Modifications)
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  useAnalysesQuery,
  useAddUrlMutation,
  useDeleteAnalysesMutation,
  useRerunAnalysesMutation,
} from '../hooks/useAnalysesData';
import type { Analysis } from '../services/api';
import UrlForm from '../components/UrlForm';
import AnalysisTable from '../components/AnalysisTable';
import {
  XCircle,
  Search,
  CheckCircle,
  Hourglass,
  XOctagon,
  Trash2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from 'lucide-react';

// Local fallback debounce hook (kept as it was in your original)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type SortKey = keyof Pick<Analysis, 'url' | 'status' | 'title' | 'html_version' | 'internal_links' | 'external_links'>;

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  // Use the custom query hook
  const {
    data,
    isLoading: isInitialLoading,               // Indicates any fetching, including background refetches
    error: analysesError,
  } = useAnalysesQuery({ page, limit, search: debouncedSearchTerm, sortBy: sortConfig?.key, sortOrder: sortConfig?.direction });

  const analyses = data?.data || [];
  const totalAnalyses = data?.total_count || 0;

  // Use the custom mutation hooks
  const addUrlMutation = useAddUrlMutation();
  const deleteAnalysesMutation = useDeleteAnalysesMutation();
  const rerunAnalysesMutation = useRerunAnalysesMutation();

  // Handle errors from query and mutations
  useEffect(() => {
    if (analysesError) {
      setGlobalError(analysesError.message || 'Failed to fetch analyses.');
    } else if (addUrlMutation.error) {
      setGlobalError(addUrlMutation.error.message || 'Failed to add URL.');
    } else if (deleteAnalysesMutation.error) {
      setGlobalError(deleteAnalysesMutation.error.message || 'Failed to delete analyses.');
    } else if (rerunAnalysesMutation.error) {
      setGlobalError(rerunAnalysesMutation.error.message || 'Failed to re-run analyses.');
    } else {
      setGlobalError(null); // Clear error if all are successful
    }
  }, [analysesError, addUrlMutation.error, deleteAnalysesMutation.error, rerunAnalysesMutation.error]);


  // Dashboard stats derived from the fetched data
  const stats = {
    total: totalAnalyses,
    completed: analyses.filter(a => a.status === 'completed').length,
    processing: analyses.filter(a => a.status === 'processing').length,
    queued: analyses.filter(a => a.status === 'queued').length,
    failed: analyses.filter(a => a.status === 'failed').length,
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteAnalysesMutation.mutate(selectedIds);
      setSelectedIds([]); // Optimistically clear selection
    }
  };

  const handleRerunSelected = () => {
    if (selectedIds.length > 0) {
      rerunAnalysesMutation.mutate(selectedIds);
      setSelectedIds([]); // Optimistically clear selection
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handler to update selectedIds (for AnalysisTable)
  const handleSelect = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Handler to update sort (for AnalysisTable)
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setPage(1); // Reset to first page on sort
  };

  const totalPages = Math.ceil(totalAnalyses / limit);

  // Define loading states more granularly:
  // `isAnyMutationPending` blocks buttons for actions
  const isAnyMutationPending = addUrlMutation.isPending || deleteAnalysesMutation.isPending || rerunAnalysesMutation.isPending;

  // `showFullTableLoading` only for the very first load or if no data
  const showFullTableLoading = isInitialLoading && analyses.length === 0; // Only show if genuinely loading for the first time with no data

  // For disabling pagination and bulk action buttons:
  // Disable if any mutation is pending OR if it's the initial data load for the analyses table.
  // We generally don't block interaction for background refetches.
  const disableControls = isAnyMutationPending || isInitialLoading;


  return (
    <>
      {/* Error Alert */}
      {globalError && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{globalError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setGlobalError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.completed}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.processing}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Queued</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.queued}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XOctagon className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.failed}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Add URL Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New URL</h2>
        <UrlForm
          onSubmit={(url: string) => addUrlMutation.mutate(url)}
          isLoading={addUrlMutation.isPending}
          error={addUrlMutation.error?.message}
          onError={setGlobalError}
        />
      </div>

      {/* Controls and Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0 || disableControls} // Use disableControls
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedIds.length})
              </button>
              <button
                onClick={handleRerunSelected}
                disabled={selectedIds.length === 0 || disableControls} // Use disableControls
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Re-run ({selectedIds.length})
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <AnalysisTable
            analyses={analyses}
            isLoading={showFullTableLoading} // Use the specific `showFullTableLoading` for the table itself
            selectedIds={selectedIds}
            onSelect={handleSelect}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Pagination */}
        {totalAnalyses > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || disableControls} // Use disableControls
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={page === totalPages || disableControls} // Use disableControls
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, totalAnalyses)}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, totalAnalyses)}</span> of{' '}
                  <span className="font-medium">{totalAnalyses}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1 || disableControls} // Use disableControls
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={page === totalPages || disableControls} // Use disableControls
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}