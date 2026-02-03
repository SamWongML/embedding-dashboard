import * as z from 'zod'

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.unknown()),
  x: z.number().optional(),
  y: z.number().optional(),
})

export const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
})

export const graphDataSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
})

export const graphFiltersSchema = z.object({
  nodeTypes: z.array(z.string()).optional(),
  depth: z.number().min(1).max(5).optional(),
  limit: z.number().min(10).max(500).optional(),
  centerId: z.string().optional(),
})

export const nodeDetailSchema = z.object({
  node: graphNodeSchema,
  incomingEdges: z.array(graphEdgeSchema),
  outgoingEdges: z.array(graphEdgeSchema),
  relatedNodes: z.array(graphNodeSchema),
})

export const createEdgeRequestSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
})

export type GraphNode = z.infer<typeof graphNodeSchema>
export type GraphEdge = z.infer<typeof graphEdgeSchema>
export type GraphData = z.infer<typeof graphDataSchema>
export type GraphFilters = z.infer<typeof graphFiltersSchema>
export type NodeDetail = z.infer<typeof nodeDetailSchema>
export type CreateEdgeRequest = z.infer<typeof createEdgeRequestSchema>
