import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAnalyses } from '../services/api';
import type { Analysis } from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Legend } from 'recharts';
import { ArrowLeft, Link as LinkIcon, ExternalLink, AlertCircle, FileText, XCircle } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, you'd likely have a specific API endpoint to get a single analysis by ID.
        // For this example, we're still fetching all and filtering, but keep this in mind.
        const response = await fetchAnalyses(1, 100);
        const arr = Array.isArray(response.data) ? response.data : [];
        const found = arr.find((a: Analysis) => a.id === id);
        if (found) {
          setAnalysis(found);
        } else {
          setError("Analysis not found.");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to load analysis details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center"> {/* Simplified for App.tsx context */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div> {/* Simplified for App.tsx context */}
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Analysis</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div> {/* Simplified for App.tsx context */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">No analysis data available.</p>
        </div>
      </div>
    );
  }

  const linkData = [
    { name: 'Internal Links', value: analysis.internal_links || 0 },
    { name: 'External Links', value: analysis.external_links || 0 },
  ];

  const headingData = analysis.headings ? Object.entries(analysis.headings)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value as number,
    })) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div> {/* Outer div, now *within* the App.tsx max-width container */}
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {analysis.title || 'Analysis Details'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 break-all">
            {analysis.url}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analysis.status)}`}>
            {analysis.status}
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
                <dd className="text-lg font-semibold text-gray-900">{analysis.internal_links || 0}</dd>
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
                <dd className="text-lg font-semibold text-gray-900">{analysis.external_links || 0}</dd>
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
                  {analysis.broken_links ? Object.keys(analysis.broken_links).length : 0}
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
                <dd className="text-lg font-semibold text-gray-900">{analysis.html_version || 'N/A'}</dd>
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
                      <Cell key={`cell-link-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      <Cell key={`cell-heading-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
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

        {analysis.broken_links && Object.keys(analysis.broken_links).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Broken Links</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.keys(analysis.broken_links).length} broken link(s) found
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(analysis.broken_links).map(([url, status]) => (
                  <div key={url} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {status}
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