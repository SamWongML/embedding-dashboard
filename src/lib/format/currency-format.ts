const THOUSAND = 1_000
const MILLION = 1_000_000
const BILLION = 1_000_000_000
const TRILLION = 1_000_000_000_000

const COMPACT_CURRENCY_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  compactDisplay: 'short',
}

function resolveCompactScale(absValue: number): number {
  if (absValue >= TRILLION) return TRILLION
  if (absValue >= BILLION) return BILLION
  if (absValue >= MILLION) return MILLION
  if (absValue >= THOUSAND) return THOUSAND
  return 1
}

export function formatUsdFull(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatUsdExact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatUsdCompact(value: number, locale = 'en-US'): string {
  const absValue = Math.abs(value)
  if (absValue < THOUSAND) {
    return formatUsdFull(value, locale)
  }

  const scale = resolveCompactScale(absValue)
  const scaledMagnitude = absValue / scale
  const precision = scaledMagnitude < 10 ? 1 : 0

  return new Intl.NumberFormat(locale, {
    ...COMPACT_CURRENCY_OPTIONS,
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(value)
}
