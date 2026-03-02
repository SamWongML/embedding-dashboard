import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseTextEmbeddingJobDetail = vi.fn()

vi.mock('@/lib/hooks/use-text-embedding', () => ({
  useTextEmbeddingJobDetail: (...args: unknown[]) =>
    mockUseTextEmbeddingJobDetail(...args),
}))

import { EmbeddingJobDetailSheet } from '@/components/dashboard/panels/text-embedding/embedding-job-detail-sheet'

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
})
