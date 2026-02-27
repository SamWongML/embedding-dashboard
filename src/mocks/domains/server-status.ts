import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
  TraceSpansResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'
import type { TraceFilters } from '@/lib/repositories/server-status'
import {
  cloneDemoValue,
  getDemoScenarioState,
} from '@/mocks/scenario'

export function getDemoHealthCheck(): HealthCheck {
  return cloneDemoValue(getDemoScenarioState().healthCheck)
}

export function getDemoLatencyResponse(): LatencyResponse {
  return cloneDemoValue(getDemoScenarioState().latencyResponse)
}

export function getDemoServiceUsage(): ServiceUsage[] {
  return cloneDemoValue(getDemoScenarioState().serviceUsage)
}

export function getDemoErrorLogs(): ErrorLog[] {
  return cloneDemoValue(getDemoScenarioState().errorLogs)
}

export function getDemoRecentTraces(filters: TraceFilters): TraceSummary[] {
  const normalizedQuery = filters.query.trim().toLowerCase()
  const normalizedService = filters.service.trim().toLowerCase()

  const matches = getDemoScenarioState().recentTraces.filter((trace) => {
    if (filters.status !== 'all' && trace.status !== filters.status) {
      return false
    }

    if (normalizedService && normalizedService !== 'all') {
      if (trace.service.toLowerCase() !== normalizedService) {
        return false
      }
    }

    if (!normalizedQuery) {
      return true
    }

    return [
      trace.traceId,
      trace.method,
      trace.route,
      trace.service,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })

  return cloneDemoValue(matches.slice(0, Math.max(1, filters.limit)))
}

export function getDemoTraceSpans(traceId: string): TraceSpansResponse {
  const detail = getDemoScenarioState().traceSpansByTraceId[traceId]

  if (!detail) {
    throw new Error(`Trace not found: ${traceId}`)
  }

  return cloneDemoValue(detail)
}
