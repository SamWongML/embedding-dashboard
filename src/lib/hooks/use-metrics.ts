'use client'

import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type MetricsOverview,
  type MetricCard,
  type TopHit,
  type TopUser,
  type EmbeddingTrend,
  type SearchAnalytics,
} from '@/lib/schemas/metrics'

// Mock data for development
const mockMetricCards: MetricCard[] = [
  { label: 'Total Embeddings', value: 1250000, change: 12.5, changeType: 'increase', sparkline: [100, 120, 115, 130, 145, 140, 160] },
  { label: 'Searches Today', value: 8420, change: -3.2, changeType: 'decrease', sparkline: [80, 75, 82, 78, 70, 68, 72] },
  { label: 'Avg Latency', value: 45, change: 0, changeType: 'neutral', sparkline: [45, 48, 42, 46, 44, 45, 45] },
  { label: 'Active Users', value: 342, change: 8.1, changeType: 'increase', sparkline: [300, 310, 320, 325, 330, 338, 342] },
]

const mockTopHits: TopHit[] = [
  { id: '1', name: 'Product Documentation', count: 15420, type: 'text' },
  { id: '2', name: 'API Reference', count: 12300, type: 'text' },
  { id: '3', name: 'User Guide', count: 9800, type: 'text' },
  { id: '4', name: 'Tutorial Images', count: 7500, type: 'image' },
  { id: '5', name: 'FAQ Section', count: 6200, type: 'text' },
]

const mockTopUsers: TopUser[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', requestCount: 24500, lastActive: new Date().toISOString() },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', requestCount: 18200, lastActive: new Date().toISOString() },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', requestCount: 15800, lastActive: new Date().toISOString() },
  { id: '4', name: 'David Brown', email: 'david@example.com', requestCount: 12400, lastActive: new Date().toISOString() },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', requestCount: 9800, lastActive: new Date().toISOString() },
]

const mockTrends: EmbeddingTrend[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  textEmbeddings: Math.floor(Math.random() * 5000) + 3000,
  imageEmbeddings: Math.floor(Math.random() * 2000) + 1000,
  searches: Math.floor(Math.random() * 8000) + 5000,
}))

const mockSearchAnalytics: SearchAnalytics[] = Array.from({ length: 168 }, (_, i) => ({
  hour: i % 24,
  day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Math.floor(i / 24)],
  count: Math.floor(Math.random() * 500) + 50,
}))

export function useMetricsOverview(period: string = '24h') {
  return useQuery({
    queryKey: queryKeys.metrics.overview(period),
    queryFn: async () => {
      try {
        return await api.get<MetricsOverview>(`/metrics/overview?period=${period}`)
      } catch {
        return {
          cards: mockMetricCards,
          topHits: mockTopHits,
          topUsers: mockTopUsers,
          trends: mockTrends,
          searchAnalytics: mockSearchAnalytics,
        }
      }
    },
    refetchInterval: 30000,
  })
}

export function useTopHits(period: string = '24h') {
  return useQuery({
    queryKey: queryKeys.metrics.topHits(period),
    queryFn: async () => {
      try {
        return await api.get<TopHit[]>(`/metrics/top-hits?period=${period}`)
      } catch {
        return mockTopHits
      }
    },
    refetchInterval: 30000,
  })
}

export function useTopUsers(period: string = '24h') {
  return useQuery({
    queryKey: queryKeys.metrics.topUsers(period),
    queryFn: async () => {
      try {
        return await api.get<TopUser[]>(`/metrics/top-users?period=${period}`)
      } catch {
        return mockTopUsers
      }
    },
    refetchInterval: 30000,
  })
}

export function useEmbeddingTrends(period: string = '30d') {
  return useQuery({
    queryKey: queryKeys.metrics.trends(period),
    queryFn: async () => {
      try {
        return await api.get<EmbeddingTrend[]>(`/metrics/trends?period=${period}`)
      } catch {
        return mockTrends
      }
    },
    refetchInterval: 60000,
  })
}

export function useSearchAnalytics(period: string = '7d') {
  return useQuery({
    queryKey: queryKeys.metrics.searchAnalytics(period),
    queryFn: async () => {
      try {
        return await api.get<SearchAnalytics[]>(`/metrics/search-analytics?period=${period}`)
      } catch {
        return mockSearchAnalytics
      }
    },
    refetchInterval: 60000,
  })
}
