import * as z from 'zod'

export const embeddingModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.number(),
  maxTokens: z.number().optional(),
  provider: z.string(),
})

export const textEmbeddingRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  model: z.string().optional(),
  chunkSize: z.number().min(100).max(2000).optional(),
  chunkOverlap: z.number().min(0).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  confluenceUrl: z.string().url().optional().or(z.literal('')),
})

export const textEmbeddingResultSchema = z.object({
  id: z.string(),
  text: z.string(),
  vector: z.array(z.number()),
  model: z.string(),
  tokenCount: z.number(),
  chunkIndex: z.number().optional(),
  totalChunks: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
})

export const textEmbeddingResponseSchema = z.object({
  results: z.array(textEmbeddingResultSchema),
  totalTokens: z.number(),
  processingTime: z.number(),
})

export type EmbeddingModel = z.infer<typeof embeddingModelSchema>
export type TextEmbeddingRequest = z.infer<typeof textEmbeddingRequestSchema>
export type TextEmbeddingResult = z.infer<typeof textEmbeddingResultSchema>
export type TextEmbeddingResponse = z.infer<typeof textEmbeddingResponseSchema>
