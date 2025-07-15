import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import StatusBadge from '../components/common/StatusBadge'
import type { AnalysisStatus } from '../types'

// No need to import or extend jest-dom matchers; handled by vitest.setup.ts

describe('StatusBadge', () => {
  const statuses: { status: AnalysisStatus; text: RegExp }[] = [
    { status: 'completed', text: /completed/i },
    { status: 'processing', text: /processing/i },
    { status: 'failed', text: /failed/i },
    { status: 'queued', text: /queued/i },
    { status: 'cancelled', text: /cancelled/i },
  ]

  statuses.forEach(({ status, text }) => {
    test(`renders ${status} status`, () => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })
})
