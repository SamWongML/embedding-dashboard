import type { SearchAnalytics } from '@/lib/schemas/metrics'

export type ActivityHeatmapPeriod = '24h' | '7d' | '30d'
export type ActivityHeatmapLevel = 0 | 1 | 2 | 3 | 4

type ActivityHeatmapRangeKey = 1 | 2 | 3 | 4
<<<<<<< ours
=======
const DAY_MS = 24 * 60 * 60 * 1000
>>>>>>> theirs

interface ActivityHeatmapPoint {
  dayLabel: string
  hour: number
  count: number
<<<<<<< ours
=======
  timestamp: number | null
}

interface ActivityHeatmapBucket {
  idToken: string
  rowLabel: string
  dateLabel: string
  dayStart: number
  isToday: boolean
  points: ActivityHeatmapPoint[]
>>>>>>> theirs
}

export interface ActivityHeatmapCell {
  id: string
  dayLabel: string
<<<<<<< ours
=======
  dateLabel: string
  isToday: boolean
>>>>>>> theirs
  hour: number
  hourLabel: string
  count: number
  level: ActivityHeatmapLevel
}

export interface ActivityHeatmapRow {
  id: string
  label: string
<<<<<<< ours
=======
  dateLabel: string
  isToday: boolean
>>>>>>> theirs
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

<<<<<<< ours
const HOURS_IN_DAY = 24
const HOUR_INDEXES = Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour)
const ACTIVITY_LEVELS: readonly ActivityHeatmapRangeKey[] = [1, 2, 3, 4]
=======
export interface ActivityHeatmapRowRange {
  start: number
  end: number
}

const HOURS_IN_DAY = 24
const HOUR_INDEXES = Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour)
const ACTIVITY_LEVELS: readonly ActivityHeatmapRangeKey[] = [1, 2, 3, 4]
const UTC_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const UTC_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})

function toUtcDayStart(timestamp: number) {
  const date = new Date(timestamp)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function toUtcDayKey(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatUtcDateLabel(timestamp: number) {
  return UTC_DATE_LABEL_FORMATTER.format(new Date(timestamp))
}

function formatUtcWeekdayLabel(timestamp: number) {
  return UTC_WEEKDAY_FORMATTER.format(new Date(timestamp))
}

function normalizeUtcDayStart(timestamp: number | null, fallbackDayStart: number) {
  return timestamp === null ? fallbackDayStart : toUtcDayStart(timestamp)
}
>>>>>>> theirs

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

<<<<<<< ours
=======
function parseSearchAnalyticsTimestamp(point: SearchAnalytics) {
  const raw = point.timestamp ?? point.date

  if (!raw) {
    return null
  }

  const timestamp = Date.parse(raw)
  return Number.isFinite(timestamp) ? timestamp : null
}

>>>>>>> theirs
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
<<<<<<< ours
=======
        timestamp: parseSearchAnalyticsTimestamp(point),
>>>>>>> theirs
      },
    ]
  })
}

<<<<<<< ours
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
=======
function inferBucketsByHourSequence(points: ActivityHeatmapPoint[], maxRows: number): ActivityHeatmapBucket[] {
>>>>>>> theirs
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

<<<<<<< ours
  return buckets.slice(-maxRows)
=======
  const boundedBuckets = buckets.slice(-maxRows)
  const inferredTodayStart = toUtcDayStart(Date.now())

  return boundedBuckets.map((bucket, index) => {
    const fallbackDayLabel = bucket[bucket.length - 1]?.dayLabel ?? 'Day'
    const dayOffset = boundedBuckets.length - 1 - index
    const inferredDayStart = inferredTodayStart - dayOffset * DAY_MS

    return {
      idToken: toIdToken(`${toUtcDayKey(inferredDayStart)}-${fallbackDayLabel}`),
      rowLabel: fallbackDayLabel,
      dateLabel: formatUtcDateLabel(inferredDayStart),
      dayStart: inferredDayStart,
      isToday: dayOffset === 0,
      points: bucket,
    }
  })
}

