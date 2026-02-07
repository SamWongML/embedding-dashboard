'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiState } from '@/lib/api'
import { queryKeys, resolveApiState } from '@/lib/api'
import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from '@/lib/schemas/metrics'
import {
  fetchEmbeddingTrends,
  fetchMetricsOverview,
  fetchSearchAnalytics,
  fetchTopHits,
  fetchTopUsers,
} from '@/lib/repositories/metrics/api'
import {
  getMockEmbeddingTrends,
  getMockMetricsOverview,
  getMockSearchAnalytics,
  getMockTopHits,
  getMockTopUsers,
} from '@/lib/repositories/metrics/mock'

export function useMetricsOverview(period: string = '24h') {
  return useQuery<ApiState<MetricsOverview>>({
    queryKey: queryKeys.metrics.overview(period),
    queryFn: () => resolveApiState(
      () => fetchMetricsOverview(period),
      getMockMetricsOverview
    ),
    refetchInterval: 30000,
  })
}

export function useTopHits(period: string = '24h') {
  return useQuery<ApiState<TopHit[]>>({
    queryKey: queryKeys.metrics.topHits(period),
    queryFn: () => resolveApiState(
      () => fetchTopHits(period),
      getMockTopHits
    ),
    refetchInterval: 30000,
  })
}

export function useTopUsers(period: string = '24h') {
  return useQuery<ApiState<TopUser[]>>({
    queryKey: queryKeys.metrics.topUsers(period),
    queryFn: () => resolveApiState(
      () => fetchTopUsers(period),
      getMockTopUsers
    ),
    refetchInterval: 30000,
  })
}

export function useEmbeddingTrends(period: string = '30d') {
  return useQuery<ApiState<EmbeddingTrend[]>>({
    queryKey: queryKeys.metrics.trends(period),
    queryFn: () => resolveApiState(
      () => fetchEmbeddingTrends(period),
      getMockEmbeddingTrends
    ),
    refetchInterval: 60000,
  })
}

export function useSearchAnalytics(period: string = '7d') {
  return useQuery<ApiState<SearchAnalytics[]>>({
    queryKey: queryKeys.metrics.searchAnalytics(period),
    queryFn: () => resolveApiState(
      () => fetchSearchAnalytics(period),
      getMockSearchAnalytics
    ),
    refetchInterval: 60000,
  })
}
