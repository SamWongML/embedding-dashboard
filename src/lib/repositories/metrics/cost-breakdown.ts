import type {
  CostBreakdownCategory,
  CostBreakdownItem,
  EmbeddingTrend,
  SearchAnalytics,
} from '@/lib/schemas/metrics'

export const TEXT_QUERY_UNIT_COST_USD = 0.0018
export const IMAGE_QUERY_UNIT_COST_USD = 0.0052
export const SEARCH_QUERY_UNIT_COST_USD = 0.0009

const VECTOR_STORAGE_UNIT_COST_USD = 0.00024
const GRAPH_OPERATION_UNIT_COST_USD = 0.00016
const DATA_TRANSFER_UNIT_COST_USD = 0.00008

export const COST_BREAKDOWN_CATEGORY_ORDER: CostBreakdownCategory[] = [
  'embedding_api',
  'vector_storage',
  'search_queries',
  'graph_operations',
  'data_transfer',
]

const costBreakdownCategorySet = new Set<CostBreakdownCategory>(COST_BREAKDOWN_CATEGORY_ORDER)

interface CostBreakdownDerivationInput {
  trends: EmbeddingTrend[]
  searchAnalytics: SearchAnalytics[]
}

function clampFiniteCurrency(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

function roundCurrency(value: number) {
  const rounded = Math.round(value * 100) / 100
  return clampFiniteCurrency(rounded)
}

function toCategoryMap(items: CostBreakdownItem[]) {
  const map = new Map<CostBreakdownCategory, number>()

  items.forEach((item) => {
    if (!costBreakdownCategorySet.has(item.category)) return
    map.set(item.category, clampFiniteCurrency(item.amountUsd))
  })

  return map
}

function sumTrendCounts(trends: EmbeddingTrend[]) {
  return trends.reduce(
    (totals, point) => {
      totals.textEmbeddings += Math.max(0, point.textEmbeddings)
      totals.imageEmbeddings += Math.max(0, point.imageEmbeddings)
      totals.searches += Math.max(0, point.searches)
      return totals
    },
    { textEmbeddings: 0, imageEmbeddings: 0, searches: 0 }
  )
}

function resolveTotalSearchCount(
  searchAnalytics: SearchAnalytics[],
  trendSearchCount: number
) {
  const analyticsSearchCount = searchAnalytics.reduce(
    (total, point) => total + Math.max(0, point.count),
    0
  )

  return analyticsSearchCount > 0 ? analyticsSearchCount : trendSearchCount
}

export function buildFallbackCostBreakdown({
  trends,
  searchAnalytics,
}: CostBreakdownDerivationInput): CostBreakdownItem[] {
  const trendTotals = sumTrendCounts(trends)
  const totalEmbeddingRequests = trendTotals.textEmbeddings + trendTotals.imageEmbeddings
  const totalSearchRequests = resolveTotalSearchCount(searchAnalytics, trendTotals.searches)
  const totalGraphOperations = totalEmbeddingRequests + totalSearchRequests

  return [
    {
      category: 'embedding_api',
      amountUsd: roundCurrency(
        trendTotals.textEmbeddings * TEXT_QUERY_UNIT_COST_USD
          + trendTotals.imageEmbeddings * IMAGE_QUERY_UNIT_COST_USD
      ),
    },
    {
      category: 'vector_storage',
      amountUsd: roundCurrency(totalEmbeddingRequests * VECTOR_STORAGE_UNIT_COST_USD),
    },
    {
      category: 'search_queries',
      amountUsd: roundCurrency(totalSearchRequests * SEARCH_QUERY_UNIT_COST_USD),
    },
    {
      category: 'graph_operations',
      amountUsd: roundCurrency(totalGraphOperations * GRAPH_OPERATION_UNIT_COST_USD),
    },
    {
      category: 'data_transfer',
      amountUsd: roundCurrency(totalSearchRequests * DATA_TRANSFER_UNIT_COST_USD),
    },
  ]
}

export function normalizeCostBreakdownItems(
  items: CostBreakdownItem[] | undefined,
  input: CostBreakdownDerivationInput
): CostBreakdownItem[] {
  const providedValues = toCategoryMap(items ?? [])
  const fallbackValues = toCategoryMap(buildFallbackCostBreakdown(input))

  return COST_BREAKDOWN_CATEGORY_ORDER.map((category) => ({
    category,
    amountUsd: roundCurrency(
      providedValues.get(category) ?? fallbackValues.get(category) ?? 0
    ),
  }))
}

