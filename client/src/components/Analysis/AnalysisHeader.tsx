// client/src/components/Analysis/AnalysisHeader.tsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Analysis } from '../../types';
import { getDetailStatusColor } from '../../utils/analysisUtils';

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export default function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  return (
    <div className="mb-6">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {analysis.title || 'Analysis Details'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 break-all">
            {analysis.url}
          </p>
          {analysis.status === 'cancelled' && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                This analysis was cancelled and no data is available.
              </p>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDetailStatusColor(analysis.status)}`}>
            {analysis.status}
          </span>
        </div>
      </div>
    </div>
  );
} 