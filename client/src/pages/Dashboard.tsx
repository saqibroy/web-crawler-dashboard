import { useState, useEffect } from 'react';
import { getAnalyses, deleteAnalyses } from '../services/api';
import type { Analysis } from '../services/api';
import UrlForm from '../components/UrlForm';
import AnalysisTable from '../components/AnalysisTable';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [page] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAnalyses(page);
      setAnalyses(response.data || []);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error + (err.response.data.details ? ': ' + err.response.data.details : ''));
      } else {
        setError('Failed to fetch analyses. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAnalyses();
  }, [page]);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (analyses.some(a => a.status === 'queued' || a.status === 'processing')) {
        fetchAnalyses();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [analyses]);

  const handleDeleteSelected = async () => {
    if (selectedIds.length > 0) {
      setError(null);
      setSuccess(null);
      try {
        await deleteAnalyses(selectedIds);
        setSelectedIds([]);
        fetchAnalyses();
        setSuccess('Selected analyses deleted successfully.');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error + (err.response.data.details ? ': ' + err.response.data.details : ''));
        } else {
          setError('Failed to delete analyses. Please try again.');
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Web Crawler Dashboard</h1>
      
      <UrlForm onSubmitted={fetchAnalyses} />
      
      {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
      {success && <div className="text-green-600 mb-4 text-sm">{success}</div>}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Delete Selected
        </button>
      </div>
      
      <AnalysisTable 
        analyses={analyses}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
      />
    </div>
  );
} 