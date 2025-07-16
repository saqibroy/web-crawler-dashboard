import { useParams } from 'react-router-dom'
import { useSingleAnalysisQuery } from '../hooks/useAnalysesData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import EmptyState from '../components/common/EmptyState'
import SeoHelmet from '../components/common/SeoHelmet'
import { getErrorMessage } from '../utils'

import AnalysisHeader from '../components/Analysis/AnalysisHeader'
import AnalysisLinksChart from '../components/Analysis/AnalysisLinksChart'
import AnalysisHeadingsChart from '../components/Analysis/AnalysisHeadingsChart'
import AnalysisDetailsCard from '../components/Analysis/AnalysisDetailsCard'
import AnalysisBrokenLinks from '../components/Analysis/AnalysisBrokenLinks'
import BackToDashboard from '../components/common/BackToDashboard'

const getCancelledAnalysisData = (analysis: any) => ({
  ...analysis,
  title: '',
  html_version: '',
  internal_links: 0,
  external_links: 0,
  broken_links: null,
  headings: null,
  has_login_form: false,
  completed_at: null,
})

export default function Analysis() {
  const { id } = useParams()
  const { data: analysis, isLoading, error } = useSingleAnalysisQuery(id)

  if (isLoading) {
    return (
      <>
        <BackToDashboard />
        <div className="flex items-center justify-center">
          <LoadingSpinner message="Loading analysis details..." size="lg" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <BackToDashboard />
        <ErrorAlert message={getErrorMessage(error)} onDismiss={() => {}} />
      </>
    )
  }

  if (!analysis) {
    return (
      <>
        <BackToDashboard />
        <EmptyState
          title="No analysis data available."
          message="The requested analysis could not be loaded or does not exist."
        />
      </>
    )
  }

  const displayData =
    analysis.status === 'cancelled' ? getCancelledAnalysisData(analysis) : analysis

  return (
    <>
      <SeoHelmet
        title={analysis.title || analysis.url || 'Analysis Details'}
        description={`Detailed web analysis for ${analysis.url}. HTML version, links, headings, and more.`}
        canonicalUrl={`${window.location.origin}/analysis/${id}`}
      />

      <AnalysisHeader analysis={displayData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AnalysisLinksChart
          internalLinks={displayData.internal_links || 0}
          externalLinks={displayData.external_links || 0}
        />
        <AnalysisHeadingsChart headings={displayData.headings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalysisDetailsCard analysis={displayData} />
        <AnalysisBrokenLinks brokenLinks={displayData.broken_links} />
      </div>
    </>
  )
}
