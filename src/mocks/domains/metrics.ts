import type {
  EmbeddingTrend,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from '@/lib/schemas/metrics'
import {
  cloneDemoValue,
  getDemoScenarioState,
} from '@/mocks/scenario'

type MetricsPeriod = '24h' | '7d' | '30d' | string

function trendsByPeriod(period: MetricsPeriod): EmbeddingTrend[] {
  const scenario = getDemoScenarioState()

  if (period === '24h') {
    return cloneDemoValue(scenario.metricsOverview.hourlyTrends ?? [])
  }

  const trends = scenario.metricsOverview.trends
  const window = period === '7d' ? 7 : 30
  return cloneDemoValue(trends.slice(-window))
}

function analyticsByPeriod(period: MetricsPeriod): SearchAnalytics[] {
  const analytics = getDemoScenarioState().metricsOverview.searchAnalytics
  const window = period === '24h' ? 24 : 168
  return cloneDemoValue(analytics.slice(-window))
}

export function getDemoMetricsOverview(period: MetricsPeriod = '24h'): MetricsOverview {
  const scenario = getDemoScenarioState()
  return {
    ...cloneDemoValue(scenario.metricsOverview),
    trends: trendsByPeriod(period),
    searchAnalytics: analyticsByPeriod(period),
  }
}

export function getDemoTopHits(): TopHit[] {
  return cloneDemoValue(getDemoScenarioState().metricsOverview.topHits)
}

export function getDemoTopUsers(): TopUser[] {
  return cloneDemoValue(getDemoScenarioState().metricsOverview.topUsers)
}

export function getDemoEmbeddingTrends(period: MetricsPeriod = '30d'): EmbeddingTrend[] {
  return trendsByPeriod(period)
}

export function getDemoSearchAnalytics(period: MetricsPeriod = '7d'): SearchAnalytics[] {
  return analyticsByPeriod(period)
}
