import * as z from 'zod'

export const imageEmbeddingModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.number(),
  maxResolution: z.number(),
  provider: z.string(),
})

export const imageEmbeddingRequestSchema = z.object({
  url: z.string().url().optional(),
  file: z.instanceof(File).optional(),
  model: z.string().optional(),
  resolution: z.number().min(64).max(1024).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const imageEmbeddingResultSchema = z.object({
  id: z.string(),
  imageUrl: z.string().optional(),
  vector: z.array(z.number()),
  model: z.string(),
  resolution: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
})

export const imageEmbeddingResponseSchema = z.object({
  result: imageEmbeddingResultSchema,
  processingTime: z.number(),
})

export const batchImageEmbeddingResponseSchema = z.object({
  results: z.array(imageEmbeddingResultSchema),
  totalProcessingTime: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
})

export type ImageEmbeddingModel = z.infer<typeof imageEmbeddingModelSchema>
export type ImageEmbeddingRequest = z.infer<typeof imageEmbeddingRequestSchema>
export type ImageEmbeddingResult = z.infer<typeof imageEmbeddingResultSchema>
export type ImageEmbeddingResponse = z.infer<typeof imageEmbeddingResponseSchema>
export type BatchImageEmbeddingResponse = z.infer<typeof batchImageEmbeddingResponseSchema>
