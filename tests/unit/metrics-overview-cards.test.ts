import { describe, expect, it } from 'vitest'
import type { MetricsOverview } from '@/lib/schemas/metrics'
import {
  normalizeMetricsOverview,
  TEXT_QUERY_UNIT_COST_USD,
  IMAGE_QUERY_UNIT_COST_USD,
  SEARCH_QUERY_UNIT_COST_USD,
} from '@/lib/repositories/metrics/normalize-overview'

function buildOverview(cards: MetricsOverview['cards']): MetricsOverview {
  return {
    cards,
    topCollections: [],
    topUsers: [
      {
        id: 'user-1',
        name: 'Avery Chen',
        email: 'avery@embedding.dev',
        requestCount: 42,
        lastActive: '2026-02-07T11:42:00.000Z',
      },
    ],
    trends: [
      { date: '2026-02-01', textEmbeddings: 1000, imageEmbeddings: 400, searches: 2200 },
      { date: '2026-02-02', textEmbeddings: 1100, imageEmbeddings: 420, searches: 2300 },
      { date: '2026-02-03', textEmbeddings: 1050, imageEmbeddings: 410, searches: 2250 },
      { date: '2026-02-04', textEmbeddings: 1025, imageEmbeddings: 415, searches: 2260 },
      { date: '2026-02-05', textEmbeddings: 980, imageEmbeddings: 430, searches: 2190 },
      { date: '2026-02-06', textEmbeddings: 970, imageEmbeddings: 435, searches: 2180 },
      { date: '2026-02-07', textEmbeddings: 960, imageEmbeddings: 440, searches: 2170 },
      { date: '2026-02-08', textEmbeddings: 950, imageEmbeddings: 445, searches: 2160 },
    ],
    searchAnalytics: [],
  }
}

describe('normalizeMetricsOverview', () => {
  it('reorders legacy cards and derives avg cost when absent', () => {
    const normalized = normalizeMetricsOverview(
      buildOverview([
        { label: 'Total Embeddings', value: 1240000, change: 11.7, changeType: 'increase' },
        { label: 'Searches Today', value: 52100, change: -1.9, changeType: 'decrease' },
        { label: 'Avg Latency', value: 43, change: 0.3, changeType: 'neutral' },
        { label: 'Active Users', value: 347, change: 7.6, changeType: 'increase' },
      ])
    )

    expect(normalized.cards.map((card) => card.label)).toEqual([
      'Total Embeddings',
      'Searches Today',
      'Active Users',
      'Avg Cost / Query',
    ])

    const activeUsers = normalized.cards[2]
    expect(activeUsers?.label).toBe('Active Users')
    expect(activeUsers?.value).toBe(347)

    const avgCost = normalized.cards[3]
    expect(avgCost).toMatchObject({
      label: 'Avg Cost / Query',
      valuePrefix: '$',
      valueFormat: { minimumFractionDigits: 4, maximumFractionDigits: 4 },
    })
    expect(avgCost?.value).toBeGreaterThan(0)
    expect(avgCost?.sparkline?.length).toBeGreaterThan(0)
  })

  it('preserves backend-provided avg cost card values and keeps active users as third', () => {
    const normalized = normalizeMetricsOverview(
      buildOverview([
        {
          label: 'Avg Cost / Query',
          value: 0.0033,
          valuePrefix: '$',
          valueFormat: { minimumFractionDigits: 4, maximumFractionDigits: 4 },
          change: -3.2,
          changeType: 'increase',
        },
        { label: 'Total Embeddings', value: 1240000, change: 11.7, changeType: 'increase' },
        { label: 'Active Users', value: 347, change: 7.6, changeType: 'increase' },
        { label: 'Searches Today', value: 52100, change: -1.9, changeType: 'decrease' },
      ])
    )

    expect(normalized.cards.map((card) => card.label)).toEqual([
      'Total Embeddings',
      'Searches Today',
      'Active Users',
      'Avg Cost / Query',
    ])

    expect(normalized.cards[2]?.label).toBe('Active Users')
    expect(normalized.cards[3]).toMatchObject({
      label: 'Avg Cost / Query',
      value: 0.0033,
      valuePrefix: '$',
      valueFormat: { minimumFractionDigits: 4, maximumFractionDigits: 4 },
      change: -3.2,
      changeType: 'increase',
    })
  })

  it('uses the agreed deterministic cost constants', () => {
    expect(TEXT_QUERY_UNIT_COST_USD).toBe(0.0018)
    expect(IMAGE_QUERY_UNIT_COST_USD).toBe(0.0052)
    expect(SEARCH_QUERY_UNIT_COST_USD).toBe(0.0009)
  })
})