function bucketPointsByDay(points: ActivityHeatmapPoint[], period: ActivityHeatmapPeriod): ActivityHeatmapBucket[] {
  if (points.length === 0) {
    return []
  }

  if (period === '24h') {
    return [
      {
        idToken: '24h',
        rowLabel: '24h',
        dateLabel: formatUtcDateLabel(Date.now()),
        dayStart: toUtcDayStart(Date.now()),
        isToday: true,
        points: points.slice(-HOURS_IN_DAY),
      },
    ]
  }

  const maxRows = period === '7d' ? 7 : 30
  const hasCompleteTimestamps = points.every((point) => point.timestamp !== null)
  if (!hasCompleteTimestamps) {
    return inferBucketsByHourSequence(points, maxRows)
  }

  const groups: Array<{ dayStart: number; points: ActivityHeatmapPoint[] }> = []
  const withOrder = points
    .map((point, index) => ({ point, index }))
    .sort((left, right) => {
      const leftTimestamp = left.point.timestamp ?? Number.NEGATIVE_INFINITY
      const rightTimestamp = right.point.timestamp ?? Number.NEGATIVE_INFINITY
      return leftTimestamp - rightTimestamp || left.index - right.index
    })
  let lastDayStart: number | null = null

  withOrder.forEach(({ point }) => {
    const dayStart = toUtcDayStart(point.timestamp ?? Date.now())

    if (lastDayStart !== dayStart) {
      groups.push({ dayStart, points: [] })
      lastDayStart = dayStart
    }

    groups[groups.length - 1]?.points.push(point)
  })

  const boundedGroups = groups.slice(-maxRows)
  const currentTodayKey = toUtcDayKey(Date.now())
  const hasCurrentDay = boundedGroups.some(
    (group) => toUtcDayKey(group.dayStart) === currentTodayKey
  )
  const effectiveTodayKey = hasCurrentDay
    ? currentTodayKey
    : toUtcDayKey(boundedGroups[boundedGroups.length - 1]?.dayStart ?? Date.now())

  return boundedGroups.map((group) => ({
    idToken: toIdToken(toUtcDayKey(group.dayStart)),
    rowLabel: formatUtcWeekdayLabel(group.dayStart),
    dateLabel: formatUtcDateLabel(group.dayStart),
    dayStart: group.dayStart,
    isToday: toUtcDayKey(group.dayStart) === effectiveTodayKey,
    points: group.points,
  }))
>>>>>>> theirs
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
<<<<<<< ours

  return buckets.map((bucket, rowIndex) => {
    const pointsByHour = new Map<number, ActivityHeatmapPoint>()
    bucket.forEach((point) => {
      pointsByHour.set(point.hour, point)
    })

    const fallbackDayLabel = bucket[bucket.length - 1]?.dayLabel ?? 'Day'
    const rowLabel = period === '24h' ? '24h' : fallbackDayLabel
    const rowId = `${period}-${rowIndex}-${toIdToken(fallbackDayLabel)}`
=======
  const todayDayKey = toUtcDayKey(
    buckets.find((bucket) => bucket.isToday)?.dayStart ?? Date.now()
  )

  return buckets.map((bucket, rowIndex) => {
    const pointsByHour = new Map<number, ActivityHeatmapPoint>()
    bucket.points.forEach((point) => {
      pointsByHour.set(point.hour, point)
    })

    const fallbackDayLabel = bucket.points[bucket.points.length - 1]?.dayLabel ?? bucket.rowLabel
    const rowId = `${period}-${rowIndex}-${bucket.idToken}`
>>>>>>> theirs

    const cells = HOUR_INDEXES.map((hour) => {
      const point = pointsByHour.get(hour)
      const count = point?.count ?? 0
      const dayLabel = point?.dayLabel ?? fallbackDayLabel
<<<<<<< ours

      return {
        id: `${rowId}-${hour}`,
        dayLabel,
=======
      const dayStart = normalizeUtcDayStart(point?.timestamp ?? null, bucket.dayStart)
      const dateLabel = point?.timestamp == null ? bucket.dateLabel : formatUtcDateLabel(dayStart)
      const resolvedDayLabel = point?.timestamp == null ? dayLabel : formatUtcWeekdayLabel(dayStart)
      const isToday = point?.timestamp == null ? bucket.isToday : toUtcDayKey(dayStart) === todayDayKey

      return {
        id: `${rowId}-${hour}`,
        dayLabel: resolvedDayLabel,
        dateLabel,
        isToday,
>>>>>>> theirs
        hour,
        hourLabel: toHourLabel(hour),
        count,
        level: scale.toLevel(count),
      } satisfies ActivityHeatmapCell
    })

    return {
      id: rowId,
<<<<<<< ours
      label: rowLabel,
=======
      label: bucket.rowLabel,
      dateLabel: bucket.dateLabel,
      isToday: bucket.isToday,
>>>>>>> theirs
      cells,
    } satisfies ActivityHeatmapRow
  })
}

<<<<<<< ours
=======
export function buildActivityHeatmapRowRanges(totalRows: number, windowSize = 7): ActivityHeatmapRowRange[] {
  const safeTotalRows = Math.max(0, Math.trunc(totalRows))
  const safeWindowSize = Math.max(1, Math.trunc(windowSize))
  const ranges: ActivityHeatmapRowRange[] = []
  let end = safeTotalRows

  while (end > 0) {
    const start = Math.max(0, end - safeWindowSize)
    ranges.push({ start, end })
    end = start
  }

  return ranges
}

>>>>>>> theirs
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
