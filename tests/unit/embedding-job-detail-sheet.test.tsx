import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TextEmbeddingJobSummary } from '@/lib/schemas/text-embedding'

const mockUseTextEmbeddingJobDetail = vi.fn()

vi.mock('@/lib/hooks/use-text-embedding', () => ({
  useTextEmbeddingJobDetail: (...args: unknown[]) =>
    mockUseTextEmbeddingJobDetail(...args),
}))

import { EmbeddingJobDetailSheet } from '@/components/dashboard/panels/text-embedding/embedding-job-detail-sheet'

function buildJobSummary(
  overrides: Partial<TextEmbeddingJobSummary> = {}
): TextEmbeddingJobSummary {
  return {
    id: overrides.id ?? 'job-summary',
    status: overrides.status ?? 'processing',
    sourceType: overrides.sourceType ?? 'text',
    sourcePreview: overrides.sourcePreview ?? 'Summary preview',
    sourceUrl: overrides.sourceUrl,
    model: overrides.model ?? 'text-embedding-3-small',
    dimensions: overrides.dimensions ?? 1536,
    progress: {
      completedChunks: overrides.progress?.completedChunks ?? 1,
      totalChunks: overrides.progress?.totalChunks ?? 4,
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

describe('EmbeddingJobDetailSheet', () => {
  beforeEach(() => {
    mockUseTextEmbeddingJobDetail.mockReset()
  })

  it('shows pending result text for in-progress jobs', () => {
    mockUseTextEmbeddingJobDetail.mockReturnValue({
      data: {
        id: 'job-processing',
        status: 'processing',
        sourceType: 'text',
        sourcePreview: 'Processing demo',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        progress: { completedChunks: 1, totalChunks: 4, failedChunks: 0 },
        queuedAt: '2026-02-07T12:00:00.000Z',
        updatedAt: '2026-02-07T12:01:00.000Z',
        request: { source: { type: 'text', text: 'Processing demo' }, mode: 'simple' },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <EmbeddingJobDetailSheet
        jobId="job-processing"
        open
        onOpenChange={() => {}}
        onAnimationEnd={() => {}}
      />
    )

    expect(screen.getByText('Result will appear once the job is completed.')).toBeInTheDocument()
  })

  it('shows copy action for completed jobs', () => {
    mockUseTextEmbeddingJobDetail.mockReturnValue({
      data: {
        id: 'job-complete',
        status: 'completed',
        sourceType: 'text',
        sourcePreview: 'Completed demo',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        progress: { completedChunks: 2, totalChunks: 2, failedChunks: 0 },
        queuedAt: '2026-02-07T12:00:00.000Z',
        startedAt: '2026-02-07T12:00:10.000Z',
        completedAt: '2026-02-07T12:00:30.000Z',
        updatedAt: '2026-02-07T12:00:30.000Z',
        request: { source: { type: 'text', text: 'Completed demo' }, mode: 'simple' },
        result: {
          results: [
            {
              id: 'r1',
              text: 'chunk',
              vector: [0.1, 0.2, 0.3],
              model: 'text-embedding-3-small',
              tokenCount: 10,
              chunkIndex: 0,
              totalChunks: 1,
              createdAt: '2026-02-07T12:00:30.000Z',
            },
          ],
          totalTokens: 10,
          processingTime: 123,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <EmbeddingJobDetailSheet
        jobId="job-complete"
        open
        onOpenChange={() => {}}
        onAnimationEnd={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: 'Copy Full Vector' })).toBeInTheDocument()
  })

  it('does not render stale job detail when query data belongs to another job id', () => {
    mockUseTextEmbeddingJobDetail.mockReturnValue({
      data: {
        id: 'job-old',
        status: 'completed',
        sourceType: 'text',
        sourcePreview: 'Old job preview',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        progress: { completedChunks: 2, totalChunks: 2, failedChunks: 0 },
        queuedAt: '2026-02-07T12:00:00.000Z',
        updatedAt: '2026-02-07T12:01:00.000Z',
      },
      isLoading: false,
      isPending: false,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <EmbeddingJobDetailSheet
        jobId="job-new"
        open
        onOpenChange={() => {}}
        onAnimationEnd={() => {}}
      />
    )

    expect(
      screen.queryByText('job-old - text-embedding-3-small (1536d)')
    ).not.toBeInTheDocument()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders selected queue summary in header while fresh detail is hydrating', () => {
    mockUseTextEmbeddingJobDetail.mockReturnValue({
      data: {
        id: 'job-old',
        status: 'completed',
        sourceType: 'text',
        sourcePreview: 'Old job preview',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        progress: { completedChunks: 2, totalChunks: 2, failedChunks: 0 },
        queuedAt: '2026-02-07T12:00:00.000Z',
        updatedAt: '2026-02-07T12:01:00.000Z',
      },
      isLoading: false,
      isPending: false,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    const jobSummary = buildJobSummary({
      id: 'job-new',
      status: 'processing',
      model: 'text-embedding-3-large',
      dimensions: 3072,
      sourcePreview: 'New queue summary preview',
    })

    render(
      <EmbeddingJobDetailSheet
        jobId="job-new"
        jobSummary={jobSummary}
        open
        onOpenChange={() => {}}
        onAnimationEnd={() => {}}
      />
    )

    expect(
      screen.getByText('job-new - text-embedding-3-large (3072d)')
    ).toBeInTheDocument()
    expect(screen.getByText('New queue summary preview')).toBeInTheDocument()
    expect(
      screen.queryByText('job-old - text-embedding-3-small (1536d)')
    ).not.toBeInTheDocument()
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0)
  })
})
