// client/src/components/UrlForm.tsx
import { useState } from 'react';
import { Link2, Search, X } from 'lucide-react';

interface DashboardFormProps {
  // `onSubmit` will now be the `mutate` function from useMutation
  onSubmit: (url: string) => void;
  // `isLoading` will be `isPending` from useMutation
  isLoading: boolean;
  // `error` will be the error message from useMutation, or a local validation error
  error?: string | null;
  // `onError` is kept to communicate *validation* errors or other specific component errors
  // back to the parent if needed, although for API errors, the `error` prop will suffice.
  // We'll adjust it slightly, as `useMutation` handles the API error state.
  onError: (message: string | null) => void;
}

export default function DashboardForm({
  onSubmit,
  isLoading,
  error: mutationError, // Renamed to avoid conflict with local error state
  onError,
}: DashboardFormProps) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null); // For local validation errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous local errors
    onError(null); // Clear any global errors before new submission

    if (!url.trim()) {
      setLocalError('URL cannot be empty.');
      return;
    }

    // Call the mutate function passed as a prop
    // The try/catch around mutate is generally NOT needed here,
    // as useMutation's onError handles API errors,
    // and the `error` prop will reflect that.
    onSubmit(url);
    setUrl(''); // Clear input optimistically or on success (depending on UX preference)
  };

  const currentError = localError || mutationError; // Prioritize local validation error

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
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={isLoading} // Use the isLoading prop from the parent
            aria-label="Website URL input"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()} // Use isLoading prop
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          aria-live="polite"
        >
          {isLoading ? ( // Use isLoading prop
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      {currentError && ( // Display the combined error
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800" role="alert">{currentError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => {
                  setLocalError(null); // Clear local error
                  onError(null); // Signal parent to clear global error
                }}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Dismiss error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}