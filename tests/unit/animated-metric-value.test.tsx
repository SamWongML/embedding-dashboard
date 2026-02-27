import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockCanAnimate = true

vi.mock('@number-flow/react', () => {
  return {
    __esModule: true,
    default: ({
      value,
      suffix,
      animated,
      className,
    }: {
      value: number
      suffix?: string
      animated?: boolean
      className?: string
    }) => (
      <span
        data-testid="number-flow"
        data-value={String(value)}
        data-suffix={suffix ?? ''}
        data-animated={String(animated)}
        className={className}
      >
        {String(value)}
        {suffix ?? ''}
      </span>
    ),
    useCanAnimate: () => mockCanAnimate,
  }
})

import { AnimatedMetricValue } from '@/components/dashboard/panels/shared/animated-metric-value'

describe('AnimatedMetricValue', () => {
  beforeEach(() => {
    mockCanAnimate = true
    vi.useRealTimers()
  })

  it('renders NumberFlow for numeric values and applies tabular numeric styling', () => {
    render(<AnimatedMetricValue value={42} animationMode="always" />)

    const flow = screen.getByTestId('number-flow')
    expect(flow).toBeInTheDocument()
    expect(flow.className).toContain('[font-variant-numeric:tabular-nums]')
  })

  it('bypasses NumberFlow for string values', () => {
    render(<AnimatedMetricValue value="3d 12h" />)

    expect(screen.queryByTestId('number-flow')).not.toBeInTheDocument()
    expect(screen.getByText('3d 12h')).toBeInTheDocument()
  })

  it('uses static rendering path when motion is reduced', () => {
    mockCanAnimate = false
    const format = { notation: 'compact', maximumFractionDigits: 1 } as const

    render(<AnimatedMetricValue value={1250} format={format} suffix="Q" />)

    const expected = `${new Intl.NumberFormat(undefined, format).format(1250)}Q`
    expect(screen.queryByTestId('number-flow')).not.toBeInTheDocument()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('animates from zero on mount when delay is set', () => {
    vi.useFakeTimers()
    render(<AnimatedMetricValue value={87} animationMode="on-mount" delayMs={100} />)

    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-value', '0')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-value', '87')
  })

  it('renders first value immediately in on-change mode and animates subsequent updates', () => {
    const { rerender } = render(<AnimatedMetricValue value={42} animationMode="on-change" />)

    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-value', '42')
    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-animated', 'false')

    rerender(<AnimatedMetricValue value={84} animationMode="on-change" />)

    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-value', '84')
    expect(screen.getByTestId('number-flow')).toHaveAttribute('data-animated', 'true')
  })
})
