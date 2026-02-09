import type { EmbeddingTrend } from '@/lib/schemas/metrics'

const DAY_ONLY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export interface TrendChartPoint {
  date: string
  timestamp: number
  'Text Embeddings': number
  'Image Embeddings': number
  Searches: number
}

export function parseTrendTimestamp(date: string): number {
  const normalizedDate = DAY_ONLY_DATE_PATTERN.test(date)
    ? `${date}T00:00:00.000Z`
    : date

  const timestamp = Date.parse(normalizedDate)

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

export function normalizeEmbeddingTrends(data: EmbeddingTrend[]): TrendChartPoint[] {
  const withOrdering = data.map((point, index) => ({
    index,
    date: point.date,
    timestamp: parseTrendTimestamp(point.date),
    'Text Embeddings': point.textEmbeddings,
    'Image Embeddings': point.imageEmbeddings,
    Searches: point.searches,
  }))

  withOrdering.sort((left, right) => left.timestamp - right.timestamp || left.index - right.index)

  return withOrdering.map((point) => ({
    date: point.date,
    timestamp: point.timestamp,
    'Text Embeddings': point['Text Embeddings'],
    'Image Embeddings': point['Image Embeddings'],
    Searches: point.Searches,
  }))
}

export function formatTrendDateLabel(
  date: string,
  locale = 'en-US',
  period?: '24h' | '7d' | '30d'
): string {
  const timestamp = parseTrendTimestamp(date)

  if (!Number.isFinite(timestamp)) return date

  const dateObj = new Date(timestamp)

  if (period === '24h') {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj)
}
