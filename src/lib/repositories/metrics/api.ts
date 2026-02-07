import { api } from "@/lib/api"
import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from "@/lib/schemas/metrics"
import {
  embeddingTrendSchema,
  metricsOverviewSchema,
  searchAnalyticsSchema,
  topHitSchema,
  topUserSchema,
} from "@/lib/schemas/metrics"

export async function fetchMetricsOverview(period: string): Promise<MetricsOverview> {
  return api.get<MetricsOverview>(`/metrics/overview?period=${period}`, metricsOverviewSchema)
}

export async function fetchTopHits(period: string): Promise<TopHit[]> {
  return api.get<TopHit[]>(`/metrics/top-hits?period=${period}`, topHitSchema.array())
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
