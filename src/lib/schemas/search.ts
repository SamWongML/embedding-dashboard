import * as z from 'zod'

export const searchFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'in']),
  value: z.unknown(),
})

export const searchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  vectorWeight: z.number().min(0).max(1).optional(),
  bm25Weight: z.number().min(0).max(1).optional(),
  graphWeight: z.number().min(0).max(1).optional(),
  filters: z.array(searchFilterSchema).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const searchResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  score: z.number(),
  vectorScore: z.number().optional(),
  bm25Score: z.number().optional(),
  graphScore: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  highlights: z.array(z.string()).optional(),
  source: z.string().optional(),
  createdAt: z.string(),
})

export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  totalCount: z.number(),
  took: z.number(),
  query: z.string(),
})

export type SearchFilter = z.infer<typeof searchFilterSchema>
export type SearchRequest = z.infer<typeof searchRequestSchema>
export type SearchResult = z.infer<typeof searchResultSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>
