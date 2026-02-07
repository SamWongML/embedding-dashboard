import type {
  EmbeddingModel,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  createTextEmbedding,
  fetchTextEmbeddingModels,
} from '@/lib/repositories/text-embedding/api'
import {
  createDemoTextEmbedding,
  getDemoTextEmbeddingModels,
} from '@/mocks'

export interface TextEmbeddingRepository {
  getModels: () => Promise<EmbeddingModel[]>
  createEmbedding: (request: TextEmbeddingRequest) => Promise<TextEmbeddingResponse>
}

const apiRepository: TextEmbeddingRepository = {
  getModels: () => fetchTextEmbeddingModels(),
  createEmbedding: (request) => createTextEmbedding(request),
}

const demoRepository: TextEmbeddingRepository = {
  getModels: async () => getDemoTextEmbeddingModels(),
  createEmbedding: async (request) => createDemoTextEmbedding(request),
}

export function getTextEmbeddingRepository(
  mode: DataMode = getDataMode()
): TextEmbeddingRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
