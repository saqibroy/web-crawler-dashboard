import { useState } from 'react';
import { Link2, Search } from 'lucide-react';

interface DashboardFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error?: string;
}

export default function DashboardForm({ onSubmit, isLoading, error }: DashboardFormProps) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const isValidUrl = (str: string) => {
    try {
      const urlObj = new URL(str);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    
    if (!isValidUrl(trimmedUrl)) {
      setLocalError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    setLocalError('');
    onSubmit(trimmedUrl);
    setUrl('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (localError) setLocalError('');
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          {displayError && (
            <div className="mt-1 text-xs text-red-600">{displayError}</div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze URL
            </>
          )}
        </button>
      </div>
    </form>
  );
}