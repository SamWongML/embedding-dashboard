import { describe, expect, it } from 'vitest'
import {
  formatUsdCompact,
  formatUsdExact,
  formatUsdFull,
} from '@/lib/format/currency-format'

describe('currency-format', () => {
  it('keeps full formatting for values below one thousand', () => {
    expect(formatUsdCompact(999)).toBe(formatUsdFull(999))
  })

  it('uses compact K notation for thousands', () => {
    expect(formatUsdCompact(1_200)).toBe('$1.2K')
    expect(formatUsdCompact(9_800)).toBe('$9.8K')
    expect(formatUsdCompact(12_500)).toBe('$13K')
  })

  it('uses compact M and B notation for larger numbers', () => {
    expect(formatUsdCompact(1_500_000)).toBe('$1.5M')
    expect(formatUsdCompact(1_250_000_000)).toBe('$1.3B')
  })

  it('keeps exact formatting with two fractional digits for accessibility labels', () => {
    expect(formatUsdExact(15.5)).toBe('$15.50')
    expect(formatUsdExact(1234)).toBe('$1,234.00')
  })
})
