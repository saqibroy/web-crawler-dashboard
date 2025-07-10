import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalyses } from '../services/api';
import type { Analysis } from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F'];

export default function AnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const response = await getAnalyses(1, 100);
      const arr = Array.isArray(response.data) ? response.data : [];
      const found = arr.find((a: Analysis) => a.id === id);
      if (found) setAnalysis(found);
    };
    fetchAnalysis();
  }, [id]);

  if (!analysis) return <div>Loading...</div>;

  const linkData = [
    { name: 'Internal', value: analysis.internal_links || 0 },
    { name: 'External', value: analysis.external_links || 0 },
  ];

  const headingData = analysis.headings ? Object.entries(analysis.headings).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">Analysis: {analysis.url}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Links Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={linkData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {linkData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Headings Count</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
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

      {analysis.broken_links && Object.keys(analysis.broken_links).length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Broken Links</h2>
          <ul className="divide-y">
            {Object.entries(analysis.broken_links).map(([url, status]) => (
              <li key={url} className="py-2">
                <span className="text-red-500">{status}</span>: {url}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 