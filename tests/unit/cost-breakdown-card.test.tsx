import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CostBreakdownCard } from '@/components/dashboard/panels/metrics/cost-breakdown-card'
import { formatUsdCompact, formatUsdExact } from '@/lib/format/currency-format'

vi.mock('@/components/providers/theme-provider', () => ({
  useTheme: () => ({ resolvedTheme: 'light' as const }),
}))

describe('CostBreakdownCard', () => {
  it('renders compact totals and preserves exact legend accessibility labels', () => {
    const items = [
      { category: 'embedding_api' as const, amountUsd: 1_250_000 },
      { category: 'vector_storage' as const, amountUsd: 250_000 },
      { category: 'search_queries' as const, amountUsd: 125_000 },
      { category: 'graph_operations' as const, amountUsd: 25_000 },
      { category: 'data_transfer' as const, amountUsd: 5_000 },
    ]
    const total = items.reduce((sum, item) => sum + item.amountUsd, 0)

    const { container } = render(<CostBreakdownCard items={items} />)

    expect(screen.getByText(formatUsdCompact(total))).toBeVisible()
    expect(screen.getByText(formatUsdCompact(items[0].amountUsd))).toBeVisible()

    const firstLegendRow = container.querySelector('[data-slot="cost-breakdown-legend-row"]')
    expect(firstLegendRow).not.toBeNull()
    expect(firstLegendRow).toHaveAttribute(
      'aria-label',
      expect.stringContaining(formatUsdExact(items[0].amountUsd))
    )
  })
})
