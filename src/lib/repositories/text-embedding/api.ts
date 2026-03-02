import { api } from '@/lib/api'
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
import {
  embeddingModelSchema,
  textEmbeddingJobDetailSchema,
  textEmbeddingJobListResponseSchema,
  textEmbeddingJobSummarySchema,
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

export async function createTextEmbeddingJob(
  request: TextEmbeddingJobCreateRequest
): Promise<TextEmbeddingJobSummary> {
  return api.post<TextEmbeddingJobSummary>(
    '/embed/text/jobs',
    request,
    textEmbeddingJobSummarySchema
  )
}

export async function fetchTextEmbeddingJobs(
  params: TextEmbeddingJobListParams = {}
): Promise<TextEmbeddingJobListResponse> {
  const queryParams = new URLSearchParams()
  if (params.limit) {
    queryParams.append('limit', String(params.limit))
  }

  const queryString = queryParams.toString()
  const endpoint = queryString
    ? `/embed/text/jobs?${queryString}`
    : '/embed/text/jobs'

  return api.get<TextEmbeddingJobListResponse>(
    endpoint,
    textEmbeddingJobListResponseSchema
  )
}

export async function fetchTextEmbeddingJobDetail(
  id: string
): Promise<TextEmbeddingJobDetail> {
  return api.get<TextEmbeddingJobDetail>(
    `/embed/text/jobs/${id}`,
    textEmbeddingJobDetailSchema
  )
}
