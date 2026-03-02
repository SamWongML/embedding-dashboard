import type {
  GraphData,
  GraphEdge,
  GraphNode,
} from '@/lib/schemas/graph'
import type {
  ImageEmbeddingModel,
} from '@/lib/schemas/image-embedding'
import type {
  EmbeddingTrend,
  MetricCard,
  MetricsOverview,
  SearchAnalytics,
  TopHit,
  TopUser,
} from '@/lib/schemas/metrics'
import type {
  EmbeddingRecord,
} from '@/lib/schemas/records'
import type {
  SearchResult,
} from '@/lib/schemas/search'
import type {
  ErrorLog,
  HealthCheck,
  LatencyDataPoint,
  LatencyResponse,
  ServiceUsage,
  TraceSpan,
  TraceSpansResponse,
  TraceSummary,
} from '@/lib/schemas/server-status'
import type {
  EmbeddingModel,
  TextEmbeddingJobDetail,
} from '@/lib/schemas/text-embedding'
import type {
  PermissionMatrix,
  User as DashboardUser,
  UserGroup,
} from '@/lib/schemas/users'
import type {
  AccountSnapshot,
  User as AccountUser,
  WorkspaceSummary,
} from '@/lib/types/account'
import { deriveAvgCostPerQueryCard } from '@/lib/repositories/metrics/normalize-overview'

const MINUTE_MS = 60_000
const HALF_HOUR_MS = 30 * MINUTE_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export const DEMO_DEFAULT_SEED = 20260207
export const DEMO_DEFAULT_NOW = '2026-02-07T12:00:00.000Z'

export interface DemoContext {
  seed: number
  now: string
  workspaceId: string
  workspaceName: string
}

export interface DemoScenario {
  context: DemoContext
  accountSnapshot: AccountSnapshot
  users: DashboardUser[]
  userGroups: UserGroup[]
  permissionMatrix: PermissionMatrix
  records: EmbeddingRecord[]
  graphData: GraphData
  searchResults: SearchResult[]
  metricsOverview: MetricsOverview
  healthCheck: HealthCheck
  latencyResponse: LatencyResponse
  serviceUsage: ServiceUsage[]
  errorLogs: ErrorLog[]
  recentTraces: TraceSummary[]
  traceSpansByTraceId: Record<string, TraceSpansResponse>
  textEmbeddingModels: EmbeddingModel[]
  textEmbeddingJobs: TextEmbeddingJobDetail[]
  textEmbeddingJobPolls: Record<string, number>
  imageEmbeddingModels: ImageEmbeddingModel[]
}

interface DocumentSeed {
  slug: string
  title: string
  topic: string
  ownerGroup: string
  contentType: 'text' | 'image'
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 4294967296
  }
}

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function toIsoWithOffset(base: Date, offsetMs: number) {
  return new Date(base.getTime() + offsetMs).toISOString()
}

function titleFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]/g)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(' ')
}

function toVector(length: number, key: string, seed: number) {
  const random = createSeededRandom(hashString(`${seed}:${key}`))
  const vector = Array.from({ length }, () => random() * 2 - 1)
  return vector.map((value) => Number(value.toFixed(6)))
}

function round(value: number, precision = 2) {
  const base = 10 ** precision
  return Math.round(value * base) / base
}

function percentile(values: number[], target: number) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((sorted.length - 1) * target))
  )
  return sorted[index] ?? 0
}

function buildDashboardUsers(baseDate: Date): DashboardUser[] {
  const users: Array<Omit<DashboardUser, 'createdAt' | 'lastLoginAt'>> = [
    {
      id: 'user-1',
      name: 'Avery Chen',
      email: 'avery@embedding.dev',
      role: 'admin',
      groups: ['engineering', 'ml-platform'],
      avatarUrl: undefined,
      isActive: true,
    },
    {
      id: 'user-2',
      name: 'Noah Patel',
      email: 'noah@embedding.dev',
      role: 'editor',
      groups: ['engineering'],
      avatarUrl: undefined,
      isActive: true,
    },
    {
      id: 'user-3',
      name: 'Mina Alvarez',
      email: 'mina@embedding.dev',
      role: 'editor',
      groups: ['product', 'support'],
      avatarUrl: undefined,
      isActive: true,
    },
    {
      id: 'user-4',
      name: 'Jordan Kim',
      email: 'jordan@embedding.dev',
      role: 'viewer',
      groups: ['support'],
      avatarUrl: undefined,
      isActive: true,
    },
    {
      id: 'user-5',
      name: 'Iris Stone',
      email: 'iris@embedding.dev',
      role: 'admin',
      groups: ['security'],
      avatarUrl: undefined,
      isActive: true,
    },
    {
      id: 'user-6',
      name: 'Leo Park',
      email: 'leo@embedding.dev',
      role: 'viewer',
      groups: ['product'],
      avatarUrl: undefined,
      isActive: false,
    },
  ]

  return users.map((user, index) => ({
    ...user,
    createdAt: toIsoWithOffset(baseDate, -(120 + index * 20) * DAY_MS),
    lastLoginAt: user.isActive
      ? toIsoWithOffset(baseDate, -(index * 170 + 35) * MINUTE_MS)
      : toIsoWithOffset(baseDate, -3 * DAY_MS),
  }))
}

function buildUserGroups(baseDate: Date): UserGroup[] {
  return [
    {
      id: 'engineering',
      name: 'Engineering',
      description: 'Core platform and runtime services',
      memberCount: 26,
      permissions: ['read', 'write', 'delete'],
      createdAt: toIsoWithOffset(baseDate, -220 * DAY_MS),
    },
    {
      id: 'ml-platform',
      name: 'ML Platform',
      description: 'Embedding model operations and quality tracking',
      memberCount: 11,
      permissions: ['read', 'write'],
      createdAt: toIsoWithOffset(baseDate, -210 * DAY_MS),
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Search UX and retrieval workflows',
      memberCount: 14,
      permissions: ['read', 'write'],
      createdAt: toIsoWithOffset(baseDate, -195 * DAY_MS),
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Knowledge operations and incident triage',
      memberCount: 9,
      permissions: ['read'],
      createdAt: toIsoWithOffset(baseDate, -180 * DAY_MS),
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Access control and compliance workflows',
      memberCount: 6,
      permissions: ['read', 'write', 'admin'],
      createdAt: toIsoWithOffset(baseDate, -170 * DAY_MS),
    },
  ]
}

