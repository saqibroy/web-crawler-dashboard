// client/src/pages/Analysis.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSingleAnalysisQuery } from '../hooks/useAnalysesData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';
import SeoHelmet from '../components/common/SeoHelmet';

// New components for Analysis page
import AnalysisHeader from '../components/Analysis/AnalysisHeader';
import AnalysisKeyMetrics from '../components/Analysis/AnalysisKeyMetrics';
import AnalysisLinksChart from '../components/Analysis/AnalysisLinksChart';
import AnalysisHeadingsChart from '../components/Analysis/AnalysisHeadingsChart';
import AnalysisDetailsCard from '../components/Analysis/AnalysisDetailsCard';
import AnalysisBrokenLinks from '../components/Analysis/AnalysisBrokenLinks';
import type { Analysis } from '../types';

const DEFAULT_MINIMAL_ANALYSIS: Analysis = {
  status: 'failed',
  url: '',
  id: '',
  created_at: new Date().toISOString(),
  broken_links: null,
  external_links: 0,
  has_login_form: false,
  headings: null,
  html_version: '',
  internal_links: 0,
  title: '',
  updated_at: new Date().toISOString(),
  completed_at: null
};

export default function Analysis() {
  const { id } = useParams();
  const { data: analysis, isLoading, error } = useSingleAnalysisQuery(id);
  const [localError, setLocalError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner message="Loading analysis details..." size="lg" />
      </div>
    );
  }

  if (error || localError) {
    return (
      <div>
        <AnalysisHeader analysis={DEFAULT_MINIMAL_ANALYSIS} />
        <ErrorAlert message={error?.message || localError || ''} onDismiss={() => setLocalError(null)} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <AnalysisHeader analysis={DEFAULT_MINIMAL_ANALYSIS} />
        <EmptyState title="No analysis data available." message="The requested analysis could not be loaded or does not exist." />
      </div>
    );
  }

  // Clear relevant fields for cancelled analyses for display purposes only.
  // This ensures charts and lists are empty for cancelled analyses, showing relevant empty states.
  const displayAnalysis = analysis.status === 'cancelled' ? {
    ...analysis,
    title: '',
    html_version: '',
    internal_links: 0,
    external_links: 0,
    broken_links: null, // Use null to match type definition
    headings: null,     // Use null to match type definition
    has_login_form: false,
    completed_at: null,
  } : analysis;

  return (
    <>
      <SeoHelmet
        title={analysis?.title || analysis?.url || 'Analysis Details'}
        description={`Detailed web analysis for ${analysis?.url || 'a website'}. HTML version, links, headings, and more.`}
        canonicalUrl={`${window.location.origin}/analysis/${id}`}
      />
      <div>
        <AnalysisHeader analysis={displayAnalysis} />

        {/* Key Metrics */}
        <AnalysisKeyMetrics analysis={displayAnalysis} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AnalysisLinksChart
            internalLinks={displayAnalysis.internal_links || 0}
            externalLinks={displayAnalysis.external_links || 0}
          />
          <AnalysisHeadingsChart headings={displayAnalysis.headings} />
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalysisDetailsCard analysis={displayAnalysis} />
          <AnalysisBrokenLinks brokenLinks={displayAnalysis.broken_links} />
        </div>
      </div>
    </>
  );
}