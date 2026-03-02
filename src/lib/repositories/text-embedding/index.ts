import type {
  EmbeddingModel,
  TextEmbeddingJobCreateRequest,
  TextEmbeddingJobDetail,
  TextEmbeddingJobListParams,
  TextEmbeddingJobListResponse,
  TextEmbeddingJobSummary,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  createTextEmbeddingJob,
  createTextEmbedding,
  fetchTextEmbeddingJobDetail,
  fetchTextEmbeddingJobs,
  fetchTextEmbeddingModels,
} from '@/lib/repositories/text-embedding/api'
import {
  createDemoTextEmbeddingJob,
  createDemoTextEmbedding,
  getDemoTextEmbeddingJobDetail,
  listDemoTextEmbeddingJobs,
  getDemoTextEmbeddingModels,
} from '@/mocks'

export interface TextEmbeddingRepository {
  getModels: () => Promise<EmbeddingModel[]>
  createEmbedding: (request: TextEmbeddingRequest) => Promise<TextEmbeddingResponse>
  createJob: (
    request: TextEmbeddingJobCreateRequest
  ) => Promise<TextEmbeddingJobSummary>
  listJobs: (
    params?: TextEmbeddingJobListParams
  ) => Promise<TextEmbeddingJobListResponse>
  getJobDetail: (id: string) => Promise<TextEmbeddingJobDetail>
}

const apiRepository: TextEmbeddingRepository = {
  getModels: () => fetchTextEmbeddingModels(),
  createEmbedding: (request) => createTextEmbedding(request),
  createJob: (request) => createTextEmbeddingJob(request),
  listJobs: (params) => fetchTextEmbeddingJobs(params),
  getJobDetail: (id) => fetchTextEmbeddingJobDetail(id),
}

const demoRepository: TextEmbeddingRepository = {
  getModels: async () => getDemoTextEmbeddingModels(),
  createEmbedding: async (request) => createDemoTextEmbedding(request),
  createJob: async (request) => createDemoTextEmbeddingJob(request),
  listJobs: async (params) => listDemoTextEmbeddingJobs(params),
  getJobDetail: async (id) => getDemoTextEmbeddingJobDetail(id),
}

export function getTextEmbeddingRepository(
  mode: DataMode = getDataMode()
): TextEmbeddingRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
