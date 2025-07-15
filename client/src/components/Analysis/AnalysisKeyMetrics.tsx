import { Link as LinkIcon, ExternalLink, AlertCircle, FileText } from 'lucide-react'
import type { Analysis } from '../../types'
import BaseCard from '../common/BaseCard'

interface AnalysisKeyMetricsProps {
  analysis: Analysis
}

const MetricCard = ({
  icon,
  bgColor,
  textColor,
  title,
  value,
}: {
  icon: React.ElementType
  bgColor: string
  textColor: string
  title: string
  value: string | number
}) => (
  <BaseCard
    icon={icon}
    title={title}
    value={value}
    iconBgColor={bgColor}
    iconTextColor={textColor}
  />
)

export default function AnalysisKeyMetrics({ analysis }: AnalysisKeyMetricsProps) {
  const brokenLinksCount = Object.keys(analysis.broken_links || {}).length

  const metrics = [
    {
      icon: LinkIcon,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      title: 'Internal Links',
      value: analysis.internal_links || 0,
    },
    {
      icon: ExternalLink,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      title: 'External Links',
      value: analysis.external_links || 0,
    },
    {
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      title: 'Broken Links',
      value: brokenLinksCount,
    },
    {
      icon: FileText,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      title: 'HTML Version',
      value: analysis.html_version || 'N/A',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}
