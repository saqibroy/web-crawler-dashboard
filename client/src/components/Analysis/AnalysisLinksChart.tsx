// client/src/components/Analysis/AnalysisLinksChart.tsx
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { CHART_COLORS } from '../../utils'
import EmptyState from '../common/EmptyState'

interface AnalysisLinksChartProps {
  internalLinks: number
  externalLinks: number
}

export default function AnalysisLinksChart({
  internalLinks,
  externalLinks,
}: AnalysisLinksChartProps) {
  const linkData = [
    { name: 'Internal Links', value: internalLinks || 0 },
    { name: 'External Links', value: externalLinks || 0 },
  ]
  const isEmpty = (internalLinks || 0) === 0 && (externalLinks || 0) === 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Links Distribution</h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center">
          {isEmpty ? (
            <EmptyState
              title="No Link Data Found"
              message="This analysis did not detect any internal or external links."
              icon={<span className="text-2xl mb-2">🔗</span>}
            />
          ) : (
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
                  {linkData.map((_entry, index) => (
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
          )}
        </div>
      </div>
    </div>
  )
}
