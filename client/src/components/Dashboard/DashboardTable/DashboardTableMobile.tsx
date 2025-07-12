// client/src/components/AnalysisTable/MobileCard.tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Analysis } from '../../../services/api';
import StatusBadge from '../../common/StatusBadge';

interface DashboardTableMobileProps {
  analysis: Analysis;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export default function DashboardTableMobile({ analysis, isSelected, onToggleSelection }: DashboardTableMobileProps) {
  return (
    <div key={analysis.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate" title={analysis.title || 'No title'}>
              {analysis.title || 'No title'}
            </h3>
            <p className="text-sm text-gray-500 truncate mt-1" title={analysis.url}>
              {analysis.url}
            </p>
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(analysis.id)}
            className="ml-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select analysis for ${analysis.url}`}
          />
        </div>

        <div className="mb-3">
          <StatusBadge status={analysis.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">HTML Version:</span>
            <span className="ml-2 text-gray-900">{analysis.html_version || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Internal Links:</span>
            <span className="ml-2 text-gray-900">{analysis.internal_links ?? '-'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">External Links:</span>
            <span className="ml-2 text-gray-900">{analysis.external_links ?? '-'}</span>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Link
            to={`/analysis/${analysis.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
