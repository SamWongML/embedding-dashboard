import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
} from '@/lib/schemas/server-status'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  fetchServerErrors,
  fetchServerHealth,
  fetchServerLatency,
  fetchServiceUsage,
} from '@/lib/repositories/server-status/api'
import {
  getDemoErrorLogs,
  getDemoHealthCheck,
  getDemoLatencyResponse,
  getDemoServiceUsage,
} from '@/mocks'

export interface ServerStatusRepository {
  getHealth: () => Promise<HealthCheck>
  getLatency: () => Promise<LatencyResponse>
  getServiceUsage: () => Promise<ServiceUsage[]>
  getErrorLogs: () => Promise<ErrorLog[]>
}

const apiRepository: ServerStatusRepository = {
  getHealth: () => fetchServerHealth(),
  getLatency: () => fetchServerLatency(),
  getServiceUsage: () => fetchServiceUsage(),
  getErrorLogs: () => fetchServerErrors(),
}

const demoRepository: ServerStatusRepository = {
  getHealth: async () => getDemoHealthCheck(),
  getLatency: async () => getDemoLatencyResponse(),
  getServiceUsage: async () => getDemoServiceUsage(),
  getErrorLogs: async () => getDemoErrorLogs(),
}

export function getServerStatusRepository(
  mode: DataMode = getDataMode()
): ServerStatusRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
