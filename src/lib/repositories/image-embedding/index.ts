import type {
  ImageEmbeddingModel,
  ImageEmbeddingRequest,
  ImageEmbeddingResponse,
} from '@/lib/schemas/image-embedding'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  createImageEmbedding,
  fetchImageEmbeddingModels,
} from '@/lib/repositories/image-embedding/api'
import {
  createDemoImageEmbedding,
  getDemoImageEmbeddingModels,
} from '@/mocks'

export interface ImageEmbeddingRepository {
  getModels: () => Promise<ImageEmbeddingModel[]>
  createEmbedding: (request: ImageEmbeddingRequest) => Promise<ImageEmbeddingResponse>
}

const apiRepository: ImageEmbeddingRepository = {
  getModels: () => fetchImageEmbeddingModels(),
  createEmbedding: (request) => createImageEmbedding(request),
}

const demoRepository: ImageEmbeddingRepository = {
  getModels: async () => getDemoImageEmbeddingModels(),
  createEmbedding: async (request) => createDemoImageEmbedding(request),
}

export function getImageEmbeddingRepository(
  mode: DataMode = getDataMode()
): ImageEmbeddingRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
