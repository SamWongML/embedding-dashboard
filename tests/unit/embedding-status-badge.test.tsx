import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmbeddingStatusBadge } from '@/components/dashboard/panels/text-embedding/embedding-status-badge'

describe('EmbeddingStatusBadge', () => {
  it('renders semantic labels for each status', () => {
    const statuses: Array<'queued' | 'processing' | 'completed' | 'failed'> = [
      'queued',
      'processing',
      'completed',
      'failed',
    ]

    statuses.forEach((status) => {
      render(<EmbeddingStatusBadge status={status} />)
    })

    expect(screen.getByText('Queued')).toBeInTheDocument()
    expect(screen.getByText('Processing')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })
})
