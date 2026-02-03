import * as z from 'zod'

export const embeddingRecordSchema = z.object({
  id: z.string(),
  content: z.string(),
  contentType: z.enum(['text', 'image']),
  vector: z.array(z.number()).optional(),
  vectorDimensions: z.number(),
  model: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  source: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const recordsListParamsSchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(10).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  contentType: z.enum(['text', 'image', 'all']).optional(),
})

export const recordsListResponseSchema = z.object({
  records: z.array(embeddingRecordSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
})

export const recordUpdateSchema = z.object({
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type EmbeddingRecord = z.infer<typeof embeddingRecordSchema>
export type RecordsListParams = z.infer<typeof recordsListParamsSchema>
export type RecordsListResponse = z.infer<typeof recordsListResponseSchema>
export type RecordUpdate = z.infer<typeof recordUpdateSchema>
