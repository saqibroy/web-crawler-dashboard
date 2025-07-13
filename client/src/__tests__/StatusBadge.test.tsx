import { render, screen } from '@testing-library/react';
import { expect, describe, test } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';
expect.extend(matchers);
import StatusBadge from '../components/common/StatusBadge';
import type { AnalysisStatus } from '../services/api';

describe('StatusBadge', () => {
  const statuses: { status: AnalysisStatus; text: RegExp }[] = [
    { status: 'completed', text: /completed/i },
    { status: 'processing', text: /processing/i },
    { status: 'failed', text: /failed/i },
    { status: 'queued', text: /queued/i },
    { status: 'cancelled', text: /cancelled/i },
  ];

  statuses.forEach(({ status, text }) => {
    test(`renders ${status} status`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
}); 