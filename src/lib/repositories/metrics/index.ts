import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from '@/lib/schemas/metrics'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  fetchEmbeddingTrends,
  fetchMetricsOverview,
  fetchSearchAnalytics,
  fetchTopHits,
  fetchTopUsers,
} from '@/lib/repositories/metrics/api'
import {
  getDemoEmbeddingTrends,
  getDemoMetricsOverview,
  getDemoSearchAnalytics,
  getDemoTopHits,
  getDemoTopUsers,
} from '@/mocks'

export interface MetricsRepository {
  getOverview: (period: string) => Promise<MetricsOverview>
  getTopHits: (period: string) => Promise<TopHit[]>
  getTopUsers: (period: string) => Promise<TopUser[]>
  getEmbeddingTrends: (period: string) => Promise<EmbeddingTrend[]>
  getSearchAnalytics: (period: string) => Promise<SearchAnalytics[]>
}

const apiRepository: MetricsRepository = {
  getOverview: (period) => fetchMetricsOverview(period),
  getTopHits: (period) => fetchTopHits(period),
  getTopUsers: (period) => fetchTopUsers(period),
  getEmbeddingTrends: (period) => fetchEmbeddingTrends(period),
  getSearchAnalytics: (period) => fetchSearchAnalytics(period),
}

const demoRepository: MetricsRepository = {
  getOverview: async (period) => getDemoMetricsOverview(period),
  getTopHits: async () => getDemoTopHits(),
  getTopUsers: async () => getDemoTopUsers(),
  getEmbeddingTrends: async (period) => getDemoEmbeddingTrends(period),
  getSearchAnalytics: async (period) => getDemoSearchAnalytics(period),
}

export function getMetricsRepository(mode: DataMode = getDataMode()): MetricsRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
