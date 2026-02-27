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

export const traceStatusSchema = z.enum(['ok', 'error'])

export const traceSummarySchema = z.object({
  id: z.string().min(1),
  traceId: z.string().min(1),
  timestamp: z.string().datetime(),
  status: traceStatusSchema,
  method: z.string().min(1),
  route: z.string().min(1),
  service: z.string().min(1),
  durationMs: z.number().nonnegative(),
  spanCount: z.number().int().nonnegative(),
})

export const traceSpanCategorySchema = z.enum([
  'http',
  'middleware',
  'model',
  'db',
  'cache',
  'queue',
  'serialize',
  'other',
])

export const traceSpanSchema = z.object({
  id: z.string().min(1),
  traceId: z.string().min(1),
  name: z.string().min(1),
  service: z.string().min(1),
  status: traceStatusSchema,
  category: traceSpanCategorySchema,
  startMs: z.number().nonnegative(),
  durationMs: z.number().nonnegative(),
  depth: z.number().int().nonnegative().default(0),
})

export const traceSpansResponseSchema = z.object({
  traceId: z.string().min(1),
  traceDurationMs: z.number().nonnegative(),
  spans: z.array(traceSpanSchema),
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
export type TraceStatus = z.infer<typeof traceStatusSchema>
export type TraceSummary = z.infer<typeof traceSummarySchema>
export type TraceSpanCategory = z.infer<typeof traceSpanCategorySchema>
export type TraceSpan = z.infer<typeof traceSpanSchema>
export type TraceSpansResponse = z.infer<typeof traceSpansResponseSchema>
export type ServerStatus = z.infer<typeof serverStatusSchema>
