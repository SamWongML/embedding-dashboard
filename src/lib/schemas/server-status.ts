import * as z from 'zod'

export const serviceStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy'])

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const numeric = Number(trimmed)
    if (Number.isFinite(numeric)) return numeric
    const match = trimmed.match(/-?\d+(\.\d+)?/)
    if (match) {
      const parsed = Number(match[0])
      return Number.isFinite(parsed) ? parsed : undefined
    }
  }
  return undefined
}

const parseTimestamp = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) return value
  return undefined
}

export const healthCheckSchema = z.object({
  status: serviceStatusSchema.catch('healthy'),
  uptime: z.preprocess(parseNumber, z.number().nonnegative().default(0)),
  version: z.string().catch('unknown'),
  timestamp: z.preprocess(parseTimestamp, z.string().default(() => new Date().toISOString())),
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
