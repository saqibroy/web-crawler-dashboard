import { BarChart2, CheckCircle, Hourglass, XOctagon, XCircle } from 'lucide-react'
import type { DashboardStatsData, AnalysisStatus } from '../../types'
import { getStatusColorClasses } from '../../utils'
import BaseCard from '../common/BaseCard'

interface StatCardProps {
  icon: React.ElementType
  title: string
  value: number
  status?: string
  isActive?: boolean
  onClick?: () => void
}

const StatCard = ({ icon, title, value, status, isActive, onClick }: StatCardProps) => {
  let colors = {
    bg: 'bg-white',
    iconBg: 'bg-gray-100',
    iconText: 'text-blue-600',
    hover: 'hover:bg-blue-50',
  }

  if (status) {
    const { bgColor, textColor } = getStatusColorClasses(status as AnalysisStatus)
    const hoverMap: Record<string, string> = {
      'bg-green-100': 'hover:bg-green-50',
      'bg-red-100': 'hover:bg-red-50',
      'bg-yellow-100': 'hover:bg-yellow-50',
      'bg-gray-100': 'hover:bg-gray-50',
      'bg-orange-100': 'hover:bg-orange-50',
    }

    colors = {
      bg: isActive ? bgColor : 'bg-white',
      iconBg: isActive ? 'bg-white' : bgColor,
      iconText: textColor,
      hover: hoverMap[bgColor] || 'hover:bg-gray-50',
    }
  } else if (isActive) {
    colors = {
      bg: 'bg-blue-100',
      iconBg: 'bg-white',
      iconText: 'text-blue-800',
      hover: 'hover:bg-blue-100',
    }
  }

  return (
    <BaseCard
      icon={icon}
      title={title}
      value={value}
      bgColor={colors.bg}
      iconBgColor={colors.iconBg}
      iconTextColor={colors.iconText}
      hoverBgColor={colors.hover}
      onClick={onClick}
    />
  )
}

const STATUS_CONFIG = [
  { key: 'completed', title: 'Completed', icon: CheckCircle },
  { key: 'processing', title: 'Processing', icon: Hourglass },
  { key: 'queued', title: 'Queued', icon: Hourglass },
  { key: 'failed', title: 'Failed', icon: XOctagon },
  { key: 'cancelled', title: 'Cancelled', icon: XCircle },
] as const

export default function DashboardStats({
  stats,
  activeStatus,
  onStatusClick,
  onTotalClick,
}: {
  stats: DashboardStatsData
  activeStatus?: AnalysisStatus
  onStatusClick?: (status: AnalysisStatus) => void
  onTotalClick?: () => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      <StatCard
        icon={BarChart2}
        title="Total"
        value={stats.total}
        isActive={!activeStatus}
        onClick={onTotalClick}
      />
      {STATUS_CONFIG.map(({ key, title, icon }) => (
        <StatCard
          key={key}
          icon={icon}
          title={title}
          value={stats[key as keyof DashboardStatsData]}
          status={key}
          isActive={activeStatus === key}
          onClick={() => onStatusClick?.(key as AnalysisStatus)}
        />
      ))}
    </div>
  )
}
