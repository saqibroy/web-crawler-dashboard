// client/src/components/Dashboard/DashboardStats.tsx
import { BarChart2, CheckCircle, Hourglass, XOctagon, XCircle } from 'lucide-react'
import type { DashboardStatsData } from '../../types'
import { getStatusColorClasses } from '../../utils'
import type { AnalysisStatus } from '../../types'
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
  let bgColor = 'bg-white'
  let textColor = 'text-blue-600'
  let iconBgColor = 'bg-gray-100'
  let iconTextColor = 'text-blue-600'
  if (status) {
    const { bgColor: statusBgColor, textColor: statusTextColor } = getStatusColorClasses(
      status as AnalysisStatus,
    )
    bgColor = isActive ? statusBgColor : 'bg-white'
    textColor = statusTextColor
    iconBgColor = statusBgColor
    iconTextColor = statusTextColor
  } else if (isActive) {
    bgColor = 'bg-blue-100'
    textColor = 'text-blue-800'
    iconBgColor = 'bg-blue-100'
    iconTextColor = 'text-blue-800'
  }
  return (
    <BaseCard
      icon={icon}
      title={title}
      value={value}
      bgColor={bgColor}
      iconBgColor={iconBgColor}
      iconTextColor={iconTextColor}
      onClick={onClick}
    />
  )
}

interface DashboardStatsProps {
  stats: DashboardStatsData
  activeStatus?: string
  onStatusClick?: (status: string) => void
  onTotalClick?: () => void
}

export default function DashboardStats({
  stats,
  activeStatus,
  onStatusClick,
  onTotalClick,
}: DashboardStatsProps) {
  const statusList = [
    { key: 'completed', title: 'Completed', icon: CheckCircle },
    { key: 'processing', title: 'Processing', icon: Hourglass },
    { key: 'queued', title: 'Queued', icon: Hourglass },
    { key: 'failed', title: 'Failed', icon: XOctagon },
    { key: 'cancelled', title: 'Cancelled', icon: XCircle },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      {/* Total card */}
      <StatCard
        icon={BarChart2}
        title="Total"
        value={stats.total}
        isActive={!activeStatus}
        onClick={onTotalClick}
      />

      {/* Status filter cards */}
      {statusList.map(({ key, title, icon }) => (
        <StatCard
          key={key}
          icon={icon}
          title={title}
          value={stats[key as keyof DashboardStatsData]}
          status={key}
          isActive={activeStatus === key}
          onClick={() => onStatusClick?.(key)}
        />
      ))}
    </div>
  )
}
