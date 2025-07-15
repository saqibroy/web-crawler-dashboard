import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface DashboardPaginationProps {
  page: number
  limit: number
  totalAnalyses: number
  totalPages: number
  onPageChange: (newPage: number) => void
  disableControls: boolean
}

interface PaginationButtonProps {
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  disabled: boolean
  className?: string
  children: ReactNode
}

const PaginationButton = ({
  onClick,
  disabled,
  className = '',
  children,
}: PaginationButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)

interface NavButtonProps {
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  disabled: boolean
  className?: string
  children: ReactNode
}

const NavButton = ({ onClick, disabled, className = '', children }: NavButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)

export default function DashboardPagination({
  page,
  limit,
  totalAnalyses,
  totalPages,
  onPageChange,
  disableControls,
}: DashboardPaginationProps) {
  if (totalAnalyses === 0) return null

  const startIndex = Math.min((page - 1) * limit + 1, totalAnalyses)
  const endIndex = Math.min(page * limit, totalAnalyses)
  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile view */}
      <div className="flex-1 flex justify-between sm:hidden">
        <PaginationButton
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage || disableControls}
          className="rounded-md"
        >
          Previous
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage || disableControls}
          className="ml-3 rounded-md"
        >
          Next
        </PaginationButton>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startIndex}</span> to{' '}
          <span className="font-medium">{endIndex}</span> of{' '}
          <span className="font-medium">{totalAnalyses}</span> results
        </p>

        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <NavButton
            onClick={() => onPageChange(page - 1)}
            disabled={isFirstPage || disableControls}
            className="rounded-l-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </NavButton>

          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            {page} of {totalPages}
          </span>

          <NavButton
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage || disableControls}
            className="rounded-r-md"
          >
            <ChevronRight className="h-5 w-5" />
          </NavButton>
        </nav>
      </div>
    </div>
  )
}
