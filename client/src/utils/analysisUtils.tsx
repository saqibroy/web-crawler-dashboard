import { CheckCircle, XCircle, Hourglass, Info } from 'lucide-react'
import type { SortKey, StatusDisplay, Analysis, AnalysisStatus } from '../types'
import SpinningIcon from '../components/common/SpinningIcon'

export const getStatusColorClasses = (status: AnalysisStatus) => {
  switch (status) {
    case 'completed':
      return { bgColor: 'bg-green-100', textColor: 'text-green-800', detailBgColor: 'bg-green-100', detailTextColor: 'text-green-800' }
    case 'failed':
      return { bgColor: 'bg-red-100', textColor: 'text-red-800', detailBgColor: 'bg-red-100', detailTextColor: 'text-red-800' }
    case 'processing':
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', detailBgColor: 'bg-blue-100', detailTextColor: 'text-blue-800' }
    case 'queued':
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', detailBgColor: 'bg-yellow-100', detailTextColor: 'text-yellow-800' }
    case 'cancelled':
      return { bgColor: 'bg-orange-100', textColor: 'text-orange-800', detailBgColor: 'bg-gray-200', detailTextColor: 'text-gray-700' }
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', detailBgColor: 'bg-gray-100', detailTextColor: 'text-gray-800' }
  }
}

export const getStatusDisplay = (status: AnalysisStatus): StatusDisplay => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const { bgColor, textColor } = getStatusColorClasses(status)
  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle className="mr-1 h-3 w-3" />, className: `${baseClasses} ${bgColor} ${textColor}`, text: 'Completed',
      }
    case 'failed':
      return {
        icon: <XCircle className="mr-1 h-3 w-3" />, className: `${baseClasses} ${bgColor} ${textColor}`, text: 'Failed',
      }
    case 'processing':
      return {
        icon: <SpinningIcon sizeClasses="h-3 w-3" className={`mr-1 ${textColor}`} />, className: `${baseClasses} ${bgColor} ${textColor}`, text: 'Processing',
      }
    case 'queued':
      return {
        icon: <Hourglass className="mr-1 h-3 w-3" />, className: `${baseClasses} ${bgColor} ${textColor}`, text: 'Queued',
      }
    case 'cancelled':
      return {
        icon: <XCircle className="mr-1 h-3 w-3" />, className: `${baseClasses} ${bgColor} ${textColor}`, text: 'Cancelled',
      }
    default:
      return {
        icon: <Info className="mr-1 h-3 w-3" />, className: `${baseClasses} ${bgColor} ${textColor}`, text: String(status).charAt(0).toUpperCase() + String(status).slice(1),
      }
  }
}

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
  direction: 'asc' | 'desc',
): number => {
  const aValue = a[key]
  const bValue = b[key]

  // Handle null/undefined values by pushing them to the end (or beginning, depending on asc/desc)
  if (aValue === undefined || aValue === null) return direction === 'asc' ? 1 : -1
  if (bValue === undefined || bValue === null) return direction === 'asc' ? -1 : 1

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  }
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return direction === 'asc' ? aValue - bValue : bValue - aValue
  }
  return 0 // Should not happen with defined SortKey, but for safety
}

/**
 * Array of colors for charts.
 */
export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
