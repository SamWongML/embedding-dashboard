import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const metricSurfaceCardSpy = vi.fn()

vi.mock('@/components/dashboard/panels/shared/metric-surface-card', () => {
  return {
    __esModule: true,
    MetricSurfaceCard: (props: Record<string, unknown>) => {
      metricSurfaceCardSpy(props)
      return <div data-testid="metric-surface-card" />
    },
  }
})

vi.mock('@/components/charts/sparkline', () => {
  return {
    __esModule: true,
    Sparkline: () => <div data-testid="metric-sparkline" />,
  }
})

import { MetricCard } from '@/components/dashboard/panels/metrics/metric-card'

describe('MetricCard', () => {
  it('keeps explicit display metadata without compacting values', () => {
    render(
      <MetricCard
        metric={{
          label: 'Avg Cost / Query',
          value: 0.0016,
          valuePrefix: '$',
          valueFormat: { minimumFractionDigits: 4, maximumFractionDigits: 4 },
          change: -2.4,
          changeType: 'increase',
        }}
      />
    )

    const props = metricSurfaceCardSpy.mock.calls.at(-1)?.[0]
    expect(props).toMatchObject({
      title: 'Avg Cost / Query',
      value: 0.0016,
      valuePrefix: '$',
      valueFormat: { minimumFractionDigits: 4, maximumFractionDigits: 4 },
      valueSuffix: undefined,
    })
  })

  it('applies legacy compact number formatting when metadata is not provided', () => {
    render(
      <MetricCard
        metric={{
          label: 'Total Embeddings',
          value: 1_240_000,
          change: 11.7,
          changeType: 'increase',
        }}
      />
    )

    const props = metricSurfaceCardSpy.mock.calls.at(-1)?.[0]
    expect(props).toMatchObject({
      title: 'Total Embeddings',
      value: 1.24,
      valuePrefix: undefined,
      valueSuffix: 'M',
      valueFormat: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    })
  })
})

