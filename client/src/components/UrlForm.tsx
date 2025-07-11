import { useState } from 'react';
import { submitUrl } from '../services/api';

export default function UrlForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError('Please enter a valid URL.');
        setIsSubmitting(false);
        return;
      }
      await submitUrl(trimmedUrl);
      setUrl('');
      onSubmitted();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error + (err.response.data.details ? ': ' + err.response.data.details : ''));
      } else {
        setError('Failed to submit URL. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="flex-1 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Analyze'}
        </button>
      </div>
      {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
    </form>
  );
}