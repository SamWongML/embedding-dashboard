'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type GraphData,
  type GraphNode,
  type GraphEdge,
  type GraphFilters,
  type NodeDetail,
  type CreateEdgeRequest,
} from '@/lib/schemas/graph'

// Mock data for development
const mockNodes: GraphNode[] = [
  { id: 'doc-1', label: 'Product Documentation', type: 'document', properties: { source: 'confluence', pages: 45 } },
  { id: 'doc-2', label: 'API Reference', type: 'document', properties: { source: 'swagger', endpoints: 120 } },
  { id: 'doc-3', label: 'User Guide', type: 'document', properties: { source: 'notion', chapters: 12 } },
  { id: 'topic-1', label: 'Authentication', type: 'topic', properties: { articles: 8 } },
  { id: 'topic-2', label: 'Embeddings', type: 'topic', properties: { articles: 15 } },
  { id: 'topic-3', label: 'Search', type: 'topic', properties: { articles: 10 } },
  { id: 'user-1', label: 'Engineering Team', type: 'user-group', properties: { members: 25 } },
  { id: 'user-2', label: 'Product Team', type: 'user-group', properties: { members: 12 } },
]

const mockEdges: GraphEdge[] = [
  { id: 'e1', source: 'doc-1', target: 'topic-1', type: 'contains', properties: { weight: 0.8 } },
  { id: 'e2', source: 'doc-1', target: 'topic-2', type: 'contains', properties: { weight: 0.9 } },
  { id: 'e3', source: 'doc-2', target: 'topic-1', type: 'references', properties: { weight: 0.7 } },
  { id: 'e4', source: 'doc-2', target: 'topic-2', type: 'references', properties: { weight: 0.95 } },
  { id: 'e5', source: 'doc-2', target: 'topic-3', type: 'references', properties: { weight: 0.85 } },
  { id: 'e6', source: 'doc-3', target: 'topic-2', type: 'explains', properties: { weight: 0.75 } },
  { id: 'e7', source: 'doc-3', target: 'topic-3', type: 'explains', properties: { weight: 0.8 } },
  { id: 'e8', source: 'user-1', target: 'doc-1', type: 'owns', properties: {} },
  { id: 'e9', source: 'user-1', target: 'doc-2', type: 'owns', properties: {} },
  { id: 'e10', source: 'user-2', target: 'doc-3', type: 'owns', properties: {} },
]

export function useGraphData(filters?: GraphFilters) {
  return useQuery({
    queryKey: queryKeys.graph.nodes(filters),
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams()
        if (filters?.nodeTypes) queryParams.append('nodeTypes', filters.nodeTypes.join(','))
        if (filters?.depth) queryParams.append('depth', String(filters.depth))
        if (filters?.limit) queryParams.append('limit', String(filters.limit))
        if (filters?.centerId) queryParams.append('centerId', filters.centerId)

        return await api.get<GraphData>(`/graph?${queryParams}`)
      } catch {
        return { nodes: mockNodes, edges: mockEdges }
      }
    },
  })
}

export function useNodeDetail(nodeId: string | null) {
  return useQuery({
    queryKey: queryKeys.graph.node(nodeId || ''),
    queryFn: async () => {
      if (!nodeId) return null
      try {
        return await api.get<NodeDetail>(`/graph/nodes/${nodeId}`)
      } catch {
        const node = mockNodes.find(n => n.id === nodeId)
        if (!node) return null

        const incomingEdges = mockEdges.filter(e => e.target === nodeId)
        const outgoingEdges = mockEdges.filter(e => e.source === nodeId)
        const relatedNodeIds = new Set([
          ...incomingEdges.map(e => e.source),
          ...outgoingEdges.map(e => e.target),
        ])
        const relatedNodes = mockNodes.filter(n => relatedNodeIds.has(n.id))

        return { node, incomingEdges, outgoingEdges, relatedNodes }
      }
    },
    enabled: !!nodeId,
  })
}

export function useCreateEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateEdgeRequest) => {
      try {
        return await api.post<GraphEdge>('/graph/edges', request)
      } catch {
        return {
          id: crypto.randomUUID(),
          source: request.sourceId,
          target: request.targetId,
          type: request.type,
          properties: request.properties,
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}

export function useDeleteEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (edgeId: string) => {
      try {
        await api.delete(`/graph/edges/${edgeId}`)
      } catch {
        // Mock success
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}
