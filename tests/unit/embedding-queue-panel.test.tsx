import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type {
  EmbeddingQueueStatus,
  TextEmbeddingJobSummary,
} from '@/lib/schemas/text-embedding'

vi.mock('@/components/dashboard/panels/shared/animated-metric-value', () => {
  return {
    __esModule: true,
    AnimatedMetricValue: ({ value }: { value: number | string }) => (
      <span>{String(value)}</span>
    ),
  }
})

import { EmbeddingQueuePanel } from '@/components/dashboard/panels/text-embedding/embedding-queue-panel'

function buildJob(
  id: string,
  status: EmbeddingQueueStatus,
  overrides: Partial<TextEmbeddingJobSummary> = {}
): TextEmbeddingJobSummary {
  return {
    id,
    status,
    sourceType: overrides.sourceType ?? 'text',
    sourcePreview: overrides.sourcePreview ?? `Source preview for ${id}`,
    sourceUrl: overrides.sourceUrl,
    model: overrides.model ?? 'text-embedding-3-small',
    dimensions: overrides.dimensions ?? 1536,
    progress: {
      completedChunks: overrides.progress?.completedChunks ?? 0,
      totalChunks: overrides.progress?.totalChunks ?? 8,
      failedChunks: overrides.progress?.failedChunks ?? 0,
    },
    usage: overrides.usage,
    queuedAt: overrides.queuedAt ?? '2026-02-07T12:00:00.000Z',
    startedAt: overrides.startedAt,
    completedAt: overrides.completedAt,
    failedAt: overrides.failedAt,
    updatedAt: overrides.updatedAt ?? '2026-02-07T12:01:00.000Z',
    error: overrides.error,
  }
}

describe('EmbeddingQueuePanel', () => {
  it('renders mixed status counts in queue metrics', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued'),
      buildJob('job-processing', 'processing'),
      buildJob('job-completed', 'completed'),
      buildJob('job-failed', 'failed'),
    ]

    render(
      <EmbeddingQueuePanel
        jobs={jobs}
        isLoading={false}
        onRetry={() => {}}
        onSelectJob={() => {}}
      />
    )

    expect(
      within(screen.getByTestId('embedding-queue-metric-queued')).getByText('1')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('embedding-queue-metric-processing')).getByText('1')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('embedding-queue-metric-completed')).getByText('1')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('embedding-queue-metric-failed')).getByText('1')
    ).toBeInTheDocument()
  })

  it('selects a job when a queue row is clicked', () => {
    const handleSelectJob = vi.fn()

    render(
      <EmbeddingQueuePanel
        jobs={[buildJob('job-selectable', 'processing')]}
        isLoading={false}
        onRetry={() => {}}
        onSelectJob={handleSelectJob}
      />
    )

    fireEvent.click(screen.getByTestId('embedding-queue-item-job-selectable'))
    expect(handleSelectJob).toHaveBeenCalledWith('job-selectable')
  })

  it('shows active progress bars for queued and processing jobs only', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued', {
        progress: { completedChunks: 0, totalChunks: 6, failedChunks: 0 },
      }),
      buildJob('job-processing', 'processing', {
        progress: { completedChunks: 3, totalChunks: 6, failedChunks: 0 },
      }),
      buildJob('job-completed', 'completed', {
        progress: { completedChunks: 6, totalChunks: 6, failedChunks: 0 },
      }),
    ]

    render(
      <EmbeddingQueuePanel
        jobs={jobs}
        isLoading={false}
        onRetry={() => {}}
        onSelectJob={() => {}}
      />
    )

    expect(
      screen.getByTestId('embedding-queue-progress-job-queued')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('embedding-queue-progress-job-processing')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('embedding-queue-progress-job-completed')
    ).not.toBeInTheDocument()
  })

  it('renders empty and error states', () => {
    const handleRetry = vi.fn()

    const { rerender } = render(
      <EmbeddingQueuePanel
        jobs={[]}
        isLoading={false}
        onRetry={handleRetry}
        onSelectJob={() => {}}
      />
    )

    expect(screen.getByText('No embeddings queued yet.')).toBeInTheDocument()

    rerender(
      <EmbeddingQueuePanel
        jobs={[]}
        isLoading={false}
        errorMessage='Request timeout'
        onRetry={handleRetry}
        onSelectJob={() => {}}
      />
    )

    expect(screen.getByText('Queue request failed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
