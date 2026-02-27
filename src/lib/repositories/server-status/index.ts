import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
  TraceSpansResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  fetchRecentTraces,
  fetchServerErrors,
  fetchServerHealth,
  fetchServerLatency,
  fetchTraceSpans,
  fetchServiceUsage,
} from '@/lib/repositories/server-status/api'
import {
  getDemoErrorLogs,
  getDemoHealthCheck,
  getDemoLatencyResponse,
  getDemoRecentTraces,
  getDemoServiceUsage,
  getDemoTraceSpans,
} from '@/mocks'

export interface TraceFilters {
  status: 'all' | 'ok' | 'error'
  service: string
  query: string
  limit: number
}

export const defaultTraceFilters: TraceFilters = {
  status: 'all',
  service: 'all',
  query: '',
  limit: 50,
}

function resolveTraceFilters(overrides: Partial<TraceFilters> = {}): TraceFilters {
  return {
    ...defaultTraceFilters,
    ...overrides,
  }
}

export interface ServerStatusRepository {
  getHealth: () => Promise<HealthCheck>
  getLatency: () => Promise<LatencyResponse>
  getServiceUsage: () => Promise<ServiceUsage[]>
  getErrorLogs: () => Promise<ErrorLog[]>
  getRecentTraces: (filters?: Partial<TraceFilters>) => Promise<TraceSummary[]>
  getTraceSpans: (traceId: string) => Promise<TraceSpansResponse>
}

const apiRepository: ServerStatusRepository = {
  getHealth: () => fetchServerHealth(),
  getLatency: () => fetchServerLatency(),
  getServiceUsage: () => fetchServiceUsage(),
  getErrorLogs: () => fetchServerErrors(),
  getRecentTraces: (filters = {}) => fetchRecentTraces(resolveTraceFilters(filters)),
  getTraceSpans: (traceId) => fetchTraceSpans(traceId),
}

const demoRepository: ServerStatusRepository = {
  getHealth: async () => getDemoHealthCheck(),
  getLatency: async () => getDemoLatencyResponse(),
  getServiceUsage: async () => getDemoServiceUsage(),
  getErrorLogs: async () => getDemoErrorLogs(),
  getRecentTraces: async (filters = {}) => getDemoRecentTraces(resolveTraceFilters(filters)),
  getTraceSpans: async (traceId) => getDemoTraceSpans(traceId),
}

export function getServerStatusRepository(
  mode: DataMode = getDataMode()
): ServerStatusRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
