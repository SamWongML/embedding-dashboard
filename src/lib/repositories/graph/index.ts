import type {
  CreateEdgeRequest,
  GraphData,
  GraphEdge,
  GraphFilters,
  NodeDetail,
} from '@/lib/schemas/graph'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  createEdge,
  deleteEdge,
  fetchGraphData,
  fetchNodeDetail,
} from '@/lib/repositories/graph/api'
import {
  createDemoEdge,
  deleteDemoEdge,
  getDemoGraphData,
  getDemoNodeDetail,
} from '@/mocks'

export interface GraphRepository {
  getGraphData: (filters?: GraphFilters) => Promise<GraphData>
  getNodeDetail: (nodeId: string) => Promise<NodeDetail | null>
  createEdge: (request: CreateEdgeRequest) => Promise<GraphEdge>
  deleteEdge: (edgeId: string) => Promise<void>
}

const apiRepository: GraphRepository = {
  getGraphData: (filters) => fetchGraphData(filters),
  getNodeDetail: async (nodeId) => fetchNodeDetail(nodeId),
  createEdge: (request) => createEdge(request),
  deleteEdge: (edgeId) => deleteEdge(edgeId),
}

const demoRepository: GraphRepository = {
  getGraphData: async () => getDemoGraphData(),
  getNodeDetail: async (nodeId) => getDemoNodeDetail(nodeId),
  createEdge: async (request) => createDemoEdge(request),
  deleteEdge: async (edgeId) => deleteDemoEdge(edgeId),
}

export function getGraphRepository(mode: DataMode = getDataMode()): GraphRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
