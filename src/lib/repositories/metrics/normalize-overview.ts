import type {
  EmbeddingTrend,
  MetricCard,
  MetricsOverview,
} from '@/lib/schemas/metrics'

export const TEXT_QUERY_UNIT_COST_USD = 0.0018
export const IMAGE_QUERY_UNIT_COST_USD = 0.0052
export const SEARCH_QUERY_UNIT_COST_USD = 0.0009

const METRIC_CARD_ORDER = [
  'Total Embeddings',
  'Searches Today',
  'Active Users',
  'Avg Cost / Query',
] as const

type OrderedMetricLabel = (typeof METRIC_CARD_ORDER)[number]

function clampFiniteNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((total, value) => total + value, 0) / values.length
}

function round(value: number, precision: number) {
  const multiplier = 10 ** precision
  return Math.round(value * multiplier) / multiplier
}

function percentChange(current: number, previous: number) {
  if (previous === 0 || !Number.isFinite(previous)) {
    return 0
  }

  return ((current - previous) / previous) * 100
}

function resolveInverseChangeType(changePercent: number): MetricCard['changeType'] {
  if (changePercent < 0) return 'increase'
  if (changePercent > 0) return 'decrease'
  return 'neutral'
}

function buildPointCost(trendPoint: EmbeddingTrend) {
  const totalRequests =
    trendPoint.textEmbeddings + trendPoint.imageEmbeddings + trendPoint.searches
  const weightedCost =
    trendPoint.textEmbeddings * TEXT_QUERY_UNIT_COST_USD +
    trendPoint.imageEmbeddings * IMAGE_QUERY_UNIT_COST_USD +
    trendPoint.searches * SEARCH_QUERY_UNIT_COST_USD

  return weightedCost / Math.max(1, totalRequests)
}

function buildAvgCostSeries(trends: EmbeddingTrend[]) {
  return trends
    .map((trendPoint) => buildPointCost(trendPoint))
    .filter((pointCost) => Number.isFinite(pointCost))
}

function withAvgCostDisplayMetadata(card: MetricCard): MetricCard {
  return {
    ...card,
    label: 'Avg Cost / Query',
    valuePrefix: card.valuePrefix ?? '$',
    valueFormat: card.valueFormat ?? {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    },
  }
}

function buildDefaultMetricCard(label: OrderedMetricLabel): MetricCard {
  return {
    label,
    value: 0,
    change: 0,
    changeType: 'neutral',
  }
}

function buildFallbackActiveUsersCard(overview: MetricsOverview): MetricCard {
  const fallback = buildDefaultMetricCard('Active Users')
  return {
    ...fallback,
    value: overview.topUsers.length,
  }
}

export function deriveAvgCostPerQueryCard(
  trends: EmbeddingTrend[],
  existingCard?: MetricCard
): MetricCard {
  if (existingCard) {
    return withAvgCostDisplayMetadata(existingCard)
  }

  const avgCostSeries = buildAvgCostSeries(trends)
  const averageCost = average(avgCostSeries)
  const sparkline = avgCostSeries.slice(-7)
  const comparisonWindowSize = Math.min(7, Math.floor(avgCostSeries.length / 2))
  const currentWindow = comparisonWindowSize > 0
    ? avgCostSeries.slice(-comparisonWindowSize)
    : []
  const previousWindow = comparisonWindowSize > 0
    ? avgCostSeries.slice(-(comparisonWindowSize * 2), -comparisonWindowSize)
    : []
  const currentWindowAverage = currentWindow.length > 0
    ? average(currentWindow)
    : averageCost
  const previousWindowAverage = previousWindow.length === comparisonWindowSize
    ? average(previousWindow)
    : 0
  const delta = previousWindowAverage > 0
    ? percentChange(currentWindowAverage, previousWindowAverage)
    : 0

  return withAvgCostDisplayMetadata({
    label: 'Avg Cost / Query',
    value: clampFiniteNumber(averageCost),
    change: round(delta, 1),
    changeType: resolveInverseChangeType(delta),
    sparkline: sparkline.length > 0 ? sparkline : undefined,
  })
}

function resolveOrderedMetricCard(
  label: OrderedMetricLabel,
  overview: MetricsOverview,
  cardsByLabel: Map<string, MetricCard>
): MetricCard {
  if (label === 'Avg Cost / Query') {
    return deriveAvgCostPerQueryCard(overview.trends, cardsByLabel.get(label))
  }

  if (label === 'Active Users') {
    return cardsByLabel.get(label) ?? buildFallbackActiveUsersCard(overview)
  }

  return cardsByLabel.get(label) ?? buildDefaultMetricCard(label)
}

export function normalizeMetricsOverview(overview: MetricsOverview): MetricsOverview {
  const cardsByLabel = new Map(overview.cards.map((card) => [card.label, card]))
  const cards = METRIC_CARD_ORDER.map((label) =>
    resolveOrderedMetricCard(label, overview, cardsByLabel)
  )

  return {
    ...overview,
    cards,
  }
}

