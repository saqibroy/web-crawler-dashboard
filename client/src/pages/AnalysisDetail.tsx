import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalyses } from '../services/api';
import type { Analysis } from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F'];

export default function AnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setError(null);
      try {
        const response = await getAnalyses(1, 100);
        const arr = Array.isArray(response.data) ? response.data : [];
        const found = arr.find((a: Analysis) => a.id === id);
        if (found) {
          setAnalysis(found);
        } else {
          setError('Analysis not found.');
        }
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error + (err.response.data.details ? ': ' + err.response.data.details : ''));
        } else {
          setError('Failed to fetch analysis details. Please try again.');
        }
      }
    };
    fetchAnalysis();
  }, [id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!analysis) return <div className="p-8">Loading...</div>;

  const linkData = [
    { name: 'Internal', value: analysis.internal_links || 0 },
    { name: 'External', value: analysis.external_links || 0 },
  ];

  const headingData = analysis.headings 
    ? Object.entries(analysis.headings)
        .filter(([_, value]) => typeof value === 'number' && value > 0)
        .map(([name, value]) => ({
          name: name.toUpperCase(),
          value: value as number
        }))
    : [];

  const brokenLinksArray = analysis.broken_links 
    ? Object.entries(analysis.broken_links) 
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Analysis: {analysis.url}</h1>
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <h3 className="font-semibold text-gray-600">Title</h3>
            <p className="text-sm">{analysis.title || 'No Title'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">HTML Version</h3>
            <p className="text-sm">{analysis.html_version}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Status</h3>
            <p className="text-sm capitalize">{analysis.status}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Login Form</h3>
            <p className="text-sm">{analysis.has_login_form ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Links Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Links Distribution</h3>
            <div className="text-sm text-gray-600 mb-2">
              Internal: {analysis.internal_links || 0}, External: {analysis.external_links || 0}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={linkData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {linkData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Headings Count */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Headings Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headingData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Broken Links */}
      {brokenLinksArray.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Broken Links</h3>
          <ul className="space-y-2">
            {brokenLinksArray.map(([url, status], index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm break-all">{url}</span>
                <span className="text-red-600 text-sm font-medium">{String(status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}