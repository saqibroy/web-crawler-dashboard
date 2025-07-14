// client/src/components/Analysis/AnalysisKeyMetrics.tsx
import { Link as LinkIcon, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import type { Analysis } from '../../types';

interface AnalysisKeyMetricsProps {
  analysis: Analysis;
}

interface MetricCardProps {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  title: string;
  value: string | number;
}

const MetricCard = ({ icon: Icon, bgColor, textColor, title, value }: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-semibold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

export default function AnalysisKeyMetrics({ analysis }: AnalysisKeyMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        icon={LinkIcon}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
        title="Internal Links"
        value={analysis.internal_links || 0}
      />
      <MetricCard
        icon={ExternalLink}
        bgColor="bg-green-100"
        textColor="text-green-600"
        title="External Links"
        value={analysis.external_links || 0}
      />
      <MetricCard
        icon={AlertCircle}
        bgColor="bg-red-100"
        textColor="text-red-600"
        title="Broken Links"
        value={analysis.broken_links && Object.keys(analysis.broken_links).length > 0 ? Object.keys(analysis.broken_links).length : 0}
      />
      <MetricCard
        icon={FileText}
        bgColor="bg-purple-100"
        textColor="text-purple-600"
        title="HTML Version"
        value={analysis.html_version || 'N/A'}
      />
    </div>
  );
} 