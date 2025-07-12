// client/src/pages/Dashboard.tsx (Refactored)
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  useAnalysesQuery,
  useAddUrlMutation,
  useDeleteAnalysesMutation,
  useRerunAnalysesMutation,
} from '../hooks/useAnalysesData';
import { useDebounce } from '../hooks/useDebounce'; // Use the shared hook
import type { SortKey } from '../utils/analysisUtils';
import DashboardForm from '../components/Dashboard/DashboardForm';
import DashboardTable from '../components/Dashboard/DashboardTable';
import ErrorAlert from '../components/common/ErrorAlert';
import DashboardStats from '../components/Dashboard/DashboardStats';
import DashboardControls from '../components/Dashboard/DashboardControls';
import DashboardPagination from '../components/Dashboard/DashboardPagination';


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
    isLoading: isInitialLoading, // Indicates any fetching, including background refetches
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

      <ErrorAlert message={globalError} onDismiss={() => setGlobalError(null)} />

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Add URL Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New URL</h2>
        <DashboardForm
          onSubmit={(url: string) => addUrlMutation.mutate(url)}
          isLoading={addUrlMutation.isPending}
          error={addUrlMutation.error?.message}
          onError={setGlobalError}
        />
      </div>

      {/* Controls and Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DashboardControls
          selectedIdsCount={selectedIds.length}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onDeleteSelected={handleDeleteSelected}
          onRerunSelected={handleRerunSelected}
          disableControls={disableControls}
        />

        {/* Table */}
        <div className="overflow-hidden">
          <DashboardTable
            analyses={analyses}
            isLoading={showFullTableLoading}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Pagination */}
        <DashboardPagination
          page={page}
          limit={limit}
          totalAnalyses={totalAnalyses}
          totalPages={totalPages}
          onPageChange={setPage}
          disableControls={disableControls}
        />
      </div>
    </>
  );
}