import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SearchAnalytics } from '@/lib/schemas/metrics'
import {
  buildActivityHeatmapModel,
  buildActivityHeatmapRowRanges,
  buildActivityHeatmapRows,
  buildHeatmapLegend,
  buildHeatmapScale,
} from '@/components/charts/activity-heatmap-utils'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function point(day: string, hour: number, count: number, timestamp?: string): SearchAnalytics {
  return { day, hour, count, timestamp }
}

function buildDay(day: string, baseCount: number): SearchAnalytics[] {
  return Array.from({ length: 24 }, (_, hour) => point(day, hour, baseCount + hour))
}

function buildUtcDay(date: string, baseCount: number): SearchAnalytics[] {
  const dayStart = Date.parse(`${date}T00:00:00.000Z`)

  return Array.from({ length: 24 }, (_, hour) => {
    const timestamp = new Date(dayStart + hour * 60 * 60 * 1000)
    return point(
      DAY_LABELS[timestamp.getUTCDay()] ?? 'Sun',
      timestamp.getUTCHours(),
      baseCount + hour,
      timestamp.toISOString()
    )
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('activity-heatmap-utils', () => {
  it('builds a single 24-hour row for the 24h period', () => {
    const analytics = buildDay('Fri', 100)
    const rows = buildActivityHeatmapRows(analytics, '24h')

    expect(rows).toHaveLength(1)
    expect(rows[0]?.cells).toHaveLength(24)
    expect(rows[0]?.label).toBe('24h')
  })

  it('keeps chronological order across daily rows', () => {
    const analytics = [...buildDay('Mon', 10), ...buildDay('Tue', 20)]
    const rows = buildActivityHeatmapRows(analytics, '7d')

    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.label)).toEqual(['Mon', 'Tue'])
    expect(rows[0]?.cells[0]?.count).toBe(10)
    expect(rows[1]?.cells[0]?.count).toBe(20)
  })

  it('fills missing hours with zero values', () => {
    const analytics: SearchAnalytics[] = [
      point('Thu', 0, 12),
      point('Thu', 2, 24),
      point('Thu', 3, 36),
    ]

    const rows = buildActivityHeatmapRows(analytics, '7d')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.cells[1]?.count).toBe(0)
    expect(rows[0]?.cells[2]?.count).toBe(24)
  })

  it('assigns deterministic quantile levels for skewed distributions', () => {
    const scale = buildHeatmapScale([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89])

    expect(scale.toLevel(0)).toBe(0)
    expect(scale.toLevel(1)).toBe(1)
    expect(scale.toLevel(5)).toBe(2)
    expect(scale.toLevel(13)).toBe(3)
    expect(scale.toLevel(89)).toBe(4)
    expect(scale.ranges[1].max).toBeGreaterThanOrEqual(scale.ranges[1].min)
    expect(scale.ranges[4].max).toBe(scale.maxNonZero)

    const legend = buildHeatmapLegend(scale)
    expect(legend).toHaveLength(5)
    expect(legend[0]?.level).toBe(0)
    expect(legend[4]?.level).toBe(4)
  })

  it('maps uniform non-zero values to level 4 and zero to level 0', () => {
    const scale = buildHeatmapScale([0, 12, 12, 12, 12])

    expect(scale.toLevel(0)).toBe(0)
    expect(scale.toLevel(12)).toBe(4)
  })

  it('handles partial 30d data without crashing', () => {
    const analytics = [...buildDay('Wed', 50), ...buildDay('Thu', 80), ...buildDay('Fri', 110)]

    const rows = buildActivityHeatmapRows(analytics, '30d')
    expect(rows).toHaveLength(3)
    expect(rows.every((row) => row.cells.length === 24)).toBe(true)

    const model = buildActivityHeatmapModel(analytics, '30d')
    expect(model.rows).toHaveLength(3)
    expect(model.legend).toHaveLength(5)
    expect(model.maxCount).toBeGreaterThan(0)
  })

  it('builds latest-first 7-day row windows for 30-day navigation', () => {
    expect(buildActivityHeatmapRowRanges(30, 7)).toEqual([
      { start: 23, end: 30 },
      { start: 16, end: 23 },
      { start: 9, end: 16 },
      { start: 2, end: 9 },
      { start: 0, end: 2 },
    ])
  })

  it('marks only the UTC current-day cells as today when timestamps are present', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-27T12:00:00.000Z'))

    const analytics = [...buildUtcDay('2026-02-26', 100), ...buildUtcDay('2026-02-27', 200)]
    const rows = buildActivityHeatmapRows(analytics, '30d')

    expect(rows).toHaveLength(2)
    expect(rows[0]?.cells.some((cell) => cell.isToday)).toBe(false)
    expect(rows[1]?.cells.every((cell) => cell.isToday)).toBe(true)
    expect(rows[0]?.cells[0]?.dateLabel).toBe('Thu, Feb 26')
    expect(rows[1]?.cells[0]?.dateLabel).toBe('Fri, Feb 27')
  })

  it('uses deterministic fallback date labels and today detection without timestamps', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-27T12:00:00.000Z'))

    const analytics = [...buildDay('Thu', 100), ...buildDay('Fri', 200)]
    const rows = buildActivityHeatmapRows(analytics, '30d')

    expect(rows).toHaveLength(2)
    expect(rows[0]?.cells[0]?.dateLabel).toBe('Thu, Feb 26')
    expect(rows[1]?.cells[0]?.dateLabel).toBe('Fri, Feb 27')
    expect(rows[0]?.cells.some((cell) => cell.isToday)).toBe(false)
    expect(rows[1]?.cells.every((cell) => cell.isToday)).toBe(true)
  })
})
