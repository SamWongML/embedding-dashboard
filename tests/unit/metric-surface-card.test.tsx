import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/dashboard/panels/shared/animated-metric-value', () => {
  return {
    __esModule: true,
    AnimatedMetricValue: ({
      value,
      prefix,
      suffix,
      className,
    }: {
      value: number | string
      prefix?: string
      suffix?: string
      className?: string
    }) => (
      <span
        data-testid="animated-metric-value"
        data-prefix={prefix ?? ''}
        data-suffix={suffix ?? ''}
        className={className}
      >
        {prefix ?? ''}
        {String(value)}
        {suffix ?? ''}
      </span>
    ),
  }
})

import { MetricSurfaceCard } from '@/components/dashboard/panels/shared/metric-surface-card'

describe('MetricSurfaceCard', () => {
  it('applies the shared metric card class contract and renders optional slots', () => {
    render(
      <MetricSurfaceCard
        title="Total Requests"
        value={128}
        icon={<svg data-testid="metric-icon" />}
        valueAdornment={<span>+12%</span>}
        meta={<span>Last 24 hours</span>}
        rightContent={<div data-testid="sparkline-slot">sparkline</div>}
      />
    )

    const card = screen.getByText('Total Requests').closest('[data-slot="card"]')
    expect(card).not.toBeNull()
    expect(card).toHaveClass('h-full')
    expect(card?.className).toContain('min-h-[var(--metric-card-min-height)]')
    expect(card?.className).toContain('[--card-padding:var(--metric-card-padding)]')

    const header = screen.getByText('Total Requests').closest('[data-slot="card-header"]')
    expect(header?.className).toContain('pb-(--metric-card-header-padding-bottom)')

    expect(screen.getByTestId('animated-metric-value')).toBeInTheDocument()
    expect(screen.getByTestId('metric-icon')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument()
    expect(screen.getByTestId('sparkline-slot')).toBeInTheDocument()
  })

  it('keeps optional sections absent when props are omitted', () => {
    render(<MetricSurfaceCard title="Errors" value={0} />)

    expect(screen.getByText('Errors')).toBeInTheDocument()
    expect(screen.getByTestId('animated-metric-value')).toBeInTheDocument()
    expect(screen.queryByTestId('sparkline-slot')).not.toBeInTheDocument()
  })

  it('passes value prefix metadata to animated metric values', () => {
    render(<MetricSurfaceCard title="Avg Cost / Query" value={0.0016} valuePrefix="$" />)

    expect(screen.getByTestId('animated-metric-value')).toHaveAttribute('data-prefix', '$')
  })
})
