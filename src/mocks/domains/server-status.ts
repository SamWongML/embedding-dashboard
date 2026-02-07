import type {
  ErrorLog,
  HealthCheck,
  LatencyResponse,
  ServiceUsage,
} from '@/lib/schemas/server-status'
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
