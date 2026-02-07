import { api } from "@/lib/api"
import {
  type ErrorLog,
  type HealthCheck,
  type LatencyResponse,
  type ServiceUsage,
  errorLogSchema,
  healthCheckSchema,
  latencyResponseSchema,
  serviceUsageSchema,
} from "@/lib/schemas/server-status"

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