function buildPermissionMatrix(): PermissionMatrix {
  return {
    resources: ['embeddings', 'search', 'records', 'graph', 'users'],
    roles: [
      {
        role: 'admin',
        permissions: {
          embeddings: ['read', 'write', 'delete', 'admin'],
          search: ['read', 'write', 'delete', 'admin'],
          records: ['read', 'write', 'delete', 'admin'],
          graph: ['read', 'write', 'delete', 'admin'],
          users: ['read', 'write', 'delete', 'admin'],
        },
      },
      {
        role: 'editor',
        permissions: {
          embeddings: ['read', 'write'],
          search: ['read', 'write'],
          records: ['read', 'write'],
          graph: ['read', 'write'],
          users: ['read'],
        },
      },
      {
        role: 'viewer',
        permissions: {
          embeddings: ['read'],
          search: ['read'],
          records: ['read'],
          graph: ['read'],
          users: [],
        },
      },
    ],
  }
}

function buildDocumentSeeds(): DocumentSeed[] {
  return [
    {
      slug: 'retrieval-architecture',
      title: 'Retrieval Architecture',
      topic: 'retrieval',
      ownerGroup: 'engineering',
      contentType: 'text',
    },
    {
      slug: 'latency-playbook',
      title: 'Latency Playbook',
      topic: 'observability',
      ownerGroup: 'engineering',
      contentType: 'text',
    },
    {
      slug: 'hybrid-search-guide',
      title: 'Hybrid Search Guide',
      topic: 'search',
      ownerGroup: 'product',
      contentType: 'text',
    },
    {
      slug: 'permissions-runbook',
      title: 'Permissions Runbook',
      topic: 'security',
      ownerGroup: 'security',
      contentType: 'text',
    },
    {
      slug: 'incident-retrospective',
      title: 'Incident Retrospective',
      topic: 'support',
      ownerGroup: 'support',
      contentType: 'text',
    },
    {
      slug: 'model-benchmark-board',
      title: 'Model Benchmark Board',
      topic: 'embeddings',
      ownerGroup: 'ml-platform',
      contentType: 'image',
    },
    {
      slug: 'customer-intent-map',
      title: 'Customer Intent Map',
      topic: 'search',
      ownerGroup: 'product',
      contentType: 'image',
    },
    {
      slug: 'taxonomy-overview',
      title: 'Taxonomy Overview',
      topic: 'knowledge',
      ownerGroup: 'support',
      contentType: 'text',
    },
    {
      slug: 'vector-storage-notes',
      title: 'Vector Storage Notes',
      topic: 'embeddings',
      ownerGroup: 'engineering',
      contentType: 'text',
    },
    {
      slug: 'release-readiness-board',
      title: 'Release Readiness Board',
      topic: 'operations',
      ownerGroup: 'product',
      contentType: 'image',
    },
    {
      slug: 'api-style-guide',
      title: 'API Style Guide',
      topic: 'developer-experience',
      ownerGroup: 'engineering',
      contentType: 'text',
    },
    {
      slug: 'support-routing-manual',
      title: 'Support Routing Manual',
      topic: 'support',
      ownerGroup: 'support',
      contentType: 'text',
    },
  ]
}

function buildRecords(baseDate: Date, context: DemoContext): EmbeddingRecord[] {
  const records: EmbeddingRecord[] = []
  const documents = buildDocumentSeeds()

  documents.forEach((document, documentIndex) => {
    const chunkCount = document.contentType === 'image' ? 2 : 4

    Array.from({ length: chunkCount }).forEach((_, chunkIndex) => {
      const serial = records.length + 1
      const createdAt = toIsoWithOffset(
        baseDate,
        -(serial * 95 + documentIndex * 17) * MINUTE_MS
      )

      records.push({
        id: `record-${serial}`,
        content: `${document.title} chunk ${chunkIndex + 1}: ${
          document.contentType === 'image'
            ? 'Diagram annotation for embedding quality and retrieval confidence.'
            : 'Operational guidance for embedding ingestion, metadata governance, and search ranking.'
        }`,
        contentType: document.contentType,
        vectorDimensions: document.contentType === 'image' ? 512 : 1536,
        model:
          document.contentType === 'image'
            ? 'clip-vit-base-patch32'
            : 'text-embedding-3-small',
        metadata: {
          workspaceId: context.workspaceId,
          document: document.slug,
          topic: document.topic,
          ownerGroup: document.ownerGroup,
          chunk: chunkIndex + 1,
          totalChunks: chunkCount,
        },
        source: `knowledge/${document.slug}.md`,
        createdAt,
        updatedAt: toIsoWithOffset(baseDate, -(serial * 90 + documentIndex * 13) * MINUTE_MS),
      })
    })
  })

  return records
}

function buildSearchResults(
  records: EmbeddingRecord[],
  context: DemoContext
): SearchResult[] {
  const random = createSeededRandom(context.seed + 12)
  const selected = records.slice(0, 20)

  return selected.map((record, index) => {
    const baseline = 0.93 - index * 0.014
    const vectorScore = Math.max(0.41, baseline + random() * 0.08)
    const bm25Score = Math.max(0.35, baseline + random() * 0.05 - 0.02)
    const graphScore = Math.max(0.38, baseline + random() * 0.06 - 0.03)
    const score = round((vectorScore + bm25Score + graphScore) / 3, 3)

    return {
      id: `search-${index + 1}`,
      content: record.content,
      score,
      vectorScore: round(vectorScore, 3),
      bm25Score: round(bm25Score, 3),
      graphScore: round(graphScore, 3),
      metadata: {
        ...record.metadata,
        workspaceId: context.workspaceId,
      },
      highlights: [
        String(record.metadata?.topic ?? 'embeddings'),
        String(record.metadata?.ownerGroup ?? 'engineering'),
        record.contentType,
      ],
      source: record.source,
      createdAt: record.createdAt,
    }
  })
}

