import type {
  CreateEdgeRequest,
  GraphData,
  GraphEdge,
  GraphNode,
  NodeDetail,
} from "@/lib/schemas/graph"

const mockNodes: GraphNode[] = [
  { id: "doc-1", label: "Product Documentation", type: "document", properties: { source: "confluence", pages: 45 } },
  { id: "doc-2", label: "API Reference", type: "document", properties: { source: "swagger", endpoints: 120 } },
  { id: "doc-3", label: "User Guide", type: "document", properties: { source: "notion", chapters: 12 } },
  { id: "topic-1", label: "Authentication", type: "topic", properties: { articles: 8 } },
  { id: "topic-2", label: "Embeddings", type: "topic", properties: { articles: 15 } },
  { id: "topic-3", label: "Search", type: "topic", properties: { articles: 10 } },
  { id: "user-1", label: "Engineering Team", type: "user-group", properties: { members: 25 } },
  { id: "user-2", label: "Product Team", type: "user-group", properties: { members: 12 } },
]

const mockEdges: GraphEdge[] = [
  { id: "e1", source: "doc-1", target: "topic-1", type: "contains", properties: { weight: 0.8 } },
  { id: "e2", source: "doc-1", target: "topic-2", type: "contains", properties: { weight: 0.9 } },
  { id: "e3", source: "doc-2", target: "topic-1", type: "references", properties: { weight: 0.7 } },
  { id: "e4", source: "doc-2", target: "topic-2", type: "references", properties: { weight: 0.95 } },
  { id: "e5", source: "doc-2", target: "topic-3", type: "references", properties: { weight: 0.85 } },
  { id: "e6", source: "doc-3", target: "topic-2", type: "explains", properties: { weight: 0.75 } },
  { id: "e7", source: "doc-3", target: "topic-3", type: "explains", properties: { weight: 0.8 } },
  { id: "e8", source: "user-1", target: "doc-1", type: "owns", properties: {} },
  { id: "e9", source: "user-1", target: "doc-2", type: "owns", properties: {} },
  { id: "e10", source: "user-2", target: "doc-3", type: "owns", properties: {} },
]

export function getMockGraphData(): GraphData {
  return {
    nodes: mockNodes,
    edges: mockEdges,
  }
}

export function getMockNodeDetail(nodeId: string): NodeDetail | null {
  const node = mockNodes.find((item) => item.id === nodeId)
  if (!node) {
    return null
  }

  const incomingEdges = mockEdges.filter((edge) => edge.target === nodeId)
  const outgoingEdges = mockEdges.filter((edge) => edge.source === nodeId)
  const relatedNodeIds = new Set([
    ...incomingEdges.map((edge) => edge.source),
    ...outgoingEdges.map((edge) => edge.target),
  ])
  const relatedNodes = mockNodes.filter((item) => relatedNodeIds.has(item.id))

  return { node, incomingEdges, outgoingEdges, relatedNodes }
}

export function createMockEdge(request: CreateEdgeRequest): GraphEdge {
  return {
    id: crypto.randomUUID(),
    source: request.sourceId,
    target: request.targetId,
    type: request.type,
    properties: request.properties,
  }
}
