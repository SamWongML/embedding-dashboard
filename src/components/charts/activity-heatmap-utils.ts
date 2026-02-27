import type { SearchAnalytics } from '@/lib/schemas/metrics'

export type ActivityHeatmapPeriod = '24h' | '7d' | '30d'
export type ActivityHeatmapLevel = 0 | 1 | 2 | 3 | 4

type ActivityHeatmapRangeKey = 1 | 2 | 3 | 4

interface ActivityHeatmapPoint {
  dayLabel: string
  hour: number
  count: number
}

export interface ActivityHeatmapCell {
  id: string
  dayLabel: string
  hour: number
  hourLabel: string
  count: number
  level: ActivityHeatmapLevel
}

export interface ActivityHeatmapRow {
  id: string
  label: string
  cells: ActivityHeatmapCell[]
}

export interface ActivityHeatmapScale {
  minNonZero: number
  maxNonZero: number
  ranges: Record<ActivityHeatmapRangeKey, { min: number; max: number }>
  toLevel: (count: number) => ActivityHeatmapLevel
}

export interface ActivityHeatmapLegendBin {
  level: ActivityHeatmapLevel
  min: number
  max: number
  label: string
}

export interface ActivityHeatmapModel {
  rows: ActivityHeatmapRow[]
  legend: ActivityHeatmapLegendBin[]
  maxCount: number
}

const HOURS_IN_DAY = 24
const HOUR_INDEXES = Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour)
const ACTIVITY_LEVELS: readonly ActivityHeatmapRangeKey[] = [1, 2, 3, 4]

function toSafeDayLabel(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : 'Day'
}

function toHourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function toIdToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function normalizeActivityPoints(data: SearchAnalytics[]): ActivityHeatmapPoint[] {
  return data.flatMap((point) => {
    const hour = Math.trunc(point.hour)
    const count = Number.isFinite(point.count) ? Math.max(0, Math.round(point.count)) : 0

    if (hour < 0 || hour > 23) {
      return []
    }

    return [
      {
        dayLabel: toSafeDayLabel(point.day),
        hour,
        count,
      },
    ]
  })
}

function bucketPointsByDay(
  points: ActivityHeatmapPoint[],
  period: ActivityHeatmapPeriod
): ActivityHeatmapPoint[][] {
  if (points.length === 0) {
    return []
  }

  if (period === '24h') {
    return [points.slice(-HOURS_IN_DAY)]
  }

  const maxRows = period === '7d' ? 7 : 30
  const buckets: ActivityHeatmapPoint[][] = []
  let currentBucket: ActivityHeatmapPoint[] = []
  let previousHour: number | null = null

  points.forEach((point) => {
    if (previousHour !== null && point.hour <= previousHour) {
      buckets.push(currentBucket)
      currentBucket = []
    }

    currentBucket.push(point)
    previousHour = point.hour
  })

  if (currentBucket.length > 0) {
    buckets.push(currentBucket)
  }

  return buckets.slice(-maxRows)
}

function createRangeFormatter() {
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

  return (min: number, max: number) => {
    const roundedMin = Math.max(0, Math.round(min))
    const roundedMax = Math.max(0, Math.round(max))

    if (roundedMin === roundedMax) {
      return formatter.format(roundedMax)
    }

    if (roundedMin > roundedMax) {
      return formatter.format(roundedMax)
    }

    return `${formatter.format(roundedMin)}-${formatter.format(roundedMax)}`
  }
}

function interpolateQuantile(sortedCounts: number[], quantile: number) {
  if (sortedCounts.length === 0) return 0
  if (sortedCounts.length === 1) return sortedCounts[0] ?? 0

  const boundedQuantile = Math.min(1, Math.max(0, quantile))
  const rawIndex = (sortedCounts.length - 1) * boundedQuantile
  const lowerIndex = Math.floor(rawIndex)
  const upperIndex = Math.ceil(rawIndex)

  const lowerValue = sortedCounts[lowerIndex] ?? 0
  const upperValue = sortedCounts[upperIndex] ?? lowerValue

  if (lowerIndex === upperIndex) {
    return lowerValue
  }

  return lowerValue + (upperValue - lowerValue) * (rawIndex - lowerIndex)
}

