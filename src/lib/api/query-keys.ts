export const queryKeys = {
  // Server Status
  serverStatus: {
    all: ['server-status'] as const,
    health: () => [...queryKeys.serverStatus.all, 'health'] as const,
    latency: () => [...queryKeys.serverStatus.all, 'latency'] as const,
    errors: () => [...queryKeys.serverStatus.all, 'errors'] as const,
    services: () => [...queryKeys.serverStatus.all, 'services'] as const,
  },

  // Metrics
  metrics: {
    all: ['metrics'] as const,
    overview: (period: string) => [...queryKeys.metrics.all, 'overview', period] as const,
    topHits: (period: string) => [...queryKeys.metrics.all, 'top-hits', period] as const,
    topUsers: (period: string) => [...queryKeys.metrics.all, 'top-users', period] as const,
    trends: (period: string) => [...queryKeys.metrics.all, 'trends', period] as const,
    searchAnalytics: (period: string) => [...queryKeys.metrics.all, 'search-analytics', period] as const,
  },

  // Text Embedding
  textEmbedding: {
    all: ['text-embedding'] as const,
    models: () => [...queryKeys.textEmbedding.all, 'models'] as const,
    result: (id: string) => [...queryKeys.textEmbedding.all, 'result', id] as const,
  },

  // Image Embedding
  imageEmbedding: {
    all: ['image-embedding'] as const,
    models: () => [...queryKeys.imageEmbedding.all, 'models'] as const,
    result: (id: string) => [...queryKeys.imageEmbedding.all, 'result', id] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    results: (query: string, filters?: object | null) => [...queryKeys.search.all, 'results', query, filters] as const,
  },

  // Records
  records: {
    all: ['records'] as const,
    list: (params: object) => [...queryKeys.records.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.records.all, 'detail', id] as const,
  },

  // Graph
  graph: {
    all: ['graph'] as const,
    nodes: (filters?: object) => [...queryKeys.graph.all, 'nodes', filters] as const,
    node: (id: string) => [...queryKeys.graph.all, 'node', id] as const,
    edges: (nodeId: string) => [...queryKeys.graph.all, 'edges', nodeId] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    groups: () => [...queryKeys.users.all, 'groups'] as const,
    permissions: () => [...queryKeys.users.all, 'permissions'] as const,
  },
}
