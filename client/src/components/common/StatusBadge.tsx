import { CheckCircle, XCircle, Hourglass, Info } from 'lucide-react'
import type { AnalysisStatus } from '../../types'

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  const configs = {
    completed: {
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Completed',
    },
    failed: {
      icon: XCircle,
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Failed',
    },
    processing: {
      icon: Hourglass,
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Processing',
    },
    queued: {
      icon: Info,
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Queued',
    },
    cancelled: {
      icon: XCircle,
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'Cancelled',
    },
  }

  const config = configs[status] || {
    icon: Info,
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }

  const Icon = config.icon
  const animate = status === 'processing' ? 'animate-spin' : ''

  return (
    <span className={`${baseClasses} ${config.bg} ${config.text}`}>
      <Icon className={`w-3 h-3 mr-1 ${animate}`} />
      {config.label}
    </span>
  )
}

export default StatusBadge