function buildTopHits(records: EmbeddingRecord[]): TopHit[] {
  const bySource = new Map<string, { name: string; type: string; count: number }>()

  records.forEach((record, index) => {
    const source = record.source ?? `unknown-${index}`
    const previous = bySource.get(source)
    if (previous) {
      previous.count += 190 + index * 3
      return
    }

    bySource.set(source, {
      name: source.split('/').pop()?.replace('.md', '').replace(/-/g, ' ') ?? source,
      type: record.contentType,
      count: 1200 + index * 77,
    })
  })

  return Array.from(bySource.entries())
    .map(([id, value]) => ({
      id,
      name: value.name
        .split(' ')
        .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
        .join(' '),
      count: value.count,
      type: value.type,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

function buildTopUsers(users: DashboardUser[], baseDate: Date): TopUser[] {
  return users
    .filter((user) => user.isActive)
    .map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      requestCount: 21000 - index * 2300,
      lastActive: toIsoWithOffset(baseDate, -(index * 40 + 20) * MINUTE_MS),
    }))
}

function buildTrends(baseDate: Date, seed: number): EmbeddingTrend[] {
  const random = createSeededRandom(seed + 41)
  return Array.from({ length: 30 }, (_, offset) => {
    const currentDate = new Date(baseDate.getTime() - (29 - offset) * DAY_MS)
    const day = currentDate.getUTCDay()
    const weekendModifier = day === 0 || day === 6 ? 0.72 : 1
    const growth = 1 + offset / 90

    const textEmbeddings = Math.floor((3200 + random() * 1100) * weekendModifier * growth)
    const imageEmbeddings = Math.floor((980 + random() * 540) * weekendModifier * growth)
    const searches = Math.floor((4800 + random() * 1700) * weekendModifier * growth)

    return {
      date: currentDate.toISOString().split('T')[0] ?? '',
      textEmbeddings,
      imageEmbeddings,
      searches,
    }
  })
}

function buildHourlyTrends(baseDate: Date, seed: number): EmbeddingTrend[] {
  const random = createSeededRandom(seed + 41)
  return Array.from({ length: 24 }, (_, offset) => {
    const currentDate = new Date(baseDate.getTime() - (23 - offset) * HOUR_MS)
    const hour = currentDate.getUTCHours()
    const rushHour = hour >= 8 && hour <= 18 ? 1.15 : 0.85

    return {
      date: currentDate.toISOString(),
      textEmbeddings: Math.floor((150 + random() * 80) * rushHour),
      imageEmbeddings: Math.floor((45 + random() * 30) * rushHour),
      searches: Math.floor((220 + random() * 100) * rushHour),
    }
  })
}

function buildSearchAnalytics(baseDate: Date, seed: number): SearchAnalytics[] {
  const random = createSeededRandom(seed + 58)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totalHours = 30 * 24
  const analytics = Array.from({ length: totalHours }, (_, index) => {
    const currentDate = new Date(baseDate.getTime() - (totalHours - 1 - index) * HOUR_MS)
    const hour = currentDate.getUTCHours()
    const dayIndex = currentDate.getUTCDay()
    const day = dayLabels[currentDate.getUTCDay()] ?? 'Sun'
    const isWeekend = dayIndex === 0 || dayIndex === 6
    const baseRequestsPerHour = isWeekend ? 960 : 1180
    const timeOfDayBoost = hour >= 13 && hour <= 20
      ? 320
      : hour >= 7 && hour <= 12 || hour >= 21 && hour <= 23
        ? 140
        : -180
    const jitter = Math.floor(random() * 241) - 120
    const count = Math.max(620, baseRequestsPerHour + timeOfDayBoost + jitter)

    return {
      hour,
      day,
      count,
      timestamp: currentDate.toISOString(),
    }
  })

  const latestPoint = analytics.at(-1)
  if (latestPoint) {
    latestPoint.count = 1000
  }

  return analytics
}

function buildMetricCards(
  records: EmbeddingRecord[],
  trends: EmbeddingTrend[],
  searchAnalytics: SearchAnalytics[]
): MetricCard[] {
  const totalEmbeddings = 1_240_000 + records.length * 41
  const searchesToday = searchAnalytics
    .slice(-24)
    .reduce((total, item) => total + item.count, 0)
  const activeUsers = 347
  const avgCostPerQuery = deriveAvgCostPerQueryCard(trends)

  return [
    {
      label: 'Total Embeddings',
      value: totalEmbeddings,
      change: 11.7,
      changeType: 'increase',
      sparkline: trends.slice(-7).map((item) => item.textEmbeddings + item.imageEmbeddings),
    },
    {
      label: 'Searches Today',
      value: searchesToday,
      change: -1.9,
      changeType: 'decrease',
      sparkline: searchAnalytics.slice(-7).map((item) => item.count),
    },
    {
      label: 'Active Users',
      value: activeUsers,
      change: 7.6,
      changeType: 'increase',
      sparkline: [301, 309, 317, 328, 334, 341, activeUsers],
    },
    avgCostPerQuery,
  ]
}

function buildLatencyResponse(baseDate: Date, seed: number): LatencyResponse {
  const random = createSeededRandom(seed + 77)
  const history: LatencyDataPoint[] = Array.from({ length: 60 }, (_, index) => {
    const timestamp = toIsoWithOffset(baseDate, -(59 - index) * HALF_HOUR_MS)
    const spike = index % 17 === 0 ? 35 : 0
    const value = Math.floor(29 + random() * 36 + spike)
    return { timestamp, value }
  })

  const latencyValues = history.map((item) => item.value)

  return {
    current: latencyValues[latencyValues.length - 1] ?? 0,
    average: round(
      latencyValues.reduce((total, value) => total + value, 0) /
        Math.max(1, latencyValues.length),
      1
    ),
    p95: round(percentile(latencyValues, 0.95), 1),
    p99: round(percentile(latencyValues, 0.99), 1),
    history,
  }
}

function buildServiceUsage(): ServiceUsage[] {
  return [
    { endpoint: '/api/embed/text', method: 'POST', count: 18_440, avgLatency: 42 },
    { endpoint: '/api/embed/image', method: 'POST', count: 6_820, avgLatency: 121 },
    { endpoint: '/api/search', method: 'POST', count: 25_760, avgLatency: 34 },
    { endpoint: '/api/records', method: 'GET', count: 12_640, avgLatency: 22 },
    { endpoint: '/api/graph', method: 'GET', count: 3_940, avgLatency: 81 },
  ]
}

function startOfUtcHour(date: Date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    0,
    0,
    0
  ))
}

