'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import type {
  CreateEdgeRequest,
  GraphData,
  GraphFilters,
  NodeDetail,
} from '@/lib/schemas/graph'
import { getGraphRepository } from '@/lib/repositories/graph'

const graphRepository = getGraphRepository()

export function useGraphData(filters?: GraphFilters) {
  return useQuery<GraphData>({
    queryKey: queryKeys.graph.nodes(filters),
    queryFn: () => graphRepository.getGraphData(filters),
  })
}

export function useNodeDetail(nodeId: string | null) {
  return useQuery<NodeDetail | null>({
    queryKey: queryKeys.graph.node(nodeId || ''),
    queryFn: () => graphRepository.getNodeDetail(nodeId || ''),
    enabled: !!nodeId,
  })
}

export function useCreateEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateEdgeRequest) => graphRepository.createEdge(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}

export function useDeleteEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (edgeId: string) => graphRepository.deleteEdge(edgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all })
    },
  })
}