export function buildHeatmapScale(counts: number[]): ActivityHeatmapScale {
  const nonZeroCounts = counts
    .filter((count) => Number.isFinite(count) && count > 0)
    .map((count) => Math.max(0, count))

  if (nonZeroCounts.length === 0) {
    const emptyRanges: ActivityHeatmapScale['ranges'] = {
      1: { min: 0, max: 0 },
      2: { min: 0, max: 0 },
      3: { min: 0, max: 0 },
      4: { min: 0, max: 0 },
    }

    return {
      minNonZero: 0,
      maxNonZero: 0,
      ranges: emptyRanges,
      toLevel: () => 0,
    }
  }

  const minNonZero = Math.min(...nonZeroCounts)
  const maxNonZero = Math.max(...nonZeroCounts)

  if (maxNonZero === minNonZero) {
    const singleRanges: ActivityHeatmapScale['ranges'] = {
      1: { min: minNonZero, max: maxNonZero },
      2: { min: minNonZero, max: maxNonZero },
      3: { min: minNonZero, max: maxNonZero },
      4: { min: minNonZero, max: maxNonZero },
    }

    return {
      minNonZero,
      maxNonZero,
      ranges: singleRanges,
      toLevel: (count) => (count > 0 ? 4 : 0),
    }
  }

  const sortedCounts = [...nonZeroCounts].sort((left, right) => left - right)
  const threshold1 = interpolateQuantile(sortedCounts, 0.25)
  const threshold2 = interpolateQuantile(sortedCounts, 0.5)
  const threshold3 = interpolateQuantile(sortedCounts, 0.75)

  const ranges: ActivityHeatmapScale['ranges'] = {
    1: { min: minNonZero, max: threshold1 },
    2: { min: threshold1, max: threshold2 },
    3: { min: threshold2, max: threshold3 },
    4: { min: threshold3, max: maxNonZero },
  }

  return {
    minNonZero,
    maxNonZero,
    ranges,
    toLevel: (count) => {
      if (!Number.isFinite(count) || count <= 0) return 0
      if (count <= threshold1) return 1
      if (count <= threshold2) return 2
      if (count <= threshold3) return 3
      return 4
    },
  }
}

export function buildHeatmapLegend(scale: ActivityHeatmapScale): ActivityHeatmapLegendBin[] {
  const formatRange = createRangeFormatter()

  return [
    {
      level: 0,
      min: 0,
      max: 0,
      label: '0',
    },
    ...ACTIVITY_LEVELS.map((level) => {
      const range = scale.ranges[level]
      return {
        level,
        min: range.min,
        max: range.max,
        label: formatRange(range.min, range.max),
      } satisfies ActivityHeatmapLegendBin
    }),
  ]
}

export function buildActivityHeatmapRows(
  data: SearchAnalytics[],
  period: ActivityHeatmapPeriod,
  scaleOverride?: ActivityHeatmapScale
): ActivityHeatmapRow[] {
  const points = normalizeActivityPoints(data)
  if (points.length === 0) {
    return []
  }

  const scale = scaleOverride ?? buildHeatmapScale(points.map((point) => point.count))
  const buckets = bucketPointsByDay(points, period)

  return buckets.map((bucket, rowIndex) => {
    const pointsByHour = new Map<number, ActivityHeatmapPoint>()
    bucket.forEach((point) => {
      pointsByHour.set(point.hour, point)
    })

    const fallbackDayLabel = bucket[bucket.length - 1]?.dayLabel ?? 'Day'
    const rowLabel = period === '24h' ? '24h' : fallbackDayLabel
    const rowId = `${period}-${rowIndex}-${toIdToken(fallbackDayLabel)}`

    const cells = HOUR_INDEXES.map((hour) => {
      const point = pointsByHour.get(hour)
      const count = point?.count ?? 0
      const dayLabel = point?.dayLabel ?? fallbackDayLabel

      return {
        id: `${rowId}-${hour}`,
        dayLabel,
        hour,
        hourLabel: toHourLabel(hour),
        count,
        level: scale.toLevel(count),
      } satisfies ActivityHeatmapCell
    })

    return {
      id: rowId,
      label: rowLabel,
      cells,
    } satisfies ActivityHeatmapRow
  })
}

export function buildActivityHeatmapModel(
  data: SearchAnalytics[],
  period: ActivityHeatmapPeriod
): ActivityHeatmapModel {
  const points = normalizeActivityPoints(data)
  const counts = points.map((point) => point.count)
  const scale = buildHeatmapScale(counts)
  const rows = buildActivityHeatmapRows(data, period, scale)

  return {
    rows,
    legend: buildHeatmapLegend(scale),
    maxCount: scale.maxNonZero,
  }
}
