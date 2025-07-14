// client/src/pages/Analysis.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSingleAnalysisQuery } from '../hooks/useAnalysesData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';
import SeoHelmet from '../components/common/SeoHelmet';
import { getErrorMessage } from '../utils/errorUtils';

// New components for Analysis page
import AnalysisHeader from '../components/Analysis/AnalysisHeader';
import AnalysisKeyMetrics from '../components/Analysis/AnalysisKeyMetrics';
import AnalysisLinksChart from '../components/Analysis/AnalysisLinksChart';
import AnalysisHeadingsChart from '../components/Analysis/AnalysisHeadingsChart';
import AnalysisDetailsCard from '../components/Analysis/AnalysisDetailsCard';
import AnalysisBrokenLinks from '../components/Analysis/AnalysisBrokenLinks';
import type { Analysis } from '../types';

export default function Analysis() {
  const { id } = useParams();
  const { data: analysis, isLoading, error } = useSingleAnalysisQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner message="Loading analysis details..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorAlert message={getErrorMessage(error)} onDismiss={() => {}} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <EmptyState title="No analysis data available." message="The requested analysis could not be loaded or does not exist." />
      </div>
    );
  }

  // For cancelled analyses, show empty fields in the UI only if needed
  const displayAnalysis = analysis.status === 'cancelled' ? {
    ...analysis,
    title: '',
    html_version: '',
    internal_links: 0,
    external_links: 0,
    broken_links: null,
    headings: null,
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
        <AnalysisKeyMetrics analysis={displayAnalysis} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AnalysisLinksChart
            internalLinks={displayAnalysis.internal_links || 0}
            externalLinks={displayAnalysis.external_links || 0}
          />
          <AnalysisHeadingsChart headings={displayAnalysis.headings} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalysisDetailsCard analysis={displayAnalysis} />
          <AnalysisBrokenLinks brokenLinks={displayAnalysis.broken_links} />
        </div>
      </div>
    </>
  );
}