import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TraceWaterfall, computeSpanLayout } from '@/components/dashboard/panels/server-status/trace-waterfall'
import type { TraceSpansResponse, TraceSummary } from '@/lib/schemas/server-status'

describe('TraceWaterfall', () => {
  it('computes span layout percentages within the timeline bounds', () => {
    expect(computeSpanLayout({ startMs: 20, durationMs: 50 }, 200)).toEqual({
      leftPercent: 10,
      widthPercent: 25,
    })

    const clamped = computeSpanLayout({ startMs: 195, durationMs: 40 }, 200)
    expect(clamped.leftPercent).toBe(97.5)
    expect(clamped.widthPercent).toBeLessThanOrEqual(2.5)
  })

  it('renders span lanes and emits selection callbacks', () => {
    const onSelectSpan = vi.fn()
    const trace: TraceSummary = {
      id: 'tr-a8f3c2',
      traceId: 'tr-a8f3c2',
      timestamp: '2026-02-27T10:00:00.000Z',
      status: 'ok',
      method: 'POST',
      route: '/embed/text',
      service: 'Embedding Service',
      durationMs: 234,
      spanCount: 2,
    }

    const detail: TraceSpansResponse = {
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
        {
          id: 'tr-a8f3c2-span-02',
          traceId: 'tr-a8f3c2',
          name: 'Model Inference',
          service: 'Embedding Service',
          status: 'ok',
          category: 'model',
          startMs: 40,
          durationMs: 120,
          depth: 1,
        },
      ],
    }

    render(
      <TraceWaterfall
        trace={trace}
        detail={detail}
        selectedSpanId={null}
        onSelectSpan={onSelectSpan}
      />
    )

    expect(screen.getByText('API Gateway')).toBeInTheDocument()
    expect(screen.getByText('Model Inference')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Model Inference' }))
    expect(onSelectSpan).toHaveBeenCalledWith('tr-a8f3c2-span-02')
  })

  it('uses a dedicated scroll region in sheet-mobile mode', () => {
    const trace: TraceSummary = {
      id: 'tr-a8f3c2',
      traceId: 'tr-a8f3c2',
      timestamp: '2026-02-27T10:00:00.000Z',
      status: 'ok',
      method: 'POST',
      route: '/embed/text',
      service: 'Embedding Service',
      durationMs: 234,
      spanCount: 2,
    }

    const detail: TraceSpansResponse = {
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
        {
          id: 'tr-a8f3c2-span-02',
          traceId: 'tr-a8f3c2',
          name: 'Model Inference',
          service: 'Embedding Service',
          status: 'ok',
          category: 'model',
          startMs: 40,
          durationMs: 120,
          depth: 1,
        },
      ],
    }

    const { rerender } = render(
      <TraceWaterfall
        trace={trace}
        detail={detail}
        selectedSpanId={null}
        scrollMode="sheet-mobile"
      />
    )

    const mobileScrollRegion = document.querySelector('[data-slot="trace-waterfall-scroll-region"]')
    expect(mobileScrollRegion).not.toBeNull()
    expect(mobileScrollRegion).toHaveClass('overflow-auto')

    rerender(<TraceWaterfall trace={trace} detail={detail} selectedSpanId={null} />)

    expect(document.querySelector('[data-slot="trace-waterfall-scroll-region"]')).toBeNull()
  })

  it('reuses chart tooltip content for waterfall spans with compact rows', async () => {
    const trace: TraceSummary = {
      id: 'tr-a8f3c2',
      traceId: 'tr-a8f3c2',
      timestamp: '2026-02-27T10:00:00.000Z',
      status: 'ok',
      method: 'POST',
      route: '/embed/text',
      service: 'Embedding Service',
      durationMs: 234,
      spanCount: 2,
    }

    const detail: TraceSpansResponse = {
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
        {
          id: 'tr-a8f3c2-span-02',
          traceId: 'tr-a8f3c2',
          name: 'Model Inference',
          service: 'Embedding Service',
          status: 'ok',
          category: 'model',
          startMs: 40,
          durationMs: 120,
          depth: 1,
        },
      ],
    }

    render(<TraceWaterfall trace={trace} detail={detail} selectedSpanId={null} />)

    const spanBarButton = screen.getByRole('button', { name: /Model Inference\s*·\s*120ms/ })
    fireEvent.focus(spanBarButton)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Model Inference')
    expect(tooltip).toHaveTextContent('Scope')
    expect(tooltip).toHaveTextContent('Embedding Service · OK / Model')
    expect(tooltip).toHaveTextContent('Timing')
    expect(tooltip).toHaveTextContent('+40ms · 120ms')

    const tooltipContent = document.querySelector('[data-slot="tooltip-content"]')
    expect(tooltipContent).not.toBeNull()
    expect(tooltipContent).toHaveClass('p-0')
    expect(tooltipContent).not.toHaveClass('bg-foreground')

    const tooltipCard = document.querySelector('[data-slot="tooltip-content"] > div')
    expect(tooltipCard).not.toBeNull()
    expect(tooltipCard).toHaveClass('bg-popover')
    expect(tooltipCard).toHaveClass('border-border')
    expect(tooltipCard).toHaveClass('shadow-md')
    expect(document.querySelector('[data-slot="tooltip-content"] .rounded-full')).toBeNull()

    const tooltipArrow = document.querySelector('[data-slot="tooltip-content"] svg')
    expect(tooltipArrow).toBeNull()
  })
})
