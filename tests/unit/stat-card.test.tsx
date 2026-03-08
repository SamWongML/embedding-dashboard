import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/dashboard/panels/shared/animated-metric-value', () => {
  return {
    __esModule: true,
    AnimatedMetricValue: ({
      value,
      suffix,
      format,
      animationMode,
      className,
    }: {
      value: number | string
      suffix?: string
      format?: unknown
      animationMode?: string
      className?: string
    }) => (
      <span
        data-testid="animated-metric-value"
        data-format={format ? JSON.stringify(format) : ''}
        data-animation-mode={animationMode ?? ''}
        className={className}
      >
        {String(value)}
        {suffix ?? ''}
      </span>
    ),
  }
})

vi.mock('@/components/charts/sparkline', () => {
  return {
    __esModule: true,
    Sparkline: ({ data }: { data: number[] }) => (
      <div data-testid="sparkline-slot">{String(data.length)}</div>
    ),
  }
})

vi.mock('lucide-react', () => {
  return {
    __esModule: true,
    ArrowUp: ({ className }: { className?: string }) => <svg data-testid="trend-up" className={className} />,
    ArrowDown: ({ className }: { className?: string }) => <svg data-testid="trend-down" className={className} />,
    Minus: ({ className }: { className?: string }) => <svg data-testid="trend-neutral" className={className} />,
  }
})

import { StatCard } from '@/components/dashboard/panels/server-status/stat-card'

describe('StatCard', () => {
  it('renders usage-style trend row with icon, absolute percent and tone', () => {
    const { rerender } = render(
      <StatCard
        title="Avg Latency"
        value={142}
        valueSuffix="ms"
        change={-8.3}
        changeType="increase"
        sparkline={[1, 2, 3]}
      />
    )

    expect(screen.getByTestId('trend-up')).toBeInTheDocument()
    expect(screen.getByText('8.3%')).toBeInTheDocument()
    expect(screen.getByText('8.3%').parentElement).toHaveClass('text-success')
    expect(screen.getByTestId('sparkline-slot')).toHaveTextContent('3')

    rerender(
      <StatCard
        title="Error Rate"
        value={0.12}
        valueSuffix="%"
        change={0.02}
        changeType="decrease"
      />
    )

    expect(screen.getByTestId('trend-down')).toBeInTheDocument()
    expect(screen.getByText('0.0%').parentElement).toHaveClass('text-error')
    expect(screen.queryByTestId('sparkline-slot')).not.toBeInTheDocument()

    rerender(
      <StatCard
        title="Throughput"
        value={0}
        valueSuffix="/s"
        change={0}
        changeType="neutral"
      />
    )

    expect(screen.getByTestId('trend-neutral')).toBeInTheDocument()
    expect(screen.getByText('0.0%').parentElement).toHaveClass('text-muted-foreground')
  })

  it('passes valueFormat through to the animated value renderer', () => {
    render(
      <StatCard
        title="Error Rate"
        value={0.12}
        valueSuffix="%"
        valueFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        change={0}
        changeType="neutral"
      />
    )

    expect(screen.getByText('0.12%')).toBeInTheDocument()
    expect(screen.getByTestId('animated-metric-value')).toHaveAttribute(
      'data-format',
      JSON.stringify({ minimumFractionDigits: 2, maximumFractionDigits: 2 })
    )
    expect(screen.getByTestId('animated-metric-value')).toHaveAttribute(
      'data-animation-mode',
      'always'
    )
  })

  it('forwards an explicit animation override through the shared card stack', () => {
    render(
      <StatCard
        title="Throughput"
        value={2.4}
        valueSuffix="/s"
        change={0}
        changeType="neutral"
        animationMode="never"
      />
    )

    expect(screen.getByTestId('animated-metric-value')).toHaveAttribute(
      'data-animation-mode',
      'never'
    )
  })
})
