const DEFAULT_WIDTH_FALLBACK_STEP = 4
const LABEL_BUDGET_PX = 72
const MAX_VISIBLE_LABELS = 12
const MIN_VISIBLE_LABELS = 2

const ALLOWED_HOURLY_STEPS = [1, 2, 3, 4, 6, 8, 12] as const
const ALLOWED_DAILY_STEPS = [1, 2, 3, 5, 7, 10, 14] as const

export type TimeTickCadence = 'hourly' | 'daily'

function normalizePointCount(pointCount: number) {
  if (!Number.isFinite(pointCount)) return 1
  return Math.max(1, Math.floor(pointCount))
}

function normalizeWidth(widthPx: number) {
  if (!Number.isFinite(widthPx)) return Number.NaN
  return widthPx > 0 ? widthPx : Number.NaN
}

function resolveAllowedSteps(cadence: TimeTickCadence) {
  return cadence === 'hourly' ? ALLOWED_HOURLY_STEPS : ALLOWED_DAILY_STEPS
}

export function getTimeTickStep(
  pointCount: number,
  widthPx: number,
  cadence: TimeTickCadence = 'hourly'
): number {
  const normalizedPointCount = normalizePointCount(pointCount)
  const normalizedWidth = normalizeWidth(widthPx)
  const allowedSteps = resolveAllowedSteps(cadence)

  if (!Number.isFinite(normalizedWidth)) {
    return DEFAULT_WIDTH_FALLBACK_STEP
  }

  const maxLabelsByWidth = Math.floor(normalizedWidth / LABEL_BUDGET_PX)
  const maxVisibleLabels = Math.max(
    MIN_VISIBLE_LABELS,
    Math.min(MAX_VISIBLE_LABELS, maxLabelsByWidth)
  )

  for (const step of allowedSteps) {
    const projectedLabels = Math.ceil(normalizedPointCount / step)
    if (projectedLabels <= maxVisibleLabels) {
      return step
    }
  }

  return allowedSteps[allowedSteps.length - 1]
}

export function getHourlyTickStep(pointCount: number, widthPx: number): number {
  return getTimeTickStep(pointCount, widthPx, 'hourly')
}

export function getDailyTickStep(pointCount: number, widthPx: number): number {
  return getTimeTickStep(pointCount, widthPx, 'daily')
}

export function buildDeterministicUtcTimeTicks(
  timestamps: number[],
  widthPx: number,
  cadence: TimeTickCadence = 'hourly'
): number[] {
  const sortedUniqueTimestamps = [...new Set(
    timestamps.filter((timestamp) => Number.isFinite(timestamp))
  )].sort((left, right) => left - right)

  if (!sortedUniqueTimestamps.length) {
    return []
  }

  const step = getTimeTickStep(sortedUniqueTimestamps.length, widthPx, cadence)
  const lastIndex = sortedUniqueTimestamps.length - 1
  const ticks = sortedUniqueTimestamps.filter((_, index) => (lastIndex - index) % step === 0)

  return ticks.length > 0 ? ticks : [sortedUniqueTimestamps[lastIndex] ?? 0]
}

export function buildDeterministicUtcHourTicks(timestamps: number[], widthPx: number): number[] {
  return buildDeterministicUtcTimeTicks(timestamps, widthPx, 'hourly')
}

export function buildDeterministicUtcDayTicks(timestamps: number[], widthPx: number): number[] {
  return buildDeterministicUtcTimeTicks(timestamps, widthPx, 'daily')
}
