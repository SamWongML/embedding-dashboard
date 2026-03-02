import * as z from 'zod'

const metricValueFormatSchema = z.object({
  minimumFractionDigits: z.number().int().nonnegative().optional(),
  maximumFractionDigits: z.number().int().nonnegative().optional(),
})

export const metricCardSchema = z.object({
  label: z.string(),
  value: z.number(),
  valuePrefix: z.string().optional(),
  valueSuffix: z.string().optional(),
  valueFormat: metricValueFormatSchema.optional(),
  change: z.number(),
  changeType: z.enum(['increase', 'decrease', 'neutral']),
  sparkline: z.array(z.number()).optional(),
})

export const topCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  collectionName: z.string().optional(),
  requestCount: z.number(),
  contentType: z.enum(['text', 'image', 'mixed']),
})

export const topUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  requestCount: z.number(),
  lastActive: z.string(),
})

export const costBreakdownCategorySchema = z.enum([
  'embedding_api',
  'vector_storage',
  'search_queries',
  'graph_operations',
  'data_transfer',
])

export const costBreakdownItemSchema = z.object({
  category: costBreakdownCategorySchema,
  amountUsd: z.number().nonnegative(),
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
  timestamp: z.string().optional(),
  date: z.string().optional(),
})

export const metricsOverviewSchema = z.object({
  cards: z.array(metricCardSchema),
  topCollections: z.array(topCollectionSchema),
  topUsers: z.array(topUserSchema),
  trends: z.array(embeddingTrendSchema),
  hourlyTrends: z.array(embeddingTrendSchema).optional(),
  searchAnalytics: z.array(searchAnalyticsSchema),
  costBreakdown: z.array(costBreakdownItemSchema).optional(),
})

export type MetricCard = z.infer<typeof metricCardSchema>
export type TopCollection = z.infer<typeof topCollectionSchema>
export type TopUser = z.infer<typeof topUserSchema>
export type CostBreakdownCategory = z.infer<typeof costBreakdownCategorySchema>
export type CostBreakdownItem = z.infer<typeof costBreakdownItemSchema>
export type EmbeddingTrend = z.infer<typeof embeddingTrendSchema>
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>
export type MetricsOverview = z.infer<typeof metricsOverviewSchema>
