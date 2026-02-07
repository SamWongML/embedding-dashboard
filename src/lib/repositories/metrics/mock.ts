import type {
  EmbeddingTrend,
  MetricCard,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from "@/lib/schemas/metrics"

const mockMetricCards: MetricCard[] = [
  { label: "Total Embeddings", value: 1250000, change: 12.5, changeType: "increase", sparkline: [100, 120, 115, 130, 145, 140, 160] },
  { label: "Searches Today", value: 8420, change: -3.2, changeType: "decrease", sparkline: [80, 75, 82, 78, 70, 68, 72] },
  { label: "Avg Latency", value: 45, change: 0, changeType: "neutral", sparkline: [45, 48, 42, 46, 44, 45, 45] },
  { label: "Active Users", value: 342, change: 8.1, changeType: "increase", sparkline: [300, 310, 320, 325, 330, 338, 342] },
]

const mockTopHits: TopHit[] = [
  { id: "1", name: "Product Documentation", count: 15420, type: "text" },
  { id: "2", name: "API Reference", count: 12300, type: "text" },
  { id: "3", name: "User Guide", count: 9800, type: "text" },
  { id: "4", name: "Tutorial Images", count: 7500, type: "image" },
  { id: "5", name: "FAQ Section", count: 6200, type: "text" },
]

const mockTopUsers: TopUser[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", requestCount: 24500, lastActive: new Date().toISOString() },
  { id: "2", name: "Bob Smith", email: "bob@example.com", requestCount: 18200, lastActive: new Date().toISOString() },
  { id: "3", name: "Carol Williams", email: "carol@example.com", requestCount: 15800, lastActive: new Date().toISOString() },
  { id: "4", name: "David Brown", email: "david@example.com", requestCount: 12400, lastActive: new Date().toISOString() },
  { id: "5", name: "Eve Davis", email: "eve@example.com", requestCount: 9800, lastActive: new Date().toISOString() },
]

function getMockTrends(): EmbeddingTrend[] {
  return Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    textEmbeddings: Math.floor(Math.random() * 5000) + 3000,
    imageEmbeddings: Math.floor(Math.random() * 2000) + 1000,
    searches: Math.floor(Math.random() * 8000) + 5000,
  }))
}

function buildMockSearchAnalytics(): SearchAnalytics[] {
  return Array.from({ length: 168 }, (_, index) => ({
    hour: index % 24,
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Math.floor(index / 24)] ?? "Sun",
    count: Math.floor(Math.random() * 500) + 50,
  }))
}

export function getMockMetricsOverview(): MetricsOverview {
  return {
    cards: mockMetricCards,
    topHits: mockTopHits,
    topUsers: mockTopUsers,
    trends: getMockTrends(),
    searchAnalytics: buildMockSearchAnalytics(),
  }
}

export function getMockTopHits(): TopHit[] {
  return mockTopHits
}

export function getMockTopUsers(): TopUser[] {
  return mockTopUsers
}

export function getMockEmbeddingTrends(): EmbeddingTrend[] {
  return getMockTrends()
}

export function getMockSearchAnalytics(): SearchAnalytics[] {
  return buildMockSearchAnalytics()
}
