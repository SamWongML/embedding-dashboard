'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from '@/lib/schemas/metrics'
import { getMetricsRepository } from '@/lib/repositories/metrics'

const metricsRepository = getMetricsRepository()

export function useMetricsOverview(period: string = '24h') {
  return useQuery<MetricsOverview>({
    queryKey: queryKeys.metrics.overview(period),
    queryFn: () => metricsRepository.getOverview(period),
    refetchInterval: 30000,
  })
}

export function useTopHits(period: string = '24h') {
  return useQuery<TopHit[]>({
    queryKey: queryKeys.metrics.topHits(period),
    queryFn: () => metricsRepository.getTopHits(period),
    refetchInterval: 30000,
  })
}

export function useTopUsers(period: string = '24h') {
  return useQuery<TopUser[]>({
    queryKey: queryKeys.metrics.topUsers(period),
    queryFn: () => metricsRepository.getTopUsers(period),
    refetchInterval: 30000,
  })
}

export function useEmbeddingTrends(period: string = '30d') {
  return useQuery<EmbeddingTrend[]>({
    queryKey: queryKeys.metrics.trends(period),
    queryFn: () => metricsRepository.getEmbeddingTrends(period),
    refetchInterval: 60000,
  })
}

export function useSearchAnalytics(period: string = '7d') {
  return useQuery<SearchAnalytics[]>({
    queryKey: queryKeys.metrics.searchAnalytics(period),
    queryFn: () => metricsRepository.getSearchAnalytics(period),
    refetchInterval: 60000,
  })
}
