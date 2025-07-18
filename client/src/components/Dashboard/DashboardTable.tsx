import type { Analysis, SortKey } from '../../types'
import { sortAnalyses } from '../../utils'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import DashboardTableHeader from './DashboardTable/DashboardTableHeader'
import DashboardTableRow from './DashboardTable/DashboardTableRow'
import DashboardTableMobile from './DashboardTable/DashboardTableMobile'

interface DashboardTableProps {
  analyses: Analysis[]
  isLoading: boolean
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null
  onSort: (key: SortKey) => void
}

export default function DashboardTable({
  analyses,
  isLoading,
  selectedIds,
  onSelect,
  sortConfig,
  onSort,
}: DashboardTableProps) {
  const toggleSelection = (id: string) => {
    onSelect(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  const sortedAnalyses = sortConfig
    ? [...analyses].sort((a, b) => sortAnalyses(a, b, sortConfig.key, sortConfig.direction))
    : analyses

  if (isLoading) {
    return <LoadingSpinner message="Loading analyses..." />
  }

  if (analyses.length === 0) {
    return (
      <EmptyState
        title="No analyses found"
        message="Submit a URL above to get started with your first analysis!"
      />
    )
  }

  return (
    <div className="relative overflow-x-auto">
      {/* Desktop Table */}
      <table className="min-w-full divide-y divide-gray-200 hidden md:table table-auto">
        <DashboardTableHeader
          analyses={analyses}
          selectedIds={selectedIds}
          onSelectAll={onSelect}
          sortConfig={sortConfig}
          onSort={onSort}
        />
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAnalyses.map((analysis, index) => (
            <DashboardTableRow
              key={analysis.id}
              analysis={analysis}
              isSelected={selectedIds.includes(analysis.id)}
              onToggleSelection={toggleSelection}
              index={index}
            />
          ))}
        </tbody>
      </table>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {sortedAnalyses.map((analysis) => (
          <DashboardTableMobile
            key={analysis.id}
            analysis={analysis}
            isSelected={selectedIds.includes(analysis.id)}
            onToggleSelection={toggleSelection}
          />
        ))}
      </div>
    </div>
  )
}
