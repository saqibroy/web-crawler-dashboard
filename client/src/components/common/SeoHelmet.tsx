import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SeoHelmetProps {
  title: string
  description?: string
  canonicalUrl?: string
}

const SeoHelmet: React.FC<SeoHelmetProps> = ({ title, description, canonicalUrl }) => {
  const defaultDescription =
    'Analyze and monitor website crawl results with ease using the Web Crawler Dashboard.'

  return (
    <Helmet>
      <title>{title} | Web Crawler Dashboard</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="robots" content="noindex" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}

export default SeoHelmet
