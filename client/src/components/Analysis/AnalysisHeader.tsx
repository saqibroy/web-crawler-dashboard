import { AlertTriangle } from 'lucide-react'
import type { Analysis } from '../../types'
import StatusBadge from '../common/StatusBadge'
import EmptyState from '../common/EmptyState'
import BackToDashboard from '../common/BackToDashboard'

interface AnalysisHeaderProps {
  analysis: Analysis
}

export default function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  return (
    <div className="mb-6">
      <BackToDashboard />

      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {analysis.title || 'Analysis Details'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 break-all">{analysis.url}</p>

          {analysis.status === 'cancelled' && (
            <div className="mt-2">
              <EmptyState
                title="Analysis Cancelled"
                message="This analysis was cancelled and no data is available."
                icon={<AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-4" />}
              />
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <StatusBadge status={analysis.status} />
        </div>
      </div>
    </div>
  )
}