function buildErrorLogs(
  baseDate: Date,
  searchAnalytics: SearchAnalytics[],
  seed: number
): ErrorLog[] {
  const random = createSeededRandom(seed + 91)
  const targetHourlyErrorRates = [
    1.6,
    0.5,
    1.4,
    0.7,
    1.8,
    0.6,
    1.2,
    0.9,
    1.5,
    0.4,
    1.3,
    0.8,
    1.7,
    0.6,
    1.1,
    0.9,
    1.4,
    0.5,
    1.2,
    0.8,
    1.6,
    0.7,
    1.0,
    0.1,
  ] as const
  const messageByLevel = {
    error: [
      'Embedding worker retried after model timeout.',
      'Search gateway returned upstream 503 and recovered.',
      'Vector index query failed and fell back to cached result.',
      'Cache write failed for hot-key embedding payload.',
    ],
    warning: [
      'Latency threshold exceeded for /api/search.',
      'Background reindex queue depth exceeded warning threshold.',
      'Rate limiter burst protection activated for workspace import jobs.',
      'Partial response served while shard warmed up.',
    ],
    info: [
      'Automatic recovery completed for transient service pressure.',
      'Worker pool autoscaled to stabilize request latency.',
      'Retry budget adjusted after elevated traffic.',
      'Circuit breaker reopened after healthy downstream checks.',
    ],
  } satisfies Record<ErrorLog['level'], string[]>
  const sourceByLevel = {
    error: ['embedding-worker', 'search-gateway', 'vector-index', 'cache-service'],
    warning: ['search-gateway', 'queue-monitor', 'rate-limiter', 'scheduler'],
    info: ['autoscaler', 'orchestrator', 'rate-limiter', 'health-monitor'],
  } satisfies Record<ErrorLog['level'], string[]>

  const recentAnalytics = searchAnalytics.slice(-24)
  const anchorHourStart = startOfUtcHour(baseDate)
  const errors: ErrorLog[] = []

  recentAnalytics.forEach((analyticsPoint, index) => {
    const targetRate = targetHourlyErrorRates[index] ?? 1
    const errorCount = Math.max(0, Math.round((analyticsPoint.count * targetRate) / 100))
    const hourOffset = recentAnalytics.length - 1 - index
    const hourStart = new Date(anchorHourStart.getTime() - hourOffset * HOUR_MS)

    for (let eventIndex = 0; eventIndex < errorCount; eventIndex += 1) {
      const levelRoll = random()
      const level: ErrorLog['level'] = levelRoll < 0.62
        ? 'error'
        : levelRoll < 0.88
          ? 'warning'
          : 'info'
      const messages = messageByLevel[level]
      const sources = sourceByLevel[level]
      const minuteOffset = hourOffset === 0
        ? 0
        : Math.floor(((eventIndex + 1) * 60) / (errorCount + 1))
      const secondOffset = hourOffset === 0
        ? eventIndex
        : Math.floor(random() * 60)
      const timestamp = new Date(
        hourStart.getTime() + minuteOffset * MINUTE_MS + secondOffset * 1000
      )

      errors.push({
        id: `error-${String(errors.length + 1).padStart(4, '0')}`,
        timestamp: timestamp.toISOString(),
        level,
        message: messages[Math.floor(random() * messages.length)] ?? messages[0] ?? 'System event logged.',
        source: sources[Math.floor(random() * sources.length)] ?? sources[0] ?? 'system',
      })
    }
  })

  return errors.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  )
}

interface TraceSeed {
  traceId: string
  method: string
  route: string
  service: string
  durationMs: number
  spanCount: number
  status: 'ok' | 'error'
  secondsAgo: number
}

const traceSeeds: TraceSeed[] = [
  {
    traceId: 'tr-a8f3c2',
    method: 'POST',
    route: '/embed/text',
    service: 'Embedding Service',
    durationMs: 234,
    spanCount: 7,
    status: 'ok',
    secondsAgo: 0,
  },
  {
    traceId: 'tr-b9e4d1',
    method: 'POST',
    route: '/embed/image',
    service: 'Embedding Service',
    durationMs: 1240,
    spanCount: 12,
    status: 'ok',
    secondsAgo: 3,
  },
  {
    traceId: 'tr-c0f5e8',
    method: 'POST',
    route: '/search/hybrid',
    service: 'Search Service',
    durationMs: 445,
    spanCount: 9,
    status: 'ok',
    secondsAgo: 6,
  },
  {
    traceId: 'tr-d1a6f9',
    method: 'GET',
    route: '/graph/query',
    service: 'Graph Engine',
    durationMs: 3200,
    spanCount: 15,
    status: 'error',
    secondsAgo: 10,
  },
  {
    traceId: 'tr-e2b7a0',
    method: 'POST',
    route: '/embed/batch',
    service: 'Embedding Service',
    durationMs: 8900,
    spanCount: 24,
    status: 'ok',
    secondsAgo: 23,
  },
  {
    traceId: 'tr-f3c8b1',
    method: 'POST',
    route: '/search/semantic',
    service: 'Search Service',
    durationMs: 189,
    spanCount: 5,
    status: 'ok',
    secondsAgo: 28,
  },
  {
    traceId: 'tr-g4d9c2',
    method: 'GET',
    route: '/graph/traverse',
    service: 'Graph Engine',
    durationMs: 567,
    spanCount: 8,
    status: 'ok',
    secondsAgo: 36,
  },
  {
    traceId: 'tr-h5e0d3',
    method: 'POST',
    route: '/embed/url',
    service: 'Embedding Service',
    durationMs: 4500,
    spanCount: 18,
    status: 'error',
    secondsAgo: 40,
  },
]

function buildRecentTraces(baseDate: Date): TraceSummary[] {
  return traceSeeds
    .map((seed) => ({
      id: seed.traceId,
      traceId: seed.traceId,
      method: seed.method,
      route: seed.route,
      service: seed.service,
      durationMs: seed.durationMs,
      spanCount: seed.spanCount,
      status: seed.status,
      timestamp: toIsoWithOffset(baseDate, -seed.secondsAgo * 1000),
    }))
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
    )
}

function toFractionMs(total: number, ratio: number) {
  return Math.max(0, Math.floor(total * ratio))
}

function clampSpanDuration(total: number, startMs: number, durationMs: number) {
  const clampedStart = Math.max(0, Math.min(startMs, total))
  const maxAllowedDuration = Math.max(1, total - clampedStart)
  const clampedDuration = Math.max(1, Math.min(durationMs, maxAllowedDuration))
  return {
    startMs: clampedStart,
    durationMs: clampedDuration,
  }
}

