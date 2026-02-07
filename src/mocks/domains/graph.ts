import type {
  CreateEdgeRequest,
  GraphData,
  GraphEdge,
  NodeDetail,
} from '@/lib/schemas/graph'
import {
  cloneDemoValue,
  getDemoScenarioState,
} from '@/mocks/scenario'

function graphState() {
  return getDemoScenarioState().graphData
}

export function getDemoGraphData(): GraphData {
  return cloneDemoValue(graphState())
}

export function getDemoNodeDetail(nodeId: string): NodeDetail | null {
  const graph = graphState()
  const node = graph.nodes.find((entry) => entry.id === nodeId)
  if (!node) {
    return null
  }

  const incomingEdges = graph.edges.filter((edge) => edge.target === nodeId)
  const outgoingEdges = graph.edges.filter((edge) => edge.source === nodeId)
  const relatedNodeIds = new Set([
    ...incomingEdges.map((edge) => edge.source),
    ...outgoingEdges.map((edge) => edge.target),
  ])
  const relatedNodes = graph.nodes.filter((entry) => relatedNodeIds.has(entry.id))

  return cloneDemoValue({
    node,
    incomingEdges,
    outgoingEdges,
    relatedNodes,
  })
}

export function createDemoEdge(request: CreateEdgeRequest): GraphEdge {
  const nextEdge: GraphEdge = {
    id: crypto.randomUUID(),
    source: request.sourceId,
    target: request.targetId,
    type: request.type,
    properties: request.properties,
  }

  graphState().edges.push(nextEdge)
  return cloneDemoValue(nextEdge)
}

export function deleteDemoEdge(edgeId: string): void {
  const edges = graphState().edges
  const index = edges.findIndex((edge) => edge.id === edgeId)
  if (index >= 0) {
    edges.splice(index, 1)
  }
}
