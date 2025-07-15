import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Analysis } from '../../../types';
import StatusBadge from '../../common/StatusBadge';

interface DashboardTableMobileProps {
  analysis: Analysis;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

const DISABLED_STATUSES = ['cancelled', 'queued', 'processing', 'failed'];

export default function DashboardTableMobile({ analysis, isSelected, onToggleSelection }: DashboardTableMobileProps) {
  const isDisabled = DISABLED_STATUSES.includes(analysis.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
            <span className="ml-2 text-gray-900 flex items-center gap-2">
              {analysis.html_version || '-'}
              {analysis.has_login_form && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Login form detected">
                  Login
                </span>
              )}
            </span>
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

        <div className="flex justify-end">
          <Link
            to={`/analysis/${analysis.id}`}
            className={`inline-flex items-center text-sm font-medium transition-colors ${
              isDisabled
                ? 'text-gray-400 cursor-not-allowed pointer-events-none'
                : 'text-blue-600 hover:text-blue-900'
            }`}
            onClick={(e) => {
              if (isDisabled) {
                e.preventDefault();
              }
            }}
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}