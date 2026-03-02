import { api } from "@/lib/api"
import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopCollection,
  TopUser,
} from "@/lib/schemas/metrics"
import {
  embeddingTrendSchema,
  metricsOverviewSchema,
  searchAnalyticsSchema,
  topCollectionSchema,
  topUserSchema,
} from "@/lib/schemas/metrics"

export async function fetchMetricsOverview(period: string): Promise<MetricsOverview> {
  return api.get<MetricsOverview>(`/metrics/overview?period=${period}`, metricsOverviewSchema)
}

export async function fetchTopCollections(period: string): Promise<TopCollection[]> {
  return api.get<TopCollection[]>(
    `/metrics/top-collections?period=${period}`,
    topCollectionSchema.array()
  )
}

export async function fetchTopUsers(period: string): Promise<TopUser[]> {
  return api.get<TopUser[]>(`/metrics/top-users?period=${period}`, topUserSchema.array())
}

export async function fetchEmbeddingTrends(period: string): Promise<EmbeddingTrend[]> {
  return api.get<EmbeddingTrend[]>(`/metrics/trends?period=${period}`, embeddingTrendSchema.array())
}

export async function fetchSearchAnalytics(period: string): Promise<SearchAnalytics[]> {
  return api.get<SearchAnalytics[]>(`/metrics/search-analytics?period=${period}`, searchAnalyticsSchema.array())
}
