import type { SearchAnalytics } from '@/lib/schemas/metrics'
import type {
  ErrorLog,
  LatencyResponse,
} from '@/lib/schemas/server-status'

export const HOUR_MS = 60 * 60 * 1000

const DEFAULT_POINT_COUNT = 24
const DEFAULT_LATENCY_WINDOW_HOURS = 4
const UTC_HOUR_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export interface LatencyDistributionPoint {
  timestamp: number
  rawTimestamp: string
  label: string
  p50: number | null
  p95: number | null
  p99: number | null
}

export interface ThroughputErrorsPoint {
  timestamp: number
  rawTimestamp: string
  label: string
  requests: number
  errors: number
}

interface BuildLatencyDistributionSeriesOptions {
  pointCount?: number
  windowHours?: number
}

interface BuildThroughputErrorsSeriesOptions {
  pointCount?: number
}

interface ParsedLatencyPoint {
  timestamp: number
  value: number
}

function toHourLabel(date: Date) {
  return UTC_HOUR_LABEL_FORMATTER.format(date)
}

function clampNonNegative(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

function parseLatencyHistory(history: Array<{ timestamp: string; value: number }>): ParsedLatencyPoint[] {
  return history
    .map((point) => ({
      timestamp: Date.parse(point.timestamp),
      value: point.value,
    }))
    .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.value))
    .sort((left, right) => left.timestamp - right.timestamp)
}

function nearestRankPercentile(values: number[], percentile: number) {
  if (values.length === 0) return null

  const sorted = [...values].sort((left, right) => left - right)
  const rank = Math.ceil(percentile * sorted.length)
  const index = Math.min(sorted.length - 1, Math.max(0, rank - 1))

  return sorted[index] ?? null
}

function resolveWindowPercentiles(samples: number[]) {
  return {
    p50: nearestRankPercentile(samples, 0.5),
    p95: nearestRankPercentile(samples, 0.95),
    p99: nearestRankPercentile(samples, 0.99),
  }
}

export function startOfUtcHour(date: Date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    0,
    0,
    0
  ))
}

export function resolveReferenceDate(
  latency?: Pick<LatencyResponse, 'history'>,
  errors?: ErrorLog[]
) {
  const history = latency?.history ?? []

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const timestamp = history[index]?.timestamp
    if (!timestamp) continue
    const parsed = new Date(timestamp)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  let maxTime = -Infinity
  for (const error of errors ?? []) {
    const parsed = new Date(error.timestamp).getTime()
    if (Number.isFinite(parsed) && parsed > maxTime) {
      maxTime = parsed
    }
  }

  if (Number.isFinite(maxTime)) {
    return new Date(maxTime)
  }

  return new Date()
}

export function countErrorsBetween(errors: ErrorLog[], startInclusive: Date, endExclusive: Date) {
  const start = startInclusive.getTime()
  const end = endExclusive.getTime()

  return errors.reduce((count, error) => {
    const timestamp = new Date(error.timestamp).getTime()
    if (!Number.isFinite(timestamp)) {
      return count
    }
    return timestamp >= start && timestamp < end ? count + 1 : count
  }, 0)
}

export function buildLatencyDistributionSeries(
  history: Array<{ timestamp: string; value: number }>,
  options: BuildLatencyDistributionSeriesOptions = {}
): LatencyDistributionPoint[] {
  const pointCount = Math.max(1, Math.floor(options.pointCount ?? DEFAULT_POINT_COUNT))
  const windowHours = Math.max(1, Math.floor(options.windowHours ?? DEFAULT_LATENCY_WINDOW_HOURS))
  const parsedHistory = parseLatencyHistory(history)
  const referenceDate = parsedHistory.length > 0
    ? new Date(parsedHistory[parsedHistory.length - 1]?.timestamp ?? Date.now())
    : new Date()
  const anchorHourStart = startOfUtcHour(referenceDate)

  let fallbackPoint: Pick<LatencyDistributionPoint, 'p50' | 'p95' | 'p99'> = {
    p50: null,
    p95: null,
    p99: null,
  }

  return Array.from({ length: pointCount }, (_, index) => {
    const hourOffset = pointCount - 1 - index
    const hourStart = new Date(anchorHourStart.getTime() - hourOffset * HOUR_MS)
    const hourEnd = new Date(hourStart.getTime() + HOUR_MS)
    const windowStart = new Date(hourStart.getTime() - (windowHours - 1) * HOUR_MS)
    const samples = parsedHistory
      .filter((point) => point.timestamp >= windowStart.getTime() && point.timestamp < hourEnd.getTime())
      .map((point) => point.value)
    const percentiles = samples.length > 0 ? resolveWindowPercentiles(samples) : fallbackPoint

    if (samples.length > 0) {
      fallbackPoint = percentiles
    }

    return {
      timestamp: hourStart.getTime(),
      rawTimestamp: hourStart.toISOString(),
      label: toHourLabel(hourStart),
      p50: percentiles.p50,
      p95: percentiles.p95,
      p99: percentiles.p99,
    }
  })
}

export function buildThroughputErrorsSeries(
  searchAnalytics: SearchAnalytics[],
  errors: ErrorLog[],
  latency?: Pick<LatencyResponse, 'history'>,
  options: BuildThroughputErrorsSeriesOptions = {}
): ThroughputErrorsPoint[] {
  const pointCount = Math.max(1, Math.floor(options.pointCount ?? DEFAULT_POINT_COUNT))
  const referenceDate = resolveReferenceDate(latency, errors)
  const anchorHourStart = startOfUtcHour(referenceDate)
  const recentAnalytics = searchAnalytics.slice(-pointCount)
  const requestsByIndex = Array.from({ length: pointCount }, () => 0)
  const startIndex = Math.max(0, pointCount - recentAnalytics.length)

  recentAnalytics.forEach((point, index) => {
    requestsByIndex[startIndex + index] = clampNonNegative(point.count)
  })

  return Array.from({ length: pointCount }, (_, index) => {
    const hourOffset = pointCount - 1 - index
    const hourStart = new Date(anchorHourStart.getTime() - hourOffset * HOUR_MS)
    const hourEnd = new Date(hourStart.getTime() + HOUR_MS)

    return {
      timestamp: hourStart.getTime(),
      rawTimestamp: hourStart.toISOString(),
      label: toHourLabel(hourStart),
      requests: requestsByIndex[index] ?? 0,
      errors: countErrorsBetween(errors, hourStart, hourEnd),
    }
  })
}
