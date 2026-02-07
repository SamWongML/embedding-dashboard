import { api } from '@/lib/api'
import type {
  EmbeddingModel,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import {
  embeddingModelSchema,
  textEmbeddingResponseSchema,
} from '@/lib/schemas/text-embedding'

export async function fetchTextEmbeddingModels(): Promise<EmbeddingModel[]> {
  return api.get<EmbeddingModel[]>(
    '/embed/text/models',
    embeddingModelSchema.array()
  )
}

export async function createTextEmbedding(
  request: TextEmbeddingRequest
): Promise<TextEmbeddingResponse> {
  return api.post<TextEmbeddingResponse>(
    '/embed/text',
    request,
    textEmbeddingResponseSchema
  )
}
