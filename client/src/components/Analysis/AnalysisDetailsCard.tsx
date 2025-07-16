import type { Analysis } from '../../types'
import StatusBadge from '../common/StatusBadge'

interface AnalysisDetailsCardProps {
  analysis: Analysis
}

const LoginFormBadge = ({ hasLoginForm }: { hasLoginForm: boolean }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      hasLoginForm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}
  >
    {hasLoginForm ? 'Detected' : 'Not Detected'}
  </span>
)

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{children}</dd>
  </div>
)

export default function AnalysisDetailsCard({ analysis }: AnalysisDetailsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Analysis Details</h3>
      </div>
      <div className="p-6">
        <dl className="space-y-4">
          <DetailRow label="Status">
            <StatusBadge status={analysis.status} />
          </DetailRow>

          <DetailRow label="HTML Version">{analysis.html_version || 'N/A'}</DetailRow>

          <DetailRow label="Login Form">
            <LoginFormBadge hasLoginForm={analysis.has_login_form} />
          </DetailRow>

          <DetailRow label="Created">{new Date(analysis.created_at).toLocaleString()}</DetailRow>

          {analysis.completed_at && (
            <DetailRow label="Completed">
              {new Date(analysis.completed_at).toLocaleString()}
            </DetailRow>
          )}
        </dl>
      </div>
    </div>
  )
}
