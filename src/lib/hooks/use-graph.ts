'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiState } from '@/lib/api'
import { queryKeys, resolveApiState } from '@/lib/api'
import type {
  CreateEdgeRequest,
  GraphData,
  GraphEdge,
  GraphFilters,
  NodeDetail,
} from '@/lib/schemas/graph'
import {
  createEdge,
  deleteEdge,
  fetchGraphData,
  fetchNodeDetail,
} from '@/lib/repositories/graph/api'
import {
  createMockEdge,
  getMockGraphData,
  getMockNodeDetail,
} from '@/lib/repositories/graph/mock'

export function useGraphData(filters?: GraphFilters) {
  return useQuery<ApiState<GraphData>>({
    queryKey: queryKeys.graph.nodes(filters),
    queryFn: () => resolveApiState(
      () => fetchGraphData(filters),
      getMockGraphData
    ),
  })
}

export function useNodeDetail(nodeId: string | null) {
  return useQuery<ApiState<NodeDetail | null>>({
    queryKey: queryKeys.graph.node(nodeId || ''),
    queryFn: async () => {
      if (!nodeId) {
        return {
          data: null,
          error: null,
          source: 'api',
        }
      }

      return resolveApiState(
        () => fetchNodeDetail(nodeId),
        () => getMockNodeDetail(nodeId)
      )
    },
    enabled: !!nodeId,
  })
}

export function useCreateEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateEdgeRequest) => resolveApiState<GraphEdge>(
      () => createEdge(request),
      () => createMockEdge(request)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}

export function useDeleteEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (edgeId: string) => resolveApiState(
      () => deleteEdge(edgeId),
      () => undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}
