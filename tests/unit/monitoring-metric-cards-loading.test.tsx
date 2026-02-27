import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  MonitoringMetricCardSkeleton,
  MonitoringMetricCardsSkeleton,
} from '@/components/dashboard/panels/shared/monitoring-metric-cards-loading'

describe('Monitoring metric cards loading primitives', () => {
  it('renders the requested number of card skeletons using the shared grid contract', () => {
    const { container } = render(<MonitoringMetricCardsSkeleton count={3} />)

    const grid = container.firstElementChild as HTMLElement | null
    const cards = container.querySelectorAll('[data-slot="card"]')

    expect(grid).not.toBeNull()
    expect(grid?.className).toContain('grid auto-rows-fr')
    expect(grid?.className).toContain('gap-(--metric-card-grid-gap)')
    expect(grid?.className).toContain(
      'repeat(auto-fit,minmax(var(--metric-card-grid-min-width),1fr))'
    )
    expect(cards).toHaveLength(3)
    expect(cards[0]?.className).toContain('min-h-[var(--metric-card-min-height)]')
    expect(cards[0]?.className).toContain('[--card-padding:var(--metric-card-padding)]')
  })

  it('marks decorative skeleton blocks as aria-hidden', () => {
    const { container } = render(<MonitoringMetricCardSkeleton />)
    const skeletonBlocks = Array.from(container.querySelectorAll('[data-slot="skeleton"]'))

    expect(skeletonBlocks.length).toBeGreaterThan(0)
    skeletonBlocks.forEach((block) => {
      expect(block).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
