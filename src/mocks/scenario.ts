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
} from '@/lib/schemas/server-status'
import type {
  EmbeddingModel,
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

const MINUTE_MS = 60_000
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
  textEmbeddingModels: EmbeddingModel[]
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

function buildSearchAnalytics(baseDate: Date, seed: number): SearchAnalytics[] {
  const random = createSeededRandom(seed + 58)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return Array.from({ length: 168 }, (_, index) => {
    const currentDate = new Date(baseDate.getTime() - (167 - index) * HOUR_MS)
    const hour = currentDate.getUTCHours()
    const day = dayLabels[currentDate.getUTCDay()] ?? 'Sun'
    const rushHour = hour >= 14 && hour <= 19 ? 1.22 : 0.88

    return {
      hour,
      day,
      count: Math.floor((120 + random() * 360) * rushHour),
    }
  })
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
  const averageLatency = 43
  const activeUsers = 347

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
      label: 'Avg Latency',
      value: averageLatency,
      change: 0.3,
      changeType: 'neutral',
      sparkline: [47, 45, 42, 44, 43, 42, 43],
    },
    {
      label: 'Active Users',
      value: activeUsers,
      change: 7.6,
      changeType: 'increase',
      sparkline: [301, 309, 317, 328, 334, 341, activeUsers],
    },
  ]
}

function buildLatencyResponse(baseDate: Date, seed: number): LatencyResponse {
  const random = createSeededRandom(seed + 77)
  const history: LatencyDataPoint[] = Array.from({ length: 60 }, (_, index) => {
    const timestamp = toIsoWithOffset(baseDate, -(59 - index) * MINUTE_MS)
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

function buildErrorLogs(baseDate: Date): ErrorLog[] {
  return [
    {
      id: 'error-1',
      timestamp: toIsoWithOffset(baseDate, -13 * MINUTE_MS),
      level: 'warning',
      message: 'Spike in retrieval latency for /api/search (p95 exceeded 95ms).',
      source: 'search-gateway',
    },
    {
      id: 'error-2',
      timestamp: toIsoWithOffset(baseDate, -52 * MINUTE_MS),
      level: 'error',
      message: 'Embedding worker restarted after temporary model timeout.',
      source: 'embedding-worker',
    },
    {
      id: 'error-3',
      timestamp: toIsoWithOffset(baseDate, -95 * MINUTE_MS),
      level: 'info',
      message: 'Rate limiter adjusted for product workspace import job.',
      source: 'rate-limiter',
    },
  ]
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
  const searchAnalytics = buildSearchAnalytics(baseDate, seed)
  const topHits = buildTopHits(records)
  const topUsers = buildTopUsers(users, baseDate)
  const metricCards = buildMetricCards(records, trends, searchAnalytics)
  const metricsOverview: MetricsOverview = {
    cards: metricCards,
    topHits,
    topUsers,
    trends,
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
  const errorLogs = buildErrorLogs(baseDate)
  const graphData = buildGraphData(records, userGroups)
  const textEmbeddingModels = buildEmbeddingModels()
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
    textEmbeddingModels,
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
