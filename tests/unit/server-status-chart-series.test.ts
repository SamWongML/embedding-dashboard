import { describe, expect, it } from 'vitest'
import type { SearchAnalytics } from '@/lib/schemas/metrics'
import type {
  ErrorLog,
  LatencyResponse,
} from '@/lib/schemas/server-status'
import {
  buildLatencyDistributionSeries,
  buildThroughputErrorsSeries,
  countErrorsBetween,
  resolveReferenceDate,
  startOfUtcHour,
} from '@/components/dashboard/panels/server-status/server-status-chart-series'

function getPointByHourIsoPrefix<T extends { rawTimestamp: string }>(points: T[], isoPrefix: string) {
  const point = points.find((item) => item.rawTimestamp.startsWith(isoPrefix))
  expect(point).toBeDefined()
  return point as T
}

describe('server-status-chart-series', () => {
  it('builds a 24-point latency distribution with rolling 4h nearest-rank percentiles', () => {
    const history = [
      { timestamp: '2026-02-06T21:10:00.000Z', value: 20 },
      { timestamp: '2026-02-06T22:10:00.000Z', value: 30 },
      { timestamp: '2026-02-06T23:10:00.000Z', value: 40 },
      { timestamp: '2026-02-07T00:10:00.000Z', value: 50 },
      { timestamp: '2026-02-07T01:10:00.000Z', value: 60 },
    ]

    const series = buildLatencyDistributionSeries(history, {
      pointCount: 24,
      windowHours: 4,
    })

    expect(series).toHaveLength(24)
    expect(series[0]?.rawTimestamp).toBe('2026-02-06T02:00:00.000Z')
    expect(series[23]?.rawTimestamp).toBe('2026-02-07T01:00:00.000Z')
    expect(series.every((point, index, items) => index === 0 || point.timestamp > (items[index - 1]?.timestamp ?? 0))).toBe(true)

    const hour00 = getPointByHourIsoPrefix(series, '2026-02-07T00:00:00.000Z')
    expect(hour00.p50).toBe(30)
    expect(hour00.p95).toBe(50)
    expect(hour00.p99).toBe(50)

    const hour01 = getPointByHourIsoPrefix(series, '2026-02-07T01:00:00.000Z')
    expect(hour01.p50).toBe(40)
    expect(hour01.p95).toBe(60)
    expect(hour01.p99).toBe(60)
  })

  it('carries forward prior percentile values when a rolling window is empty', () => {
    const history = [
      { timestamp: '2026-02-07T06:10:00.000Z', value: 20 },
      { timestamp: '2026-02-07T12:10:00.000Z', value: 40 },
      { timestamp: 'not-a-date', value: 99 },
    ]

    const series = buildLatencyDistributionSeries(history, {
      pointCount: 24,
      windowHours: 4,
    })

    expect(series).toHaveLength(24)

    const beforeAnyData = getPointByHourIsoPrefix(series, '2026-02-07T04:00:00.000Z')
    expect(beforeAnyData.p50).toBeNull()
    expect(beforeAnyData.p95).toBeNull()
    expect(beforeAnyData.p99).toBeNull()

    const hour10 = getPointByHourIsoPrefix(series, '2026-02-07T10:00:00.000Z')
    expect(hour10.p50).toBe(20)
    expect(hour10.p95).toBe(20)
    expect(hour10.p99).toBe(20)

    const hour11 = getPointByHourIsoPrefix(series, '2026-02-07T11:00:00.000Z')
    expect(hour11.p50).toBe(20)
    expect(hour11.p95).toBe(20)
    expect(hour11.p99).toBe(20)

    const hour12 = getPointByHourIsoPrefix(series, '2026-02-07T12:00:00.000Z')
    expect(hour12.p50).toBe(40)
    expect(hour12.p95).toBe(40)
    expect(hour12.p99).toBe(40)
  })

  it('builds throughput and error counts aligned to the last 24 UTC hours', () => {
    const analytics: SearchAnalytics[] = [
      { hour: 10, day: 'Sat', count: 100 },
      { hour: 11, day: 'Sat', count: 200 },
      { hour: 12, day: 'Sat', count: 300 },
    ]
    const errors: ErrorLog[] = [
      {
        id: 'e1',
        timestamp: '2026-02-07T10:05:00.000Z',
        level: 'error',
        message: 'error 1',
        source: 'api',
      },
      {
        id: 'e2',
        timestamp: '2026-02-07T11:00:00.000Z',
        level: 'warning',
        message: 'error 2',
        source: 'api',
      },
      {
        id: 'e3',
        timestamp: '2026-02-07T11:59:59.000Z',
        level: 'info',
        message: 'error 3',
        source: 'api',
      },
      {
        id: 'e4',
        timestamp: '2026-02-07T12:15:00.000Z',
        level: 'error',
        message: 'error 4',
        source: 'api',
      },
      {
        id: 'e5',
        timestamp: '2026-02-07T12:55:00.000Z',
        level: 'error',
        message: 'error 5',
        source: 'api',
      },
      {
        id: 'e6',
        timestamp: 'invalid-date',
        level: 'error',
        message: 'ignored error',
        source: 'api',
      },
    ]
    const latency: Pick<LatencyResponse, 'history'> = {
      history: [{ timestamp: '2026-02-07T12:30:00.000Z', value: 44 }],
    }

    const series = buildThroughputErrorsSeries(analytics, errors, latency, {
      pointCount: 24,
    })

    expect(series).toHaveLength(24)
    expect(series.slice(0, 21).every((point) => point.requests === 0)).toBe(true)

    const hour10 = getPointByHourIsoPrefix(series, '2026-02-07T10:00:00.000Z')
    const hour11 = getPointByHourIsoPrefix(series, '2026-02-07T11:00:00.000Z')
    const hour12 = getPointByHourIsoPrefix(series, '2026-02-07T12:00:00.000Z')

    expect(hour10.requests).toBe(100)
    expect(hour11.requests).toBe(200)
    expect(hour12.requests).toBe(300)

    expect(hour10.errors).toBe(1)
    expect(hour11.errors).toBe(2)
    expect(hour12.errors).toBe(2)
  })

  it('shares UTC helpers used by KPI and chart derivations', () => {
    const rounded = startOfUtcHour(new Date('2026-02-07T12:47:59.999Z'))
    expect(rounded.toISOString()).toBe('2026-02-07T12:00:00.000Z')

    const errors: ErrorLog[] = [
      {
        id: 'a',
        timestamp: '2026-02-07T08:00:00.000Z',
        level: 'error',
        message: 'a',
        source: 'worker',
      },
      {
        id: 'b',
        timestamp: '2026-02-07T08:59:59.000Z',
        level: 'warning',
        message: 'b',
        source: 'worker',
      },
      {
        id: 'c',
        timestamp: '2026-02-07T09:00:00.000Z',
        level: 'info',
        message: 'c',
        source: 'worker',
      },
      {
        id: 'invalid',
        timestamp: '',
        level: 'error',
        message: 'ignored',
        source: 'worker',
      },
    ]

    expect(
      countErrorsBetween(
        errors,
        new Date('2026-02-07T08:00:00.000Z'),
        new Date('2026-02-07T09:00:00.000Z')
      )
    ).toBe(2)

    const fromErrorsOnly = resolveReferenceDate(undefined, errors)
    expect(fromErrorsOnly.toISOString()).toBe('2026-02-07T09:00:00.000Z')
  })
})
