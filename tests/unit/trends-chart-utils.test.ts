import { describe, expect, it } from 'vitest'
import {
  formatTrendDateLabel,
  normalizeEmbeddingTrends,
} from '@/components/charts/trends-chart-utils'
import type { EmbeddingTrend } from '@/lib/schemas/metrics'

function trend(date: string, textEmbeddings: number, imageEmbeddings: number, searches: number): EmbeddingTrend {
  return {
    date,
    textEmbeddings,
    imageEmbeddings,
    searches,
  }
}

describe('trends-chart-utils', () => {
  it('sorts trends by ascending parsed date while preserving value mappings', () => {
    const unordered: EmbeddingTrend[] = [
      trend('2026-02-03', 30, 13, 103),
      trend('2026-02-01', 10, 11, 101),
      trend('2026-02-02', 20, 12, 102),
    ]

    const normalized = normalizeEmbeddingTrends(unordered)

    expect(normalized.map((point) => point.date)).toEqual([
      '2026-02-01',
      '2026-02-02',
      '2026-02-03',
    ])
    expect(normalized.map((point) => point['Text Embeddings'])).toEqual([10, 20, 30])
  })

  it('keeps stable order when dates are equal', () => {
    const sameDate: EmbeddingTrend[] = [
      trend('2026-02-01', 10, 11, 101),
      trend('2026-02-01', 20, 12, 102),
    ]

    const normalized = normalizeEmbeddingTrends(sameDate)

    expect(normalized.map((point) => point['Text Embeddings'])).toEqual([10, 20])
  })

  it('formats YYYY-MM-DD labels in UTC to avoid timezone drift', () => {
    expect(formatTrendDateLabel('2026-02-07')).toBe('Feb 7')
  })

  it('returns the original label when date parsing fails', () => {
    expect(formatTrendDateLabel('not-a-date')).toBe('not-a-date')
  })
})
