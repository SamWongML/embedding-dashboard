import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopCollection,
  TopUser,
} from '@/lib/schemas/metrics'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  fetchEmbeddingTrends,
  fetchMetricsOverview,
  fetchSearchAnalytics,
  fetchTopCollections,
  fetchTopUsers,
} from '@/lib/repositories/metrics/api'
import {
  getDemoEmbeddingTrends,
  getDemoMetricsOverview,
  getDemoSearchAnalytics,
  getDemoTopCollections,
  getDemoTopUsers,
} from '@/mocks'
import { normalizeMetricsOverview } from '@/lib/repositories/metrics/normalize-overview'

export interface MetricsRepository {
  getOverview: (period: string) => Promise<MetricsOverview>
  getTopCollections: (period: string) => Promise<TopCollection[]>
  getTopUsers: (period: string) => Promise<TopUser[]>
  getEmbeddingTrends: (period: string) => Promise<EmbeddingTrend[]>
  getSearchAnalytics: (period: string) => Promise<SearchAnalytics[]>
}

const apiRepository: MetricsRepository = {
  getOverview: async (period) => {
    const overview = await fetchMetricsOverview(period)
    return normalizeMetricsOverview(overview)
  },
  getTopCollections: (period) => fetchTopCollections(period),
  getTopUsers: (period) => fetchTopUsers(period),
  getEmbeddingTrends: (period) => fetchEmbeddingTrends(period),
  getSearchAnalytics: (period) => fetchSearchAnalytics(period),
}

const demoRepository: MetricsRepository = {
  getOverview: async (period) => {
    const overview = await getDemoMetricsOverview(period)
    return normalizeMetricsOverview(overview)
  },
  getTopCollections: async () => getDemoTopCollections(),
  getTopUsers: async () => getDemoTopUsers(),
  getEmbeddingTrends: async (period) => getDemoEmbeddingTrends(period),
  getSearchAnalytics: async (period) => getDemoSearchAnalytics(period),
}

export function getMetricsRepository(mode: DataMode = getDataMode()): MetricsRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
