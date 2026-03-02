import {
  embeddingQueueStatusSchema,
  type EmbeddingQueueStatus,
} from '@/lib/schemas/text-embedding'

export function parseQueueStatusFilter(
  value: string | null
): EmbeddingQueueStatus | null {
  if (!value) {
    return null
  }

  const parsedStatus = embeddingQueueStatusSchema.safeParse(value)
  return parsedStatus.success ? parsedStatus.data : null
}

export function toQueueStatusQueryValue(
  status: EmbeddingQueueStatus | null
): string | null {
  return status ?? null
}
