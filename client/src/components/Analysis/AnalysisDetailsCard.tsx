// client/src/components/Analysis/AnalysisDetailsCard.tsx
import type { Analysis } from '../../types';
import { getDetailStatusColor } from '../../utils/analysisUtils';

interface AnalysisDetailsCardProps {
  analysis: Analysis;
}

export default function AnalysisDetailsCard({ analysis }: AnalysisDetailsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Analysis Details</h3>
      </div>
      <div className="p-6">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDetailStatusColor(analysis.status)}`}>
                {analysis.status}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">HTML Version</dt>
            <dd className="text-sm text-gray-900">{analysis.html_version || 'N/A'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Login Form</dt>
            <dd className="text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                analysis.has_login_form ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {analysis.has_login_form ? 'Detected' : 'Not Detected'}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="text-sm text-gray-900">{new Date(analysis.created_at).toLocaleString()}</dd>
          </div>
          {analysis.completed_at && (
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Completed</dt>
              <dd className="text-sm text-gray-900">{new Date(analysis.completed_at).toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
} 