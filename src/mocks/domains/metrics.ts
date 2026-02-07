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

function toTrendWindow(period: MetricsPeriod) {
  switch (period) {
    case '24h':
      return 1
    case '7d':
      return 7
    default:
      return 30
  }
}

function toAnalyticsWindow(period: MetricsPeriod) {
  switch (period) {
    case '24h':
      return 24
    case '7d':
      return 168
    default:
      return 168
  }
}

function trendsByPeriod(period: MetricsPeriod): EmbeddingTrend[] {
  const trends = getDemoScenarioState().metricsOverview.trends
  return cloneDemoValue(trends.slice(-toTrendWindow(period)))
}

function analyticsByPeriod(period: MetricsPeriod): SearchAnalytics[] {
  const analytics = getDemoScenarioState().metricsOverview.searchAnalytics
  return cloneDemoValue(analytics.slice(-toAnalyticsWindow(period)))
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
