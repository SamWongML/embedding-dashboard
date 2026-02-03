import * as z from 'zod'

export const serviceStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy'])

export const healthCheckSchema = z.object({
  status: serviceStatusSchema,
  uptime: z.number(),
  version: z.string(),
  timestamp: z.string(),
})

export const latencyDataPointSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
  endpoint: z.string().optional(),
})

export const latencyResponseSchema = z.object({
  current: z.number(),
  average: z.number(),
  p95: z.number(),
  p99: z.number(),
  history: z.array(latencyDataPointSchema),
})

export const serviceUsageSchema = z.object({
  endpoint: z.string(),
  method: z.string(),
  count: z.number(),
  avgLatency: z.number(),
})

export const errorLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  source: z.string(),
  stackTrace: z.string().optional(),
})

export const serverStatusSchema = z.object({
  health: healthCheckSchema,
  latency: latencyResponseSchema,
  services: z.array(serviceUsageSchema),
  errors: z.array(errorLogSchema),
})

export type ServiceStatus = z.infer<typeof serviceStatusSchema>
export type HealthCheck = z.infer<typeof healthCheckSchema>
export type LatencyDataPoint = z.infer<typeof latencyDataPointSchema>
export type LatencyResponse = z.infer<typeof latencyResponseSchema>
export type ServiceUsage = z.infer<typeof serviceUsageSchema>
export type ErrorLog = z.infer<typeof errorLogSchema>
export type ServerStatus = z.infer<typeof serverStatusSchema>