interface SpanDraft {
  name: string
  service: string
  status: 'ok' | 'error'
  category: TraceSpan['category']
  startMs: number
  durationMs: number
  depth?: number
}

function buildTraceSpans(trace: TraceSummary, seed: number): TraceSpansResponse {
  const random = createSeededRandom(hashString(`${seed}:${trace.traceId}:trace-spans`))
  const drafts: SpanDraft[] = [
    {
      name: 'API Gateway',
      service: 'API Gateway',
      status: trace.status,
      category: 'http',
      startMs: 0,
      durationMs: trace.durationMs,
      depth: 0,
    },
    {
      name: 'Auth Middleware',
      service: 'Auth Middleware',
      status: 'ok',
      category: 'middleware',
      startMs: toFractionMs(trace.durationMs, 0.01),
      durationMs: Math.max(2, toFractionMs(trace.durationMs, 0.04)),
      depth: 1,
    },
    {
      name: 'Rate Limiter',
      service: 'Rate Limiter',
      status: 'ok',
      category: 'middleware',
      startMs: toFractionMs(trace.durationMs, 0.03),
      durationMs: Math.max(2, toFractionMs(trace.durationMs, 0.02)),
      depth: 1,
    },
  ]

  if (trace.route.startsWith('/embed')) {
    drafts.push(
      {
        name: 'Tokenizer',
        service: 'Embedding Service',
        status: 'ok',
        category: 'model',
        startMs: toFractionMs(trace.durationMs, 0.08),
        durationMs: Math.max(4, toFractionMs(trace.durationMs, 0.08)),
        depth: 2,
      },
      {
        name: 'Model Inference',
        service: 'Embedding Service',
        status: trace.status === 'error' ? 'error' : 'ok',
        category: 'model',
        startMs: toFractionMs(trace.durationMs, 0.14),
        durationMs: Math.max(16, toFractionMs(trace.durationMs, 0.58)),
        depth: 2,
      },
      {
        name: 'Vector Store Write',
        service: 'Vector Store',
        status: trace.status === 'error' ? 'error' : 'ok',
        category: 'db',
        startMs: toFractionMs(trace.durationMs, 0.74),
        durationMs: Math.max(10, toFractionMs(trace.durationMs, 0.18)),
        depth: 2,
      },
      {
        name: 'Response Serialize',
        service: 'API Gateway',
        status: trace.status,
        category: 'serialize',
        startMs: toFractionMs(trace.durationMs, 0.93),
        durationMs: Math.max(3, toFractionMs(trace.durationMs, 0.05)),
        depth: 1,
      }
    )
  } else if (trace.route.startsWith('/search')) {
    drafts.push(
      {
        name: 'Query Planner',
        service: 'Search Service',
        status: 'ok',
        category: 'model',
        startMs: toFractionMs(trace.durationMs, 0.09),
        durationMs: Math.max(4, toFractionMs(trace.durationMs, 0.15)),
        depth: 2,
      },
      {
        name: 'BM25 Retrieval',
        service: 'Search Index',
        status: 'ok',
        category: 'db',
        startMs: toFractionMs(trace.durationMs, 0.23),
        durationMs: Math.max(8, toFractionMs(trace.durationMs, 0.34)),
        depth: 2,
      },
      {
        name: 'Vector Similarity Search',
        service: 'Vector Store',
        status: 'ok',
        category: 'db',
        startMs: toFractionMs(trace.durationMs, 0.43),
        durationMs: Math.max(8, toFractionMs(trace.durationMs, 0.3)),
        depth: 2,
      },
      {
        name: 'Rank Fusion',
        service: 'Search Service',
        status: 'ok',
        category: 'model',
        startMs: toFractionMs(trace.durationMs, 0.72),
        durationMs: Math.max(4, toFractionMs(trace.durationMs, 0.2)),
        depth: 2,
      }
    )
  } else {
    drafts.push(
      {
        name: 'Graph Resolver',
        service: 'Graph Engine',
        status: 'ok',
        category: 'other',
        startMs: toFractionMs(trace.durationMs, 0.12),
        durationMs: Math.max(8, toFractionMs(trace.durationMs, 0.28)),
        depth: 2,
      },
      {
        name: 'Node Traversal',
        service: 'Graph Store',
        status: trace.status === 'error' ? 'error' : 'ok',
        category: 'db',
        startMs: toFractionMs(trace.durationMs, 0.33),
        durationMs: Math.max(8, toFractionMs(trace.durationMs, 0.46)),
        depth: 2,
      },
      {
        name: 'Edge Projection',
        service: 'Graph Engine',
        status: trace.status === 'error' ? 'error' : 'ok',
        category: 'model',
        startMs: toFractionMs(trace.durationMs, 0.74),
        durationMs: Math.max(6, toFractionMs(trace.durationMs, 0.18)),
        depth: 2,
      }
    )
  }

  if (trace.status === 'error') {
    drafts.push({
      name: 'Upstream Timeout',
      service: trace.service,
      status: 'error',
      category: 'other',
      startMs: toFractionMs(trace.durationMs, 0.88),
      durationMs: Math.max(6, toFractionMs(trace.durationMs, 0.1)),
      depth: 2,
    })
  }

  const fillerCandidates: Array<Pick<SpanDraft, 'name' | 'service' | 'category'>> = [
    { name: 'Queue Dispatch', service: 'Queue Service', category: 'queue' },
    { name: 'Cache Lookup', service: 'Cache Service', category: 'cache' },
    { name: 'Policy Check', service: 'Policy Engine', category: 'other' },
    { name: 'Response Marshal', service: 'Gateway', category: 'serialize' },
  ]
  const defaultFillerCandidate: Pick<SpanDraft, 'name' | 'service' | 'category'> = {
    name: 'Queue Dispatch',
    service: 'Queue Service',
    category: 'queue',
  }

  while (drafts.length < trace.spanCount) {
    const candidate =
      fillerCandidates[Math.floor(random() * fillerCandidates.length)] ??
      defaultFillerCandidate
    const startRatio = 0.08 + random() * 0.82
    const durationRatio = 0.01 + random() * 0.09
    drafts.push({
      name: candidate.name,
      service: candidate.service,
      status: 'ok',
      category: candidate.category,
      startMs: toFractionMs(trace.durationMs, startRatio),
      durationMs: Math.max(2, toFractionMs(trace.durationMs, durationRatio)),
      depth: 2,
    })
  }

  const limitedDrafts = drafts.slice(0, trace.spanCount)
  const spans: TraceSpan[] = limitedDrafts
    .map((draft, index) => {
      const clamped = clampSpanDuration(trace.durationMs, draft.startMs, draft.durationMs)
      return {
        id: `${trace.traceId}-span-${String(index + 1).padStart(2, '0')}`,
        traceId: trace.traceId,
        name: draft.name,
        service: draft.service,
        status: draft.status,
        category: draft.category,
        startMs: clamped.startMs,
        durationMs: clamped.durationMs,
        depth: draft.depth ?? 0,
      }
    })
    .sort((left, right) => {
      if (left.startMs !== right.startMs) {
        return left.startMs - right.startMs
      }
      return right.durationMs - left.durationMs
    })

  return {
    traceId: trace.traceId,
    traceDurationMs: trace.durationMs,
    spans,
  }
}

