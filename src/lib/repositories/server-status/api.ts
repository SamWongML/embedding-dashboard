import { api } from "@/lib/api"
import {
  type ErrorLog,
  type HealthCheck,
  type LatencyResponse,
  type ServiceUsage,
  type TraceSpansResponse,
  type TraceSummary,
  errorLogSchema,
  healthCheckSchema,
  latencyResponseSchema,
  serviceUsageSchema,
  traceSpansResponseSchema,
  traceSummarySchema,
} from "@/lib/schemas/server-status"
import type { TraceFilters } from "@/lib/repositories/server-status"

export async function fetchServerHealth(): Promise<HealthCheck> {
  return api.get("/health", healthCheckSchema)
}

export async function fetchServerLatency(): Promise<LatencyResponse> {
  return api.get("/metrics/latency", latencyResponseSchema)
}

export async function fetchServiceUsage(): Promise<ServiceUsage[]> {
  return api.get<ServiceUsage[]>("/metrics/services", serviceUsageSchema.array())
}

export async function fetchServerErrors(): Promise<ErrorLog[]> {
  return api.get<ErrorLog[]>("/logs/errors", errorLogSchema.array())
}

function toTraceQueryString(filters: TraceFilters) {
  const params = new URLSearchParams()
  params.set("limit", String(filters.limit))
  params.set("status", filters.status)
  params.set("service", filters.service)
  params.set("q", filters.query)
  return params.toString()
}

export async function fetchRecentTraces(filters: TraceFilters): Promise<TraceSummary[]> {
  return api.get<TraceSummary[]>(
    `/traces/recent?${toTraceQueryString(filters)}`,
    traceSummarySchema.array()
  )
}

export async function fetchTraceSpans(traceId: string): Promise<TraceSpansResponse> {
  return api.get<TraceSpansResponse>(`/traces/${traceId}/spans`, traceSpansResponseSchema)
}
