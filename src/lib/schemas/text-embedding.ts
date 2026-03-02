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
}).refine(
  (value) =>
    value.chunkSize === undefined ||
    value.chunkOverlap === undefined ||
    value.chunkOverlap < value.chunkSize,
  {
    path: ['chunkOverlap'],
    message: 'Chunk overlap must be less than chunk size',
  }
)

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

export const embeddingQueueStatusSchema = z.enum([
  'queued',
  'processing',
  'completed',
  'failed',
])

export type EmbeddingQueueStatus = z.infer<typeof embeddingQueueStatusSchema>

export function normalizeEmbeddingQueueStatus(status: string): EmbeddingQueueStatus {
  const normalized = status.trim().toLowerCase()
  if (
    normalized === 'queued' ||
    normalized === 'pending' ||
    normalized === 'validating_inputs'
  ) {
    return 'queued'
  }

  if (
    normalized === 'processing' ||
    normalized === 'in_progress' ||
    normalized === 'started' ||
    normalized === 'finalizing'
  ) {
    return 'processing'
  }

  if (normalized === 'completed' || normalized === 'succeeded') {
    return 'completed'
  }

  if (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'expired'
  ) {
    return 'failed'
  }

  return 'failed'
}

export function isTerminalEmbeddingQueueStatus(status: EmbeddingQueueStatus) {
  return status === 'completed' || status === 'failed'
}

const embeddingQueueStatusInputSchema = z
  .string()
  .min(1)
  .transform((value) => normalizeEmbeddingQueueStatus(value))

export const textEmbeddingSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, 'Text is required'),
  }),
  z.object({
    type: z.literal('url'),
    url: z
      .string()
      .url('URL must be valid')
      .refine((value) => value.startsWith('https://'), {
        message: 'URL must use HTTPS',
      }),
    extractionMode: z.enum(['main-content', 'full-content']).optional(),
    maxChars: z.number().int().min(500).max(250_000).optional(),
  }),
])

export const textEmbeddingJobCreateOptionsSchema = z
  .object({
    model: z.string().optional(),
    dimensions: z.number().int().min(128).max(3072).optional(),
    chunkSize: z.number().int().min(100).max(4000).optional(),
    chunkOverlap: z.number().int().min(0).max(2000).optional(),
    batchSize: z.number().int().min(1).max(64).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (value) =>
      value.chunkSize === undefined ||
      value.chunkOverlap === undefined ||
      value.chunkOverlap < value.chunkSize,
    {
      path: ['chunkOverlap'],
      message: 'Chunk overlap must be less than chunk size',
    }
  )

export const textEmbeddingJobCreateRequestSchema = z.object({
  source: textEmbeddingSourceSchema,
  mode: z.enum(['simple', 'technical']),
  options: textEmbeddingJobCreateOptionsSchema.optional(),
})

export const textEmbeddingJobProgressSchema = z.object({
  completedChunks: z.number().int().nonnegative(),
  totalChunks: z.number().int().nonnegative(),
  failedChunks: z.number().int().nonnegative(),
})

export const textEmbeddingJobUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
})

export const textEmbeddingJobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
})

export const textEmbeddingJobSummarySchema = z.object({
  id: z.string(),
  status: embeddingQueueStatusInputSchema,
  sourceType: z.enum(['text', 'url']),
  sourcePreview: z.string(),
  sourceUrl: z.string().url().optional(),
  model: z.string(),
  dimensions: z.number().int().positive(),
  progress: textEmbeddingJobProgressSchema,
  usage: textEmbeddingJobUsageSchema.optional(),
  queuedAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  failedAt: z.string().optional(),
  updatedAt: z.string(),
  error: textEmbeddingJobErrorSchema.optional(),
})

export const textEmbeddingJobDetailSchema = textEmbeddingJobSummarySchema.extend({
  request: textEmbeddingJobCreateRequestSchema,
  result: z
    .object({
      results: z.array(textEmbeddingResultSchema),
      totalTokens: z.number(),
      processingTime: z.number(),
    })
    .optional(),
  backend: z
    .object({
      provider: z.literal('aws-ecs'),
      taskId: z.string().optional(),
      attemptCount: z.number().int().nonnegative().optional(),
    })
    .optional(),
})

export const textEmbeddingJobListParamsSchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
})

export const textEmbeddingJobListResponseSchema = z.object({
  jobs: z.array(textEmbeddingJobSummarySchema),
  totalCount: z.number().int().nonnegative(),
})

export type EmbeddingModel = z.infer<typeof embeddingModelSchema>
export type TextEmbeddingRequest = z.infer<typeof textEmbeddingRequestSchema>
export type TextEmbeddingResult = z.infer<typeof textEmbeddingResultSchema>
export type TextEmbeddingResponse = z.infer<typeof textEmbeddingResponseSchema>
export type TextEmbeddingSource = z.infer<typeof textEmbeddingSourceSchema>
export type TextEmbeddingJobCreateOptions = z.infer<typeof textEmbeddingJobCreateOptionsSchema>
export type TextEmbeddingJobCreateRequest = z.infer<typeof textEmbeddingJobCreateRequestSchema>
export type TextEmbeddingJobProgress = z.infer<typeof textEmbeddingJobProgressSchema>
export type TextEmbeddingJobUsage = z.infer<typeof textEmbeddingJobUsageSchema>
export type TextEmbeddingJobError = z.infer<typeof textEmbeddingJobErrorSchema>
export type TextEmbeddingJobSummary = z.infer<typeof textEmbeddingJobSummarySchema>
export type TextEmbeddingJobDetail = z.infer<typeof textEmbeddingJobDetailSchema>
export type TextEmbeddingJobListParams = z.infer<typeof textEmbeddingJobListParamsSchema>
export type TextEmbeddingJobListResponse = z.infer<typeof textEmbeddingJobListResponseSchema>