function buildTraceSpansByTraceId(traces: TraceSummary[], seed: number) {
  return Object.fromEntries(
    traces.map((trace) => [trace.traceId, buildTraceSpans(trace, seed)])
  )
}

function buildGraphData(records: EmbeddingRecord[], groups: UserGroup[]): GraphData {
  const documentSeeds = buildDocumentSeeds().slice(0, 8)
  const topicNames = Array.from(new Set(documentSeeds.map((item) => item.topic)))

  const documentNodes: GraphNode[] = documentSeeds.map((document) => ({
    id: `doc-${document.slug}`,
    label: document.title,
    type: 'document',
    properties: {
      topic: document.topic,
      ownerGroup: document.ownerGroup,
      source: `knowledge/${document.slug}.md`,
      records: records.filter((record) => record.source?.includes(document.slug)).length,
    },
  }))

  const topicNodes: GraphNode[] = topicNames.map((topic) => ({
    id: `topic-${topic}`,
    label: topic
      .split('-')
      .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
      .join(' '),
    type: 'topic',
    properties: {
      documents: documentSeeds.filter((document) => document.topic === topic).length,
    },
  }))

  const ownerGroupIds = new Set(documentSeeds.map((document) => document.ownerGroup))
  const groupNodes: GraphNode[] = groups
    .filter((group) => ownerGroupIds.has(group.id))
    .map((group) => ({
      id: `group-${group.id}`,
      label: group.name,
      type: 'user-group',
      properties: {
        members: group.memberCount,
        permissions: group.permissions,
      },
    }))

  const topicEdges: GraphEdge[] = documentSeeds.map((document, index) => ({
    id: `edge-topic-${index + 1}`,
    source: `doc-${document.slug}`,
    target: `topic-${document.topic}`,
    type: 'contains',
    properties: {
      weight: round(0.65 + index * 0.03, 2),
    },
  }))

  const ownershipEdges: GraphEdge[] = documentSeeds.map((document, index) => ({
    id: `edge-owner-${index + 1}`,
    source: `group-${document.ownerGroup}`,
    target: `doc-${document.slug}`,
    type: 'owns',
    properties: {
      relationship: 'owner',
    },
  }))

  return {
    nodes: [...documentNodes, ...topicNodes, ...groupNodes],
    edges: [...topicEdges, ...ownershipEdges],
  }
}

function buildEmbeddingModels(): EmbeddingModel[] {
  return [
    {
      id: 'text-embedding-3-small',
      name: 'OpenAI Text Embedding 3 Small',
      dimensions: 1536,
      maxTokens: 8191,
      provider: 'OpenAI',
    },
    {
      id: 'text-embedding-3-large',
      name: 'OpenAI Text Embedding 3 Large',
      dimensions: 3072,
      maxTokens: 8191,
      provider: 'OpenAI',
    },
    {
      id: 'voyage-large-2',
      name: 'Voyage Large 2',
      dimensions: 1536,
      maxTokens: 16000,
      provider: 'Voyage AI',
    },
    {
      id: 'cohere-embed-v3',
      name: 'Cohere Embed v3',
      dimensions: 1024,
      maxTokens: 512,
      provider: 'Cohere',
    },
  ]
}

function buildImageEmbeddingModels(): ImageEmbeddingModel[] {
  return [
    {
      id: 'clip-vit-base-patch32',
      name: 'CLIP ViT-Base/32',
      dimensions: 512,
      maxResolution: 224,
      provider: 'OpenAI',
    },
    {
      id: 'clip-vit-large-patch14',
      name: 'CLIP ViT-Large/14',
      dimensions: 768,
      maxResolution: 336,
      provider: 'OpenAI',
    },
    {
      id: 'siglip-so400m',
      name: 'SigLIP SO400M',
      dimensions: 1152,
      maxResolution: 384,
      provider: 'Google',
    },
  ]
}

function buildCompletedSeedResult(
  seed: number,
  dimensions: number,
  model: string,
  baseDate: Date,
  sourceKey: string,
  chunks: string[],
  totalChunks: number,
  offsetMinutes: number
) {
  const results = chunks.map((chunk, index) => ({
    id: `${sourceKey}-result-${index + 1}`,
    text: chunk.slice(0, 220),
    vector: toVector(dimensions, `${sourceKey}:chunk-${index + 1}`, seed),
    model,
    tokenCount: Math.max(1, Math.ceil(chunk.length / 4)),
    chunkIndex: index,
    totalChunks,
    createdAt: toIsoWithOffset(baseDate, -(offsetMinutes - index) * MINUTE_MS),
  }))

  const totalTokens = results.reduce((sum, result) => sum + result.tokenCount, 0)

  return {
    results,
    totalTokens,
    processingTime: 320 + totalChunks * 22,
  }
}

