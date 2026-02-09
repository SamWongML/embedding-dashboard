import * as z from 'zod'

export const metricCardSchema = z.object({
  label: z.string(),
  value: z.number(),
  change: z.number(),
  changeType: z.enum(['increase', 'decrease', 'neutral']),
  sparkline: z.array(z.number()).optional(),
})

export const topHitSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
  type: z.string(),
})

export const topUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  requestCount: z.number(),
  lastActive: z.string(),
})

export const embeddingTrendSchema = z.object({
  date: z.string(),
  textEmbeddings: z.number(),
  imageEmbeddings: z.number(),
  searches: z.number(),
})

export const searchAnalyticsSchema = z.object({
  hour: z.number(),
  day: z.string(),
  count: z.number(),
})

export const metricsOverviewSchema = z.object({
  cards: z.array(metricCardSchema),
  topHits: z.array(topHitSchema),
  topUsers: z.array(topUserSchema),
  trends: z.array(embeddingTrendSchema),
  hourlyTrends: z.array(embeddingTrendSchema).optional(),
  searchAnalytics: z.array(searchAnalyticsSchema),
})

export type MetricCard = z.infer<typeof metricCardSchema>
export type TopHit = z.infer<typeof topHitSchema>
export type TopUser = z.infer<typeof topUserSchema>
export type EmbeddingTrend = z.infer<typeof embeddingTrendSchema>
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>
export type MetricsOverview = z.infer<typeof metricsOverviewSchema>
