import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Link } from 'lucide-react'
import { CHART_COLORS } from '../../utils'
import EmptyState from '../common/EmptyState'

interface AnalysisLinksChartProps {
  internalLinks: number
  externalLinks: number
}

const createLinkData = (internal: number, external: number) => [
  { name: 'Internal Links', value: internal || 0 },
  { name: 'External Links', value: external || 0 },
]

const hasNoLinks = (internal: number, external: number) =>
  (internal || 0) === 0 && (external || 0) === 0

export default function AnalysisLinksChart({
  internalLinks,
  externalLinks,
}: AnalysisLinksChartProps) {
  const linkData = createLinkData(internalLinks, externalLinks)

  if (hasNoLinks(internalLinks, externalLinks)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Links Distribution</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center">
            <EmptyState
              title="No Link Data Found"
              message="This analysis did not detect any internal or external links."
              icon={<Link className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Links Distribution</h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={linkData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {linkData.map((_, index) => (
                  <Cell
                    key={`cell-link-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} links`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