function buildSeedTextEmbeddingQueue(
  baseDate: Date,
  seed: number
): {
  jobs: TextEmbeddingJobDetail[]
  polls: Record<string, number>
} {
  const queuedUrl = 'https://docs.acme.ai/guides/hybrid-retrieval'
  const processingUrl = 'https://status.embedding.dev/postmortems/worker-latency'
  const completedUrl = 'https://vercel.com/docs/agents/rules'

  const completedTextChunks = [
    'Retrieval quality checklist: normalize source metadata, preserve hierarchy, and monitor recall drift.',
    'Use deterministic chunking settings and preserve source identifiers for downstream traceability.',
  ]
  const completedUrlChunks = [
    'Agent guardrails should prioritize safety, deterministic execution, and transparent error reporting.',
    'Rules should be auditable and easy to diff during pull request review.',
  ]

  const queuedJob: TextEmbeddingJobDetail = {
    id: 'job-queue-url-001',
    status: 'queued',
    sourceType: 'url',
    sourcePreview: queuedUrl,
    sourceUrl: queuedUrl,
    model: 'text-embedding-3-small',
    dimensions: 1536,
    progress: {
      completedChunks: 0,
      totalChunks: 6,
      failedChunks: 0,
    },
    queuedAt: toIsoWithOffset(baseDate, -2 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -1 * MINUTE_MS),
    request: {
      source: {
        type: 'url',
        url: queuedUrl,
        extractionMode: 'main-content',
        maxChars: 20_000,
      },
      mode: 'simple',
    },
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-queue-url-001',
      attemptCount: 1,
    },
  }

  const processingTextJob: TextEmbeddingJobDetail = {
    id: 'job-processing-text-001',
    status: 'processing',
    sourceType: 'text',
    sourcePreview:
      'Quarterly search relevance review with multilingual policy snippets and retrieval diagnostics.',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    progress: {
      completedChunks: 2,
      totalChunks: 3,
      failedChunks: 0,
    },
    usage: {
      inputTokens: 980,
      totalTokens: 720,
    },
    queuedAt: toIsoWithOffset(baseDate, -10 * MINUTE_MS),
    startedAt: toIsoWithOffset(baseDate, -9 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -20 * 1000),
    request: {
      source: {
        type: 'text',
        text:
          'Quarterly search relevance review with multilingual policy snippets and retrieval diagnostics.',
      },
      mode: 'technical',
      options: {
        model: 'text-embedding-3-small',
        chunkSize: 700,
        chunkOverlap: 80,
        batchSize: 8,
        metadata: {
          source: 'review-doc',
          locale: 'en-US',
        },
      },
    },
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-processing-text-001',
      attemptCount: 1,
    },
  }

  const processingUrlJob: TextEmbeddingJobDetail = {
    id: 'job-processing-url-001',
    status: 'processing',
    sourceType: 'url',
    sourcePreview: processingUrl,
    sourceUrl: processingUrl,
    model: 'voyage-large-2',
    dimensions: 1536,
    progress: {
      completedChunks: 3,
      totalChunks: 9,
      failedChunks: 0,
    },
    usage: {
      inputTokens: 2240,
      totalTokens: 1010,
    },
    queuedAt: toIsoWithOffset(baseDate, -7 * MINUTE_MS),
    startedAt: toIsoWithOffset(baseDate, -6 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -45 * 1000),
    request: {
      source: {
        type: 'url',
        url: processingUrl,
        extractionMode: 'full-content',
        maxChars: 32_000,
      },
      mode: 'technical',
      options: {
        model: 'voyage-large-2',
        chunkSize: 900,
        chunkOverlap: 90,
        batchSize: 6,
        metadata: {
          source: 'incident-postmortem',
        },
      },
    },
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-processing-url-001',
      attemptCount: 1,
    },
  }

  const completedTextJob: TextEmbeddingJobDetail = {
    id: 'job-completed-text-001',
    status: 'completed',
    sourceType: 'text',
    sourcePreview:
      'Playbook for index freshness: ingestion SLAs, chunk drift alarms, and rollout checkpoints.',
    model: 'text-embedding-3-large',
    dimensions: 3072,
    progress: {
      completedChunks: 5,
      totalChunks: 5,
      failedChunks: 0,
    },
    usage: {
      inputTokens: 1330,
      totalTokens: 1330,
    },
    queuedAt: toIsoWithOffset(baseDate, -25 * MINUTE_MS),
    startedAt: toIsoWithOffset(baseDate, -24 * MINUTE_MS),
    completedAt: toIsoWithOffset(baseDate, -22 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -22 * MINUTE_MS),
    request: {
      source: {
        type: 'text',
        text:
          'Playbook for index freshness: ingestion SLAs, chunk drift alarms, and rollout checkpoints.',
      },
      mode: 'technical',
      options: {
        model: 'text-embedding-3-large',
        chunkSize: 800,
        chunkOverlap: 80,
        batchSize: 10,
      },
    },
    result: buildCompletedSeedResult(
      seed,
      3072,
      'text-embedding-3-large',
      baseDate,
      'job-completed-text-001',
      completedTextChunks,
      5,
      22
    ),
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-completed-text-001',
      attemptCount: 1,
    },
  }

  const completedUrlJob: TextEmbeddingJobDetail = {
    id: 'job-completed-url-001',
    status: 'completed',
    sourceType: 'url',
    sourcePreview: completedUrl,
    sourceUrl: completedUrl,
    model: 'text-embedding-3-small',
    dimensions: 1536,
    progress: {
      completedChunks: 8,
      totalChunks: 8,
      failedChunks: 0,
    },
    usage: {
      inputTokens: 1042,
      totalTokens: 1042,
    },
    queuedAt: toIsoWithOffset(baseDate, -40 * MINUTE_MS),
    startedAt: toIsoWithOffset(baseDate, -39 * MINUTE_MS),
    completedAt: toIsoWithOffset(baseDate, -35 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -35 * MINUTE_MS),
    request: {
      source: {
        type: 'url',
        url: completedUrl,
        extractionMode: 'main-content',
        maxChars: 18_000,
      },
      mode: 'simple',
      options: {
        model: 'text-embedding-3-small',
      },
    },
    result: buildCompletedSeedResult(
      seed,
      1536,
      'text-embedding-3-small',
      baseDate,
      'job-completed-url-001',
      completedUrlChunks,
      8,
      35
    ),
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-completed-url-001',
      attemptCount: 1,
    },
  }

  const failedTextJob: TextEmbeddingJobDetail = {
    id: 'job-failed-text-001',
    status: 'failed',
    sourceType: 'text',
    sourcePreview:
      'Compliance export notes with malformed YAML frontmatter and unresolved include directives.',
    model: 'cohere-embed-v3',
    dimensions: 1024,
    progress: {
      completedChunks: 2,
      totalChunks: 6,
      failedChunks: 1,
    },
    usage: {
      inputTokens: 860,
      totalTokens: 298,
    },
    queuedAt: toIsoWithOffset(baseDate, -18 * MINUTE_MS),
    startedAt: toIsoWithOffset(baseDate, -17 * MINUTE_MS),
    failedAt: toIsoWithOffset(baseDate, -16 * MINUTE_MS),
    updatedAt: toIsoWithOffset(baseDate, -16 * MINUTE_MS),
    error: {
      code: 'EMBED_WORKER_ERROR',
      message: 'Embedding worker failed during chunk processing.',
      retryable: true,
    },
    request: {
      source: {
        type: 'text',
        text:
          'Compliance export notes with malformed YAML frontmatter and unresolved include directives.',
      },
      mode: 'technical',
      options: {
        model: 'cohere-embed-v3',
        chunkSize: 700,
        chunkOverlap: 70,
        batchSize: 4,
        metadata: {
          forceFail: true,
          source: 'compliance-export',
        },
      },
    },
    backend: {
      provider: 'aws-ecs',
      taskId: 'task-failed-text-001',
      attemptCount: 2,
    },
  }

  return {
    jobs: [
      queuedJob,
      processingTextJob,
      processingUrlJob,
      completedTextJob,
      completedUrlJob,
      failedTextJob,
    ],
    polls: {
      [queuedJob.id]: 0,
      [processingTextJob.id]: 1,
      [processingUrlJob.id]: 1,
      [completedTextJob.id]: 0,
      [completedUrlJob.id]: 0,
      [failedTextJob.id]: 0,
    },
  }
}

