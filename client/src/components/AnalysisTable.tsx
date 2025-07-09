import type { Analysis } from '../services/api';
import { Link } from 'react-router-dom';

export default function AnalysisTable({
  analyses,
  isLoading,
  selectedIds,
  onSelect,
}: {
  analyses: Analysis[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}) {
  const toggleSelection = (id: string) => {
    onSelect(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="p-2 border w-8">
              <input 
                type="checkbox" 
                checked={selectedIds.length > 0 && selectedIds.length === analyses.length}
                onChange={() => onSelect(
                  selectedIds.length === analyses.length 
                    ? [] 
                    : analyses.map(a => a.id)
                )}
              />
            </th>
            <th className="p-2 border">URL</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map(analysis => (
            <tr key={analysis.id}>
              <td className="p-2 border">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(analysis.id)}
                  onChange={() => toggleSelection(analysis.id)}
                />
              </td>
              <td className="p-2 border">{analysis.url}</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-xs ${
                  analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                  analysis.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {analysis.status}
                </span>
              </td>
              <td className="p-2 border">{analysis.title || '-'}</td>
              <td className="p-2 border">
                <Link 
                  to={`/analysis/${analysis.id}`} 
                  className="text-blue-500 hover:underline"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 