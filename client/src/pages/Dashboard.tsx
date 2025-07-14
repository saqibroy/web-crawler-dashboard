// client/src/pages/Dashboard.tsx (Refactored)
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  useAnalysesQuery,
  useAddUrlMutation,
  useDeleteAnalysesMutation,
  useRerunAnalysesMutation,
  useStopAnalysesMutation,
} from '../hooks/useAnalysesData';
import { useDebounce } from '../hooks/useDebounce'; // Use the shared hook
import type { SortKey, Analysis, AnalysisStatus } from '../types';
import DashboardForm from '../components/Dashboard/DashboardForm';
import DashboardTable from '../components/Dashboard/DashboardTable';
import ConfirmationModal from '../components/common/ConfirmationModal';
import DashboardStats from '../components/Dashboard/DashboardStats';
import DashboardControls from '../components/Dashboard/DashboardControls';
import DashboardPagination from '../components/Dashboard/DashboardPagination';
import SeoHelmet from '../components/common/SeoHelmet';
import toast from 'react-hot-toast';
import ErrorAlert from '../components/common/ErrorAlert';
import { getErrorMessage } from '../utils/errorUtils';


export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<AnalysisStatus | undefined>(undefined);
  const [unfilteredTotal, setUnfilteredTotal] = useState<number | null>(null);

  // Use the custom query hook
  const {
    data,
    isLoading: isInitialLoading, // Indicates any fetching, including background refetches
    error: analysesError,
  } = useAnalysesQuery({ page, limit, search: debouncedSearchTerm, sortBy: sortConfig?.key, sortOrder: sortConfig?.direction, status: statusFilter });

  const analyses = data?.data || [];
  const totalAnalyses = data?.total_count || 0;

  // Use the custom mutation hooks
  const addUrlMutation = useAddUrlMutation();
  const deleteAnalysesMutation = useDeleteAnalysesMutation();
  const stopAnalysesMutation = useStopAnalysesMutation();
  const rerunAnalysesMutation = useRerunAnalysesMutation();

  // Check if selected analyses can be stopped (only queued or processing, and only for visible analyses)
  const visibleSelectedAnalyses = analyses.filter(a => selectedIds.includes(a.id));
  const canStopSelected =
    selectedIds.length > 0 &&
    visibleSelectedAnalyses.length === selectedIds.length &&
    visibleSelectedAnalyses.every(a => a.status === 'queued' || a.status === 'processing');

  // For interview: We display the backend's user-friendly error message directly. If localization or advanced error handling is needed, the error code can be mapped to custom messages in the frontend.
  function getFriendlyErrorMessage(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle errors from query and mutations
  useEffect(() => {
    if (analysesError) {
      setBlockingError(getErrorMessage(analysesError));
    } else if (addUrlMutation.error) {
      toast.error(getErrorMessage(addUrlMutation.error));
    } else if (deleteAnalysesMutation.error) {
      toast.error(getErrorMessage(deleteAnalysesMutation.error));
    } else if (stopAnalysesMutation.error) {
      toast.error(getErrorMessage(stopAnalysesMutation.error));
    } else if (rerunAnalysesMutation.error) {
      toast.error(getErrorMessage(rerunAnalysesMutation.error));
    } else {
      setBlockingError(null);
    }
  }, [analysesError, addUrlMutation.error, deleteAnalysesMutation.error, stopAnalysesMutation.error, rerunAnalysesMutation.error]);

  // Auto-dismiss alerts after 4 seconds
  useEffect(() => {
    if (blockingError) {
      toast.error(blockingError);
      setBlockingError(null);
    }
  }, [blockingError]);

  // Dashboard stats derived from the fetched data
  const statusCounts = data?.status_counts || {};
  useEffect(() => {
    if (!statusFilter && typeof data?.total_count === 'number') {
      setUnfilteredTotal(data.total_count);
    }
  }, [statusFilter, data?.total_count]);
  const stats = {
    total: unfilteredTotal ?? totalAnalyses,
    completed: statusCounts.completed || 0,
    processing: statusCounts.processing || 0,
    queued: statusCounts.queued || 0,
    failed: statusCounts.failed || 0,
    cancelled: statusCounts.cancelled || 0,
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    if (selectedIds.length > 0) {
      deleteAnalysesMutation.mutate(selectedIds, {
        onSuccess: () => {
          toast.success(`Successfully deleted ${selectedIds.length} analysis(es)`);
          setSelectedIds([]);
          setShowDeleteModal(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        }
      });
    }
  };

  const handleStopSelected = () => {
    if (selectedIds.length > 0) {
      stopAnalysesMutation.mutate(selectedIds, {
        onSuccess: () => {
          toast.success('Selected analyses stopped.');
          setSelectedIds([]);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        }
      });
    }
  };

  const handleRerunSelected = () => {
    if (selectedIds.length > 0) {
      rerunAnalysesMutation.mutate(selectedIds, {
        onSuccess: () => {
          toast.success('Selected analyses re-queued for processing.');
          setSelectedIds([]);
          setPage(1); // Reset to page 1 when rerunning
          setStatusFilter(undefined); // Reset filter
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        }
      });
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

  // Handle add URL with page reset and success message
  const handleAddUrl = (url: string) => {
    addUrlMutation.mutate(url.trim(), {
      onSuccess: () => {
        toast.success('URL added successfully!');
        setPage(1); // Reset to page 1 when adding new URL
        setStatusFilter(undefined); // Reset filter
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const totalPages = Math.ceil(totalAnalyses / limit);

  // Define loading states more granularly:
  // `isAnyMutationPending` blocks buttons for actions
  const isAnyMutationPending = addUrlMutation.isPending || deleteAnalysesMutation.isPending || stopAnalysesMutation.isPending || rerunAnalysesMutation.isPending;

  // `showFullTableLoading` only for the very first load or if no data
  const showFullTableLoading = isInitialLoading && analyses.length === 0; // Only show if genuinely loading for the first time with no data

  // For disabling pagination and bulk action buttons:
  // Disable if any mutation is pending OR if it's the initial data load for the analyses table.
  // We generally don't block interaction for background refetches.
  const disableControls = isAnyMutationPending || isInitialLoading;



  return (
    <>
      <SeoHelmet
        title="Web Analysis Dashboard"
        description="Overview of all website analyses, including status, links, and HTML version."
        canonicalUrl={window.location.origin}
      />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Analyses"
        message={`Are you sure you want to delete ${selectedIds.length} selected analysis(es)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {blockingError && (
        <ErrorAlert message={blockingError} onDismiss={() => setBlockingError(null)} />
      )}

      {/* Stats Cards */}
      <DashboardStats
        stats={stats}
        activeStatus={statusFilter}
        onStatusClick={status => setStatusFilter(statusFilter === status ? undefined : status as AnalysisStatus)}
        onTotalClick={() => setStatusFilter(undefined)}
      />
      {statusFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm">Filtering by status:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{statusFilter}</span>
        </div>
      )}

      {/* Add URL Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New URL</h2>
        <DashboardForm
          onSubmit={handleAddUrl}
          isLoading={addUrlMutation.isPending}
        />
      </div>

      {/* Controls and Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DashboardControls
          selectedIdsCount={selectedIds.length}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onDeleteSelected={handleDeleteSelected}
          onStopSelected={handleStopSelected}
          onRerunSelected={handleRerunSelected}
          disableControls={disableControls}
          canStopSelected={canStopSelected}
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