function buildAccountSnapshot(baseDate: Date, context: DemoContext): AccountSnapshot {
  const workspaces: WorkspaceSummary[] = [
    {
      id: context.workspaceId,
      name: context.workspaceName,
      slug: 'embedding-lab',
      plan: 'pro',
      role: 'owner',
      createdAt: toIsoWithOffset(baseDate, -340 * DAY_MS),
      updatedAt: toIsoWithOffset(baseDate, -1 * DAY_MS),
    },
    {
      id: 'ws-search-ops',
      name: 'Search Ops',
      slug: 'search-ops',
      plan: 'enterprise',
      role: 'admin',
      createdAt: toIsoWithOffset(baseDate, -280 * DAY_MS),
      updatedAt: toIsoWithOffset(baseDate, -3 * DAY_MS),
    },
    {
      id: 'ws-observability',
      name: 'Observability',
      slug: 'observability',
      plan: 'pro',
      role: 'member',
      createdAt: toIsoWithOffset(baseDate, -220 * DAY_MS),
      updatedAt: toIsoWithOffset(baseDate, -4 * DAY_MS),
    },
  ]

  const user: AccountUser = {
    id: 'account-user-1',
    name: 'Avery Chen',
    email: 'avery@embedding.dev',
    avatarUrl: '',
    authProvider: 'mock',
    authUserId: 'mock-user-1',
    createdAt: toIsoWithOffset(baseDate, -360 * DAY_MS),
    updatedAt: toIsoWithOffset(baseDate, -2 * HOUR_MS),
  }

  return {
    user,
    workspaces,
    activeWorkspaceId: workspaces[0]?.id ?? context.workspaceId,
  }
}

export function createDemoDataset(
  seed: number = DEMO_DEFAULT_SEED,
  now: string = DEMO_DEFAULT_NOW
): DemoScenario {
  const baseDate = new Date(now)
  const context: DemoContext = {
    seed,
    now: baseDate.toISOString(),
    workspaceId: 'ws-main',
    workspaceName: 'Embedding Lab',
  }

  const users = buildDashboardUsers(baseDate)
  const userGroups = buildUserGroups(baseDate)
  const permissionMatrix = buildPermissionMatrix()
  const records = buildRecords(baseDate, context)
  const searchResults = buildSearchResults(records, context)
  const trends = buildTrends(baseDate, seed)
  const hourlyTrends = buildHourlyTrends(baseDate, seed)
  const searchAnalytics = buildSearchAnalytics(baseDate, seed)
  const topHits = buildTopHits(records)
  const topUsers = buildTopUsers(users, baseDate)
  const metricCards = buildMetricCards(records, trends, searchAnalytics)
  const metricsOverview: MetricsOverview = {
    cards: metricCards,
    topHits,
    topUsers,
    trends,
    hourlyTrends,
    searchAnalytics,
  }
  const latencyResponse = buildLatencyResponse(baseDate, seed)
  const healthCheck: HealthCheck = {
    status: 'healthy',
    uptime: Math.floor((95 * DAY_MS) / 1000),
    version: '1.3.0-demo',
    timestamp: context.now,
  }
  const serviceUsage = buildServiceUsage()
  const errorLogs = buildErrorLogs(baseDate, searchAnalytics, seed)
  const recentTraces = buildRecentTraces(baseDate)
  const traceSpansByTraceId = buildTraceSpansByTraceId(recentTraces, seed)
  const graphData = buildGraphData(records, userGroups)
  const textEmbeddingModels = buildEmbeddingModels()
  const textEmbeddingQueue = buildSeedTextEmbeddingQueue(baseDate, seed)
  const imageEmbeddingModels = buildImageEmbeddingModels()
  const accountSnapshot = buildAccountSnapshot(baseDate, context)

  return {
    context,
    accountSnapshot,
    users,
    userGroups,
    permissionMatrix,
    records,
    graphData,
    searchResults,
    metricsOverview,
    healthCheck,
    latencyResponse,
    serviceUsage,
    errorLogs,
    recentTraces,
    traceSpansByTraceId,
    textEmbeddingModels,
    textEmbeddingJobs: textEmbeddingQueue.jobs,
    textEmbeddingJobPolls: textEmbeddingQueue.polls,
    imageEmbeddingModels,
  }
}

let demoScenarioState = createDemoDataset()

export function getDemoScenarioState() {
  return demoScenarioState
}

export function replaceDemoScenarioState(nextState: DemoScenario) {
  demoScenarioState = cloneValue(nextState)
}

export function resetDemoScenario(
  seed: number = DEMO_DEFAULT_SEED,
  now: string = DEMO_DEFAULT_NOW
) {
  demoScenarioState = createDemoDataset(seed, now)
}

export function cloneDemoValue<T>(value: T) {
  return cloneValue(value)
}

export function buildDemoVector(length: number, key: string) {
  return toVector(length, key, demoScenarioState.context.seed)
}

export function nextDemoTimestamp(offsetMinutes = 0) {
  const base = new Date(demoScenarioState.context.now)
  return toIsoWithOffset(base, offsetMinutes * MINUTE_MS)
}

export function buildDemoDisplayName(email: string) {
  return titleFromEmail(email)
}
