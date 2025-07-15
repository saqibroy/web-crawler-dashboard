import EmptyState from '../common/EmptyState'
import { Link2Off } from 'lucide-react'

interface AnalysisBrokenLinksProps {
  brokenLinks: Record<string, string> | null
}

export default function AnalysisBrokenLinks({ brokenLinks }: AnalysisBrokenLinksProps) {
  const links = Object.entries(brokenLinks || {})
  const getStatusCode = (status: string) => status.match(/^(\d{3})/)?.[1] || status

  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Broken Links</h3>
      </div>
      <div className="p-6">
        {links.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {links.map(([url, status]) => (
              <div
                key={url}
                className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-red-600 font-mono">[{getStatusCode(status)}]</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 break-all flex-1"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Broken Links"
            message="No inaccessible links (4xx or 5xx status codes) were found during the analysis."
            icon={<Link2Off className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
          />
        )}
      </div>
    </div>
  )
}
