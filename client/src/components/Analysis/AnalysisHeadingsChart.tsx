import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Heading } from 'lucide-react'
import { CHART_COLORS } from '../../utils'
import EmptyState from '../common/EmptyState'

interface AnalysisHeadingsChartProps {
  headings: Record<string, number> | null
}

const formatChartData = (headings: Record<string, number> | null) =>
  Object.entries(headings || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name: name.toUpperCase(), value }))

const hasValidData = (data: Array<{ name: string; value: number }>) =>
  data.some((item) => item.value > 0)

export default function AnalysisHeadingsChart({ headings }: AnalysisHeadingsChartProps) {
  const data = formatChartData(headings)

  if (!hasValidData(data)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Heading Tags Distribution</h3>
        </div>
        <div className="p-6">
          <div className="h-64">
            <EmptyState
              title="No Heading Tags Found"
              message="The page did not contain any heading (h1-h6) tags."
              icon={<Heading className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Heading Tags Distribution</h3>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value: number) => `${value} headings`} />
              <Bar dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
