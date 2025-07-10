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

  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const response = await getAnalyses(page);
      setAnalyses(response.data || []);
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
      await deleteAnalyses(selectedIds);
      setSelectedIds([]);
      fetchAnalyses();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Web Crawler Dashboard</h1>
      
      <UrlForm onSubmitted={fetchAnalyses} />
      
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