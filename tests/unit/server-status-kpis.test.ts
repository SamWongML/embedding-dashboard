import { describe, expect, it } from 'vitest'
import { deriveServerStatusKpis } from '@/components/dashboard/panels/server-status/server-status-kpis'
import type { SearchAnalytics } from '@/lib/schemas/metrics'
import type {
  ErrorLog,
  LatencyResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function toDayLabel(date: Date) {
  return DAY_LABELS[date.getUTCDay()] ?? 'Sun'
}

function buildHourlyAnalytics(startIso: string, counts: number[]): SearchAnalytics[] {
  const start = new Date(startIso)

  return counts.map((count, index) => {
    const current = new Date(start.getTime() + index * 60 * 60 * 1000)
    return {
      count,
      day: toDayLabel(current),
      hour: current.getUTCHours(),
    }
  })
}

function buildLatencyResponse(historyValues: number[], endIso: string, average: number): LatencyResponse {
  const end = new Date(endIso)
  const history = historyValues.map((value, index) => {
    const timestamp = new Date(
      end.getTime() - (historyValues.length - 1 - index) * 60 * 1000
    ).toISOString()
    return { timestamp, value }
  })

  return {
    current: historyValues.at(-1) ?? 0,
    average,
    p95: 0,
    p99: 0,
    history,
  }
}

function buildRecentTraces(count: number, startIso = '2026-02-07T12:00:00.000Z'): TraceSummary[] {
  const start = new Date(startIso)

  return Array.from({ length: count }, (_, index) => ({
    id: `trace-${index + 1}`,
    traceId: `trace-id-${index + 1}`,
    timestamp: new Date(start.getTime() + index * 1000).toISOString(),
    status: index % 5 === 0 ? 'error' : 'ok',
    method: 'POST',
    route: '/api/embed/text',
    service: index % 2 === 0 ? 'api' : 'graph',
    durationMs: 120 + index,
    spanCount: 8 + (index % 4),
  }))
}

describe('deriveServerStatusKpis', () => {
  it('returns cards in the expected order and computes throughput from analytics', () => {
    const counts = [
      ...Array.from({ length: 24 }, () => 100),
      ...Array.from({ length: 22 }, () => 200),
      150,
      300,
    ]
    const analytics = buildHourlyAnalytics('2026-02-05T13:00:00.000Z', counts)
    const traces = buildRecentTraces(37)

    const cards = deriveServerStatusKpis({ searchAnalytics: analytics, traces })
    const throughput = cards.find((card) => card.title === 'Throughput')
    const activeTraces = cards.find((card) => card.title === 'Active Traces')

    expect(cards.map((card) => card.title)).toEqual([
      'Avg Latency',
      'Throughput',
      'Error Rate',
      'Active Traces',
    ])

    expect(throughput).toBeDefined()
    expect(throughput?.value).toBeCloseTo(300 / 3600, 6)
    expect(throughput?.change).toBeCloseTo(100, 6)
    expect(throughput?.changeType).toBe('increase')
    expect(throughput?.sparkline).toHaveLength(24)
    expect(throughput?.sparkline?.[0]).toBeCloseTo(200 / 3600, 8)
    expect(throughput?.sparkline?.[23]).toBeCloseTo(300 / 3600, 8)

    expect(activeTraces).toBeDefined()
    expect(activeTraces?.value).toBe(350)
    expect(activeTraces?.change).toBeCloseTo(((228 - 122) / 122) * 100, 6)
    expect(activeTraces?.changeType).toBe('increase')
    expect(activeTraces?.sparkline).toHaveLength(24)
    expect(activeTraces?.sparkline?.[0]).toBe(9)
    expect(activeTraces?.sparkline?.[23]).toBe(8)
  })

  it('computes avg latency delta from 24-point windows and treats lower as better', () => {
    const latency = buildLatencyResponse(
      [
        ...Array.from({ length: 24 }, () => 100),
        ...Array.from({ length: 24 }, () => 80),
      ],
      '2026-02-07T12:30:00.000Z',
      142
    )

    const cards = deriveServerStatusKpis({
      latency,
      searchAnalytics: buildHourlyAnalytics('2026-02-07T11:00:00.000Z', [100, 100]),
    })

    const avgLatency = cards.find((card) => card.title === 'Avg Latency')

    expect(avgLatency).toBeDefined()
    expect(avgLatency?.value).toBe(142)
    expect(avgLatency?.change).toBeCloseTo(-20, 6)
    expect(avgLatency?.changeType).toBe('increase')
    expect(avgLatency?.sparkline).toHaveLength(24)
    expect(avgLatency?.sparkline?.every((value) => value === -80)).toBe(true)
  })

  it('computes 24-point error-rate sparkline and inverse-good changeType', () => {
    const analytics = buildHourlyAnalytics(
      '2026-02-06T13:00:00.000Z',
      Array.from({ length: 24 }, () => 100)
    )

    const errors: ErrorLog[] = [
      {
        id: 'e1',
        timestamp: '2026-02-07T12:05:00.000Z',
        level: 'error',
        message: 'Current hour error 1',
        source: 'api',
      },
      {
        id: 'e2',
        timestamp: '2026-02-07T12:40:00.000Z',
        level: 'error',
        message: 'Current hour error 2',
        source: 'api',
      },
      {
        id: 'e3',
        timestamp: '2026-02-07T11:15:00.000Z',
        level: 'error',
        message: 'Previous hour error',
        source: 'api',
      },
      {
        id: 'e4',
        timestamp: '2026-02-07T10:59:59.000Z',
        level: 'error',
        message: 'Ignored older error',
        source: 'api',
      },
    ]

    const cards = deriveServerStatusKpis({
      latency: buildLatencyResponse([40], '2026-02-07T12:30:00.000Z', 40),
      errors,
      searchAnalytics: analytics,
    })

    const errorRate = cards.find((card) => card.title === 'Error Rate')

    expect(errorRate).toBeDefined()
    expect(errorRate?.value).toBeCloseTo(2, 6)
    expect(errorRate?.change).toBeCloseTo(100, 6)
    expect(errorRate?.changeType).toBe('decrease')
    expect(errorRate?.sparkline).toHaveLength(24)
    expect(errorRate?.sparkline?.[22]).toBeCloseTo(-1, 8)
    expect(errorRate?.sparkline?.[23]).toBeCloseTo(-2, 8)
  })

  it('falls back when analytics, traces, or prior windows are missing', () => {
    const latency = buildLatencyResponse(
      Array.from({ length: 10 }, () => 50),
      '2026-02-07T12:30:00.000Z',
      50
    )

    const cards = deriveServerStatusKpis({
      latency,
      errors: [],
      searchAnalytics: undefined,
      traces: undefined,
    })

    const activeTraces = cards.find((card) => card.title === 'Active Traces')
    const throughput = cards.find((card) => card.title === 'Throughput')
    const avgLatency = cards.find((card) => card.title === 'Avg Latency')
    const errorRate = cards.find((card) => card.title === 'Error Rate')

    expect(activeTraces?.value).toBe(0)
    expect(activeTraces?.change).toBe(0)
    expect(activeTraces?.changeType).toBe('neutral')
    expect(activeTraces?.sparkline).toBeUndefined()
    expect(throughput?.value).toBe(0)
    expect(throughput?.change).toBe(0)
    expect(throughput?.changeType).toBe('neutral')
    expect(throughput?.sparkline).toBeUndefined()
    expect(avgLatency?.change).toBe(0)
    expect(avgLatency?.changeType).toBe('neutral')
    expect(avgLatency?.sparkline).toBeUndefined()
    expect(errorRate?.value).toBe(0)
    expect(errorRate?.change).toBe(0)
    expect(errorRate?.changeType).toBe('neutral')
    expect(errorRate?.sparkline).toBeUndefined()
  })
})
