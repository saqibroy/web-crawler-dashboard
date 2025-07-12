// client/src/components/AnalysisTable.tsx
import type { Analysis } from '../services/api';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Hourglass,
  ChevronRight,
  FileText,
  Info,
} from 'lucide-react';

type SortKey = keyof Pick<Analysis, 'url' | 'status' | 'title' | 'html_version' | 'internal_links' | 'external_links'>;

export default function AnalysisTable({
  analyses,
  isLoading,
  selectedIds,
  onSelect,
  sortConfig,
  onSort,
}: {
  analyses: Analysis[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null;
  onSort: (key: SortKey) => void;
}) {
  const toggleSelection = (id: string) => {
    onSelect(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  };

  const sortedAnalyses = [...analyses].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-blue-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </span>
        );
      case 'queued':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <Hourglass className="mr-1 h-3 w-3" />
            Queued
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Info className="mr-1 h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading analyses...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
        <p className="text-gray-600">Submit a URL above to get started with your first analysis!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="min-w-full divide-y divide-gray-200 hidden md:table table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === analyses.length}
                onChange={() => onSelect(
                  selectedIds.length === analyses.length
                    ? []
                    : analyses.map(a => a.id)
                )}
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Select all analyses"
              />
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('url')}
            >
              <div className="flex items-center">
                URL
                {getSortIndicator('url')}
              </div>
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center">
                Status
                {getSortIndicator('status')}
              </div>
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('title')}
            >
              <div className="flex items-center">
                Title
                {getSortIndicator('title')}
              </div>
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-20"
              onClick={() => onSort('html_version')}
            >
              <div className="flex items-center">
                HTML Version
                {getSortIndicator('html_version')}
              </div>
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-20"
              onClick={() => onSort('internal_links')}
            >
              <div className="flex items-center">
                Internal Links
                {getSortIndicator('internal_links')}
              </div>
            </th>
            <th
              scope="col"
              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-20"
              onClick={() => onSort('external_links')}
            >
              <div className="flex items-center">
                External Links
                {getSortIndicator('external_links')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAnalyses.map((analysis, index) => (
            <tr key={analysis.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(analysis.id)}
                  onChange={() => toggleSelection(analysis.id)}
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Select analysis for ${analysis.url}`}
                />
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-[170px] truncate" title={analysis.url}>
                  {analysis.url}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(analysis.status)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-[170px] truncate" title={analysis.title || 'No title'}>
                  {analysis.title || 'No title'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                {analysis.html_version || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                {analysis.internal_links ?? '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                {analysis.external_links ?? '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/analysis/${analysis.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                >
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {sortedAnalyses.map(analysis => (
          <div key={analysis.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate" title={analysis.title || 'No title'}>
                    {analysis.title || 'No title'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-1" title={analysis.url}>
                    {analysis.url}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(analysis.id)}
                  onChange={() => toggleSelection(analysis.id)}
                  className="ml-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Select analysis for ${analysis.url}`}
                />
              </div>

              <div className="mb-3">
                {getStatusBadge(analysis.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">HTML Version:</span>
                  <span className="ml-2 text-gray-900">{analysis.html_version || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Internal Links:</span>
                  <span className="ml-2 text-gray-900">{analysis.internal_links ?? '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">External Links:</span>
                  <span className="ml-2 text-gray-900">{analysis.external_links ?? '-'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-200">
                <Link
                  to={`/analysis/${analysis.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
                >
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}