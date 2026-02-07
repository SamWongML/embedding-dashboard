import { api } from "@/lib/api"
import type {
  CreateEdgeRequest,
  GraphData,
  GraphEdge,
  GraphFilters,
  NodeDetail,
} from "@/lib/schemas/graph"
import {
  graphDataSchema,
  graphEdgeSchema,
  nodeDetailSchema,
} from "@/lib/schemas/graph"

export async function fetchGraphData(filters?: GraphFilters): Promise<GraphData> {
  const queryParams = new URLSearchParams()
  if (filters?.nodeTypes) queryParams.append("nodeTypes", filters.nodeTypes.join(","))
  if (filters?.depth) queryParams.append("depth", String(filters.depth))
  if (filters?.limit) queryParams.append("limit", String(filters.limit))
  if (filters?.centerId) queryParams.append("centerId", filters.centerId)

  return api.get<GraphData>(`/graph?${queryParams}`, graphDataSchema)
}

export async function fetchNodeDetail(nodeId: string): Promise<NodeDetail> {
  return api.get<NodeDetail>(`/graph/nodes/${nodeId}`, nodeDetailSchema)
}

export async function createEdge(request: CreateEdgeRequest): Promise<GraphEdge> {
  return api.post<GraphEdge>("/graph/edges", request, graphEdgeSchema)
}

export async function deleteEdge(edgeId: string): Promise<void> {
  await api.delete(`/graph/edges/${edgeId}`)
}
