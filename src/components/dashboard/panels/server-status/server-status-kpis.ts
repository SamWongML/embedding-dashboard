import type { Format } from '@number-flow/react'
import type { SearchAnalytics } from '@/lib/schemas/metrics'
import type {
  ErrorLog,
  LatencyResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'
import {
  countErrorsBetween,
  HOUR_MS,
  resolveReferenceDate,
  startOfUtcHour,
} from './server-status-chart-series'

type ChangeType = 'increase' | 'decrease' | 'neutral'

export interface ServerStatusKpiCard {
  title: 'Avg Latency' | 'Throughput' | 'Error Rate' | 'Active Traces'
  value: number
  valueSuffix?: string
  valueFormat?: Format
  change: number
  changeType: ChangeType
  sparkline?: number[]
}

interface DeriveServerStatusKpisInput {
  latency?: LatencyResponse
  errors?: ErrorLog[]
  searchAnalytics?: SearchAnalytics[]
  traces?: TraceSummary[]
}

function clampNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((total, value) => total + value, 0) / values.length
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function percentChange(current: number, previous: number) {
  if (previous === 0 || !Number.isFinite(previous)) {
    return 0
  }
  return ((current - previous) / previous) * 100
}

function resolveForwardChangeType(changePercent: number): ChangeType {
  if (changePercent > 0) return 'increase'
  if (changePercent < 0) return 'decrease'
  return 'neutral'
}

function resolveInverseChangeType(changePercent: number): ChangeType {
  if (changePercent < 0) return 'increase'
  if (changePercent > 0) return 'decrease'
  return 'neutral'
}

function toInverseSemanticSeries(values: number[]) {
  return values.map((value) => -value)
}

function resolveHourlyErrorRates(
  errors: ErrorLog[],
  analytics: SearchAnalytics[],
  referenceDate: Date
) {
  const anchorHourStart = startOfUtcHour(referenceDate)

  return analytics.map((analyticsPoint, index) => {
    const hourOffset = analytics.length - 1 - index
    const hourStart = new Date(anchorHourStart.getTime() - hourOffset * HOUR_MS)
    const hourEnd = new Date(hourStart.getTime() + HOUR_MS)
    const hourlyErrorCount = countErrorsBetween(errors, hourStart, hourEnd)

    return analyticsPoint.count > 0
      ? (hourlyErrorCount / analyticsPoint.count) * 100
      : 0
  })
}

export function deriveServerStatusKpis({
  latency,
  errors,
  searchAnalytics,
  traces,
}: DeriveServerStatusKpisInput): ServerStatusKpiCard[] {
  const analytics = searchAnalytics ?? []
  const logs = errors ?? []
  const recentTraces = traces ?? []

  const recent24 = analytics.slice(-24)
  const analyticsAvailable = analytics.length > 0
  const hasCompleteRecent24 = recent24.length === 24

  const currentHourRequests = analytics.at(-1)?.count ?? 0
  const previousHourRequests = analytics.at(-2)?.count ?? 0
  const throughput = currentHourRequests / 3600
  const throughputDelta = previousHourRequests > 0
    ? percentChange(currentHourRequests, previousHourRequests)
    : 0

  const latencyValue = latency?.average ?? latency?.current ?? 0
  const latencyHistoryValues = (latency?.history ?? [])
    .map((item) => item.value)
    .filter((value) => Number.isFinite(value))
  const latencyCurrentWindow = latencyHistoryValues.slice(-24)
  const latencyPreviousWindow = latencyHistoryValues.slice(-48, -24)
  const latencyCurrentAvg = latencyCurrentWindow.length > 0
    ? average(latencyCurrentWindow)
    : latencyValue
  const latencyPreviousAvg = latencyPreviousWindow.length === 24
    ? average(latencyPreviousWindow)
    : 0
  const latencyDelta = latencyPreviousAvg > 0
    ? percentChange(latencyCurrentAvg, latencyPreviousAvg)
    : 0
  const latencySparkline = latencyHistoryValues.length >= 24
    ? toInverseSemanticSeries(latencyHistoryValues.slice(-24))
    : undefined

  const referenceDate = resolveReferenceDate(latency, logs)
  const hourlyErrorRates = analyticsAvailable
    ? resolveHourlyErrorRates(logs, analytics, referenceDate)
    : []
  const currentErrorRate = hourlyErrorRates.at(-1) ?? 0
  const previousErrorRate = hourlyErrorRates.at(-2) ?? 0
  const errorRateDelta = previousErrorRate > 0
    ? percentChange(currentErrorRate, previousErrorRate)
    : 0
  const traceSpanSeries = recentTraces
    .map((trace) => trace.spanCount)
    .filter((value) => Number.isFinite(value))
  const recentTraceSpanWindow = traceSpanSeries.slice(-24)
  const previousTraceSpanWindow = traceSpanSeries.slice(-48, -24)
  const activeTracesValue = sum(traceSpanSeries)
  const recentTraceTotal = sum(recentTraceSpanWindow)
  const previousTraceTotal = sum(previousTraceSpanWindow)
  const activeTracesDelta = previousTraceTotal > 0
    ? percentChange(recentTraceTotal, previousTraceTotal)
    : 0

  return [
    {
      title: 'Avg Latency',
      value: clampNumber(latencyValue),
      valueSuffix: 'ms',
      valueFormat: { maximumFractionDigits: 0 },
      change: latencyDelta,
      changeType: resolveInverseChangeType(latencyDelta),
      sparkline: latencySparkline,
    },
    {
      title: 'Throughput',
      value: clampNumber(throughput),
      valueSuffix: '/s',
      valueFormat: throughput >= 100
        ? { maximumFractionDigits: 0 }
        : { maximumFractionDigits: 1 },
      change: throughputDelta,
      changeType: resolveForwardChangeType(throughputDelta),
      sparkline: hasCompleteRecent24
        ? recent24.map((item) => item.count / 3600)
        : undefined,
    },
    {
      title: 'Error Rate',
      value: clampNumber(currentErrorRate),
      valueSuffix: '%',
      valueFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      change: errorRateDelta,
      changeType: resolveInverseChangeType(errorRateDelta),
      sparkline: hasCompleteRecent24
        ? toInverseSemanticSeries(hourlyErrorRates.slice(-24))
        : undefined,
    },
    {
      title: 'Active Traces',
      value: activeTracesValue,
      valueFormat: { maximumFractionDigits: 0 },
      change: activeTracesDelta,
      changeType: resolveForwardChangeType(activeTracesDelta),
      sparkline: recentTraceSpanWindow.length >= 2 ? recentTraceSpanWindow : undefined,
    },
  ]
}
