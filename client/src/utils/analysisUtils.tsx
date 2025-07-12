import {
  CheckCircle,
  XCircle,
  Hourglass,
  Info,
} from 'lucide-react';
import type { Analysis, AnalysisStatus } from '../services/api';
import type { ReactNode } from 'react';

interface StatusDisplay {
  icon: ReactNode;
  className: string;
  text: string;
}

/**
 * Returns the appropriate React icon and Tailwind CSS classes for a given analysis status.
 * @param status The analysis status string.
 * @returns An object containing the icon and className.
 */
export const getStatusDisplay = (status: AnalysisStatus): StatusDisplay => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case 'completed':
      return {
        icon: (<CheckCircle className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-green-100 text-green-800`,
        text: 'Completed'
      };
    case 'failed':
      return {
        icon: (<XCircle className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-red-100 text-red-800`,
        text: 'Failed'
      };
    case 'processing':
      return {
        icon: (
          <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ),
        className: `${baseClasses} bg-yellow-100 text-yellow-800`,
        text: 'Processing'
      };
    case 'queued':
      return {
        icon: (<Hourglass className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-gray-100 text-gray-800`,
        text: 'Queued'
      };
    default:
      return {
        icon: (<Info className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-blue-100 text-blue-800`,
        text: String(status).charAt(0).toUpperCase() + String(status).slice(1)
      };
  }
};

/**
 * Type definition for analysis table sort keys.
 */
export type SortKey = keyof Pick<Analysis, 'url' | 'status' | 'title' | 'html_version' | 'internal_links' | 'external_links'>;

/**
 * Compares two analysis objects based on a given sort key and direction.
 * @param a The first analysis object.
 * @param b The second analysis object.
 * @param key The key to sort by.
 * @param direction The sort direction ('asc' or 'desc').
 * @returns A number indicating the sort order (-1, 0, or 1).
 */
export const sortAnalyses = (
  a: Analysis,
  b: Analysis,
  key: SortKey,
  direction: 'asc' | 'desc'
): number => {
  const aValue = a[key];
  const bValue = b[key];

  // Handle null/undefined values by pushing them to the end (or beginning, depending on asc/desc)
  if (aValue === undefined || aValue === null) return direction === 'asc' ? 1 : -1;
  if (bValue === undefined || bValue === null) return direction === 'asc' ? -1 : 1;

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  }
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  }
  return 0; // Should not happen with defined SortKey, but for safety
};

/**
 * Array of colors for charts.
 */
export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

/**
 * Returns the status color class for `AnalysisDetail` badges.
 * @param status The analysis status string.
 * @returns Tailwind CSS class string.
 */
export const getDetailStatusColor = (status: AnalysisStatus) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'queued': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
