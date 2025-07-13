// client/src/components/Analysis/AnalysisHeadingsChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../utils/analysisUtils';
import EmptyState from '../common/EmptyState';
import { Heading } from 'lucide-react'; // Example icon for headings

interface AnalysisHeadingsChartProps {
  headings: Record<string, number> | null;
}

export default function AnalysisHeadingsChart({ headings }: AnalysisHeadingsChartProps) {
  const headingData = headings
    ? Object.entries(headings)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([name, value]) => ({
          name: name.toUpperCase(),
          value: value as number,
        }))
    : [];

  const hasHeadings = headingData.some(item => item.value > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Heading Tags Distribution</h3>
      </div>
      <div className="p-6">
        <div className="h-64">
          {hasHeadings ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number) => `${value} headings`} />
                <Bar dataKey="value" fill="#3B82F6">
                  {headingData.map((_entry, index) => (
                    <Cell key={`cell-heading-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="No Heading Tags Found"
              message="The page did not contain any heading (h1-h6) tags."
              icon={<Heading className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
            />
          )}
        </div>
      </div>
    </div>
  );
} 