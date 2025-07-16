import React from 'react'
import { CheckCircle, XCircle, Hourglass, Info } from 'lucide-react'
import type { SortKey, StatusDisplay, Analysis, AnalysisStatus } from './types'
import SpinningIcon from './components/common/SpinningIcon'
import { AxiosError } from 'axios'

const STATUS_COLORS = {
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  failed: { bg: 'bg-red-100', text: 'text-red-800' },
  processing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  queued: { bg: 'bg-gray-100', text: 'text-gray-800' },
  cancelled: { bg: 'bg-orange-100', text: 'text-orange-800' },
} as const

export const getStatusColorClasses = (status: AnalysisStatus) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.queued
  return {
    bgColor: colors.bg,
    textColor: colors.text,
    detailBgColor: colors.bg,
    detailTextColor: colors.text,
  }
}

export const getStatusDisplay = (status: AnalysisStatus): StatusDisplay => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const { bgColor, textColor } = getStatusColorClasses(status)
  const className = `${baseClasses} ${bgColor} ${textColor}`

  const statusConfig = {
    completed: { icon: CheckCircle, text: 'Completed' },
    failed: { icon: XCircle, text: 'Failed' },
    processing: { icon: SpinningIcon, text: 'Processing' },
    queued: { icon: Hourglass, text: 'Queued' },
    cancelled: { icon: XCircle, text: 'Cancelled' },
  }

  const config = statusConfig[status] || {
    icon: Info,
    text: status.charAt(0).toUpperCase() + status.slice(1),
  }

  const iconProps =
    status === 'processing'
      ? { sizeClasses: 'h-3 w-3', className: `mr-1 ${textColor}` }
      : { className: 'mr-1 h-3 w-3' }

  return {
    icon: React.createElement(config.icon, iconProps),
    className,
    text: config.text,
  }
}

export const sortAnalyses = (
  a: Analysis,
  b: Analysis,
  key: SortKey,
  direction: 'asc' | 'desc',
): number => {
  const aValue = a[key]
  const bValue = b[key]

  if (aValue == null) return direction === 'asc' ? 1 : -1
  if (bValue == null) return direction === 'asc' ? -1 : 1

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  }
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return direction === 'asc' ? aValue - bValue : bValue - aValue
  }
  return 0
}

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
export const DISABLED_STATUSES = ['cancelled', 'queued', 'processing', 'failed']

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>
    return (
      axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred.'
    )
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.isAxiosError && !error.response
}
