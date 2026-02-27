const DEFAULT_WIDTH_FALLBACK_STEP = 4
const LABEL_BUDGET_PX = 72
const MAX_VISIBLE_LABELS = 12
const MIN_VISIBLE_LABELS = 2

const ALLOWED_HOURLY_STEPS = [1, 2, 3, 4, 6, 8, 12] as const

function normalizePointCount(pointCount: number) {
  if (!Number.isFinite(pointCount)) return 1
  return Math.max(1, Math.floor(pointCount))
}

function normalizeWidth(widthPx: number) {
  if (!Number.isFinite(widthPx)) return Number.NaN
  return widthPx > 0 ? widthPx : Number.NaN
}

export function getHourlyTickStep(pointCount: number, widthPx: number): number {
  const normalizedPointCount = normalizePointCount(pointCount)
  const normalizedWidth = normalizeWidth(widthPx)

  if (!Number.isFinite(normalizedWidth)) {
    return DEFAULT_WIDTH_FALLBACK_STEP
  }

  const maxLabelsByWidth = Math.floor(normalizedWidth / LABEL_BUDGET_PX)
  const maxVisibleLabels = Math.max(
    MIN_VISIBLE_LABELS,
    Math.min(MAX_VISIBLE_LABELS, maxLabelsByWidth)
  )

  for (const step of ALLOWED_HOURLY_STEPS) {
    const projectedLabels = Math.ceil(normalizedPointCount / step)
    if (projectedLabels <= maxVisibleLabels) {
      return step
    }
  }

  return ALLOWED_HOURLY_STEPS[ALLOWED_HOURLY_STEPS.length - 1]
}

export function buildDeterministicUtcHourTicks(timestamps: number[], widthPx: number): number[] {
  const sortedUniqueTimestamps = [...new Set(
    timestamps.filter((timestamp) => Number.isFinite(timestamp))
  )].sort((left, right) => left - right)

  if (!sortedUniqueTimestamps.length) {
    return []
  }

  const step = getHourlyTickStep(sortedUniqueTimestamps.length, widthPx)
  const lastIndex = sortedUniqueTimestamps.length - 1
  const ticks = sortedUniqueTimestamps.filter((_, index) => (lastIndex - index) % step === 0)

  return ticks.length > 0 ? ticks : [sortedUniqueTimestamps[lastIndex] ?? 0]
}
