// client/src/components/AnalysisTable/TableRow.tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Analysis } from '../../../types';
import StatusBadge from '../../common/StatusBadge';

interface DashboardTableRowProps {
  analysis: Analysis;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  index: number; // For alternating row colors
}

export default function DashboardTableRow({ analysis, isSelected, onToggleSelection, index }: DashboardTableRowProps) {
  const rowClasses = `hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;

  return (
    <tr key={analysis.id} className={rowClasses}>
      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(analysis.id)}
          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Select analysis for ${analysis.url}`}
        />
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="max-w-[170px] truncate" title={analysis.url}>
          {analysis.url}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={analysis.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="max-w-[170px] truncate" title={analysis.title || 'No title'}>
          {analysis.title || 'No title'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
        <div className="flex items-center gap-2">
          {analysis.html_version || '-'}
          {analysis.has_login_form && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Login form detected">
              Login
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
        {analysis.internal_links ?? '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
        {analysis.external_links ?? '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          to={`/analysis/${analysis.id}`}
          className={`inline-flex items-center transition-colors ${
            analysis.status === 'cancelled' || analysis.status === 'queued' || analysis.status === 'processing' || analysis.status === 'failed'
              ? 'text-gray-400 cursor-not-allowed pointer-events-none'
              : 'text-blue-600 hover:text-blue-900'
          }`}
          onClick={(e) => {
            if (analysis.status === 'cancelled' || analysis.status === 'queued' || analysis.status === 'processing' || analysis.status === 'failed') {
              e.preventDefault();
            }
          }}
        >
          View Details
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}
