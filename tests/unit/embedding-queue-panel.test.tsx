import { useState, type ComponentProps } from 'react'
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

import {
  EmbeddingQueuePanel,
  sortEmbeddingQueueJobs,
} from '@/components/dashboard/panels/text-embedding/embedding-queue-panel'

type EmbeddingQueuePanelProps = ComponentProps<typeof EmbeddingQueuePanel>

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

function renderQueuePanel(
  props: Partial<EmbeddingQueuePanelProps>
) {
  return render(
    <EmbeddingQueuePanel
      jobs={props.jobs ?? []}
      isLoading={props.isLoading ?? false}
      errorMessage={props.errorMessage}
      onRetry={props.onRetry ?? (() => {})}
      onSelectJob={props.onSelectJob ?? (() => {})}
      activeStatusFilter={props.activeStatusFilter ?? null}
      onStatusFilterChange={props.onStatusFilterChange ?? (() => {})}
      selectedJobId={props.selectedJobId}
      className={props.className}
    />
  )
}

function QueueFilterHarness({ jobs }: { jobs: TextEmbeddingJobSummary[] }) {
  const [activeStatusFilter, setActiveStatusFilter] = useState<EmbeddingQueueStatus | null>(
    null
  )

  return (
    <EmbeddingQueuePanel
      jobs={jobs}
      isLoading={false}
      onRetry={() => {}}
      onSelectJob={() => {}}
      activeStatusFilter={activeStatusFilter}
      onStatusFilterChange={setActiveStatusFilter}
    />
  )
}

describe('EmbeddingQueuePanel', () => {
  it('renders mixed status counts in queue metrics', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued'),
      buildJob('job-processing', 'processing'),
      buildJob('job-completed', 'completed'),
      buildJob('job-failed', 'failed'),
    ]

    renderQueuePanel({ jobs })

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

    renderQueuePanel({
      jobs: [buildJob('job-selectable', 'processing')],
      onSelectJob: handleSelectJob,
    })

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

    renderQueuePanel({ jobs })

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

  it('renders a single source type label and inline status text for each row', () => {
    const job = buildJob('job-url', 'processing', {
      sourceType: 'url',
      progress: { completedChunks: 2, totalChunks: 6, failedChunks: 0 },
    })

    renderQueuePanel({ jobs: [job] })

    const queueItem = screen.getByTestId('embedding-queue-item-job-url')
    expect(within(queueItem).getByTestId('embedding-queue-source-type-job-url')).toHaveTextContent('URL')
    expect(within(queueItem).getAllByText('URL')).toHaveLength(1)
    expect(within(queueItem).getByTestId('embedding-queue-status-job-url')).toBeInTheDocument()
    expect(within(queueItem).getAllByText('Processing')).toHaveLength(1)
  })

  it('sorts processing first, queued second, then remaining rows by timeline', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-completed', 'completed', { updatedAt: '2026-02-07T12:05:00.000Z' }),
      buildJob('job-queued', 'queued', { updatedAt: '2026-02-07T12:04:00.000Z' }),
      buildJob('job-failed', 'failed', { updatedAt: '2026-02-07T12:03:00.000Z' }),
      buildJob('job-processing-new', 'processing', {
        updatedAt: '2026-02-07T12:06:00.000Z',
      }),
      buildJob('job-processing-old', 'processing', {
        updatedAt: '2026-02-07T12:02:00.000Z',
      }),
    ]

    const sortedIds = sortEmbeddingQueueJobs(jobs).map((job) => job.id)
    expect(sortedIds).toEqual([
      'job-processing-new',
      'job-processing-old',
      'job-queued',
      'job-completed',
      'job-failed',
    ])
  })

  it('marks the selected queue item for active row styling', () => {
    renderQueuePanel({
      jobs: [buildJob('job-selected', 'processing')],
      selectedJobId: 'job-selected',
    })

    expect(screen.getByTestId('embedding-queue-item-job-selected')).toHaveAttribute(
      'data-selected',
      'true'
    )
  })

  it('filters queue rows when a status metric is toggled', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued'),
      buildJob('job-processing', 'processing'),
      buildJob('job-completed', 'completed'),
      buildJob('job-failed', 'failed'),
    ]

    render(<QueueFilterHarness jobs={jobs} />)

    expect(screen.getByText('4 jobs total')).toBeInTheDocument()
    expect(screen.getByTestId('embedding-queue-item-job-queued')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('embedding-queue-metric-processing'))

    expect(screen.getByText('1 of 4 jobs')).toBeInTheDocument()
    expect(screen.getByTestId('embedding-queue-item-job-processing')).toBeInTheDocument()
    expect(screen.queryByTestId('embedding-queue-item-job-queued')).not.toBeInTheDocument()
    expect(screen.queryByTestId('embedding-queue-item-job-completed')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('embedding-queue-metric-processing'))

    expect(screen.getByText('4 jobs total')).toBeInTheDocument()
    expect(screen.getByTestId('embedding-queue-item-job-queued')).toBeInTheDocument()
    expect(screen.getByTestId('embedding-queue-item-job-completed')).toBeInTheDocument()
  })

  it('keeps status metric counts based on all jobs while filtered', () => {
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued'),
      buildJob('job-processing', 'processing'),
      buildJob('job-completed', 'completed'),
      buildJob('job-failed', 'failed'),
    ]

    renderQueuePanel({
      jobs,
      activeStatusFilter: 'processing',
    })

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
    expect(screen.getByText('1 of 4 jobs')).toBeInTheDocument()
  })

  it('renders filtered empty state and clears the active filter', () => {
    const handleStatusFilterChange = vi.fn()
    const jobs: TextEmbeddingJobSummary[] = [
      buildJob('job-queued', 'queued'),
      buildJob('job-processing', 'processing'),
    ]

    renderQueuePanel({
      jobs,
      activeStatusFilter: 'failed',
      onStatusFilterChange: handleStatusFilterChange,
    })

    expect(screen.getByText('No Failed jobs in queue.')).toBeInTheDocument()
    const [clearFilterButton] = screen.getAllByRole('button', {
      name: 'Clear filter',
    })
    expect(clearFilterButton).toBeDefined()
    if (clearFilterButton) {
      fireEvent.click(clearFilterButton)
    }
    expect(handleStatusFilterChange).toHaveBeenCalledWith(null)
  })

  it('renders empty and error states', () => {
    const handleRetry = vi.fn()

    const { rerender } = renderQueuePanel({
      jobs: [],
      onRetry: handleRetry,
    })

    expect(screen.getByText('No embeddings queued yet.')).toBeInTheDocument()

    rerender(
      <EmbeddingQueuePanel
        jobs={[]}
        isLoading={false}
        errorMessage='Request timeout'
        onRetry={handleRetry}
        onSelectJob={() => {}}
        activeStatusFilter={null}
        onStatusFilterChange={() => {}}
      />
    )

    expect(screen.getByText('Queue request failed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
