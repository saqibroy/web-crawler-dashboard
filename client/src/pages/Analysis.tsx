// client/src/pages/AnalysisDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSingleAnalysis } from '../services/api';
import type { Analysis } from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Legend } from 'recharts';
import { ArrowLeft, Link as LinkIcon, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import { CHART_COLORS, getDetailStatusColor } from '../utils/analysisUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

export default function Analysis() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("No analysis ID provided.");
          return;
        }
        const analysisData = await fetchSingleAnalysis(id);
        setAnalysis(analysisData);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to load analysis details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const BackToDashboardLink = () => (
    <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
      <ArrowLeft className="h-5 w-5 mr-2" />
      Back to Dashboard
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner message="Loading analysis details..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BackToDashboardLink />
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <BackToDashboardLink />
        <EmptyState title="No analysis data available." message="The requested analysis could not be loaded or does not exist." />
      </div>
    );
  }

  // Clear fields for cancelled analyses
  const displayAnalysis = analysis.status === 'cancelled' ? {
    ...analysis,
    title: '',
    html_version: '',
    internal_links: 0,
    external_links: 0,
    broken_links: {},
    headings: {},
    has_login_form: false,
    completed_at: null,
  } : analysis;

  const linkData = [
    { name: 'Internal Links', value: displayAnalysis.internal_links || 0 },
    { name: 'External Links', value: displayAnalysis.external_links || 0 },
  ];

  const headingData = displayAnalysis.headings ? Object.entries(displayAnalysis.headings)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value as number,
    })) : [];


  return (
    <div>
      <BackToDashboardLink />
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {displayAnalysis.title || 'Analysis Details'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 break-all">
            {displayAnalysis.url}
          </p>
          {displayAnalysis.status === 'cancelled' && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                This analysis was cancelled and no data is available.
              </p>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDetailStatusColor(displayAnalysis.status)}`}>
            {displayAnalysis.status}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Internal Links</dt>
                <dd className="text-lg font-semibold text-gray-900">{displayAnalysis.internal_links || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">External Links</dt>
                <dd className="text-lg font-semibold text-gray-900">{displayAnalysis.external_links || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Broken Links</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {displayAnalysis.broken_links && Object.keys(displayAnalysis.broken_links).length > 0 ? Object.keys(displayAnalysis.broken_links).length : 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">HTML Version</dt>
                <dd className="text-lg font-semibold text-gray-900">{displayAnalysis.html_version || 'N/A'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Links Distribution</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={linkData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {linkData.map((_entry, index) => (
                      <Cell key={`cell-link-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} links`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Heading Tags Distribution</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
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
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Analysis Details</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDetailStatusColor(displayAnalysis.status)}`}>
                    {displayAnalysis.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">HTML Version</dt>
                <dd className="text-sm text-gray-900">{displayAnalysis.html_version || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Login Form</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    displayAnalysis.has_login_form ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {displayAnalysis.has_login_form ? 'Detected' : 'Not Detected'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{new Date(displayAnalysis.created_at).toLocaleString()}</dd>
              </div>
              {displayAnalysis.completed_at && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="text-sm text-gray-900">{new Date(displayAnalysis.completed_at).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {displayAnalysis.broken_links && Object.keys(displayAnalysis.broken_links).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Broken Links</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.keys(displayAnalysis.broken_links).length} broken link(s) found
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(displayAnalysis.broken_links || {}).map(([url, status]) => (
                  <div key={url} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {status as string}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all"
                      >
                        {url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}