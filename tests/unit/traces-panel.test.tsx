import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TracesPanel } from '@/components/dashboard/panels/server-status/traces-panel'
import { useRecentTraces, useTraceSpans } from '@/lib/hooks/use-server-status'
import type { ErrorLog, TraceSpansResponse, TraceSummary } from '@/lib/schemas/server-status'

vi.mock('@/lib/hooks/use-server-status', () => ({
  useRecentTraces: vi.fn(),
  useTraceSpans: vi.fn(),
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('@/lib/runtime/data-mode', () => ({
  isApiDataMode: () => true,
}))

const tracesFixture: TraceSummary[] = [
  {
    id: 'tr-a8f3c2',
    traceId: 'tr-a8f3c2',
    timestamp: '2026-02-27T10:00:00.000Z',
    status: 'ok',
    method: 'POST',
    route: '/embed/text',
    service: 'Embedding Service',
    durationMs: 234,
    spanCount: 7,
  },
  {
    id: 'tr-c0f5e8',
    traceId: 'tr-c0f5e8',
    timestamp: '2026-02-27T09:59:54.000Z',
    status: 'ok',
    method: 'POST',
    route: '/search/hybrid',
    service: 'Search Service',
    durationMs: 445,
    spanCount: 9,
  },
  {
    id: 'tr-d1a6f9',
    traceId: 'tr-d1a6f9',
    timestamp: '2026-02-27T09:59:48.000Z',
    status: 'error',
    method: 'GET',
    route: '/graph/query',
    service: 'Graph Engine',
    durationMs: 3200,
    spanCount: 15,
  },
]

const spansFixture: TraceSpansResponse = {
  traceId: 'tr-a8f3c2',
  traceDurationMs: 234,
  spans: [
    {
      id: 'tr-a8f3c2-span-01',
      traceId: 'tr-a8f3c2',
      name: 'API Gateway',
      service: 'API Gateway',
      status: 'ok',
      category: 'http',
      startMs: 0,
      durationMs: 234,
      depth: 0,
    },
  ],
}

const legacyErrorsFixture: ErrorLog[] = []

describe('TracesPanel', () => {
  beforeEach(() => {
    vi.mocked(useRecentTraces).mockReturnValue({
      data: tracesFixture,
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    } as never)

    vi.mocked(useTraceSpans).mockReturnValue({
      data: spansFixture,
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    } as never)
  })

  it('renders traces table and waterfall detail', async () => {
    render(<TracesPanel legacyErrors={legacyErrorsFixture} />)

    expect(screen.getByText('Recent Traces')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search traces' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText('POST /embed/text')).toBeInTheDocument()
    expect(screen.getByText('GET /graph/query')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Span Waterfall')).toBeInTheDocument()
      expect(screen.getByText('API Gateway')).toBeInTheDocument()
    })
  })

  it('supports keyboard row navigation on filtered traces', async () => {
    render(<TracesPanel legacyErrors={legacyErrorsFixture} />)

    const tableRegion = screen.getByLabelText(
      'Recent traces table. Use arrow keys or J/K to move selection, Enter to open details.'
    )
    const searchInput = screen.getByRole('textbox', { name: 'Search traces' })

    fireEvent.change(searchInput, { target: { value: 'status:ok' } })

    await waitFor(() => {
      const firstRow = screen.getByText('POST /embed/text').closest('tr')
      expect(firstRow).toHaveAttribute('data-state', 'selected')
      expect(useTraceSpans).toHaveBeenLastCalledWith('tr-a8f3c2')
    })

    fireEvent.keyDown(tableRegion, { key: 'ArrowDown' })

    await waitFor(() => {
      const nextRow = screen.getByText('POST /search/hybrid').closest('tr')
      expect(nextRow).toHaveAttribute('data-state', 'selected')
      expect(useTraceSpans).toHaveBeenLastCalledWith('tr-c0f5e8')
    })
  })

  it('filters rows by status search and updates selected trace', async () => {
    render(<TracesPanel legacyErrors={legacyErrorsFixture} />)

    const searchInput = screen.getByRole('textbox', { name: 'Search traces' })
    fireEvent.change(searchInput, { target: { value: 'error' } })

    await waitFor(() => {
      expect(screen.getByText('tr-d1a6f9')).toBeInTheDocument()
      expect(screen.queryByText('tr-a8f3c2')).not.toBeInTheDocument()
      expect(useTraceSpans).toHaveBeenLastCalledWith('tr-d1a6f9')
    })
  })

  it('renders the empty search state copy when nothing matches', async () => {
    render(<TracesPanel legacyErrors={legacyErrorsFixture} />)

    const searchInput = screen.getByRole('textbox', { name: 'Search traces' })
    fireEvent.change(searchInput, { target: { value: 'status:oops' } })

    await waitFor(() => {
      expect(
        screen.getByText('No traces match this search. Try different terms or token filters.')
      ).toBeInTheDocument()
    })
  })

  it('clicking a row updates the span query trace id', async () => {
    render(<TracesPanel legacyErrors={legacyErrorsFixture} />)

    fireEvent.click(screen.getByText('tr-d1a6f9'))

    await waitFor(() => {
      expect(useTraceSpans).toHaveBeenLastCalledWith('tr-d1a6f9')
    })
  })
})
