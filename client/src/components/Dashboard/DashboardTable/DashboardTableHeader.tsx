import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Fragment } from 'react';
import type { Analysis, SortKey } from '../../../types';

interface DashboardTableHeaderProps {
  analyses: Analysis[];
  selectedIds: string[];
  onSelectAll: (ids: string[]) => void;
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null;
  onSort: (key: SortKey) => void;
}

export default function DashboardTableHeader({
  analyses,
  selectedIds,
  onSelectAll,
  sortConfig,
  onSort,
}: DashboardTableHeaderProps) {
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

  const headers: Array<{ key: SortKey; label: string; className?: string }> = [
    { key: 'url', label: 'URL' },
    { key: 'status', label: 'Status' },
    { key: 'title', label: 'Title' },
    { key: 'html_version', label: 'HTML Version', className: 'w-20' },
    { key: 'internal_links', label: 'Internal Links', className: 'w-20' },
    { key: 'external_links', label: 'External Links', className: 'w-20' },
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
          <input
            type="checkbox"
            checked={selectedIds.length > 0 && selectedIds.length === analyses.length}
            onChange={() => onSelectAll(
              selectedIds.length === analyses.length
                ? []
                : analyses.map(a => a.id)
            )}
            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label="Select all analyses"
          />
        </th>
        {headers.map(header => (
          <th
            key={header.key as string}
            scope="col"
            className={`group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${header.className || ''}`}
            onClick={() => onSort(header.key)}
          >
            <div className="flex items-center">
              {header.label}
              {getSortIndicator(header.key)}
            </div>
          </th>
        ))}
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
}
