import type { ChangeEvent } from 'react'
import { Search, Trash2, RotateCw, XCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import SpinningIcon from '../../components/common/SpinningIcon'

interface DashboardControlsProps {
  selectedIdsCount: number
  searchTerm: string
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
  onDeleteSelected: () => void
  onStopSelected: () => void
  onRerunSelected: () => void
  disableControls: boolean
  canStopSelected: boolean
  isDeleting?: boolean
  isStopping?: boolean
  isRerunning?: boolean
}

interface ActionButtonProps {
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  disabled: boolean
  isLoading: boolean
  icon: LucideIcon
  loadingText: ReactNode
  children: ReactNode
  bgColor?: string
}

const ActionButton = ({
  onClick,
  disabled,
  isLoading,
  icon: Icon,
  loadingText,
  children,
  bgColor = 'bg-blue-600 hover:bg-blue-700',
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white ${bgColor} disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
  >
    {isLoading ? (
      <>
        <SpinningIcon className="-ml-1 mr-2 text-white" />
        {loadingText}
      </>
    ) : (
      <>
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </>
    )}
  </button>
)

export default function DashboardControls({
  selectedIdsCount,
  searchTerm,
  onSearchChange,
  onDeleteSelected,
  onStopSelected,
  onRerunSelected,
  disableControls,
  canStopSelected,
  isDeleting = false,
  isStopping = false,
  isRerunning = false,
}: DashboardControlsProps) {
  const hasSelection = selectedIdsCount > 0

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <ActionButton
            onClick={onDeleteSelected}
            disabled={!hasSelection || disableControls}
            isLoading={isDeleting}
            icon={Trash2}
            loadingText="Deleting..."
            bgColor="bg-red-600 hover:bg-red-700"
          >
            Delete ({selectedIdsCount})
          </ActionButton>

          <ActionButton
            onClick={onStopSelected}
            disabled={!hasSelection || disableControls || !canStopSelected}
            isLoading={isStopping}
            icon={XCircle}
            loadingText="Stopping..."
            bgColor="bg-gray-500 hover:bg-gray-700"
          >
            Stop ({selectedIdsCount})
          </ActionButton>

          <ActionButton
            onClick={onRerunSelected}
            disabled={!hasSelection || disableControls}
            isLoading={isRerunning}
            icon={RotateCw}
            loadingText="Re-running..."
          >
            Re-run ({selectedIdsCount})
          </ActionButton>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={onSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={disableControls}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
