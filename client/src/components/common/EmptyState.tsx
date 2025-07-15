// client/src/components/common/EmptyState.tsx
import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: ReactNode
}

export default function EmptyState({ title = 'No data found', message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon || <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  )
}
