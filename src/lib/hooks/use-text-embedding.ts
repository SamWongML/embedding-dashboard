'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import {
  type EmbeddingModel,
  type TextEmbeddingJobCreateRequest,
  type TextEmbeddingJobDetail,
  type TextEmbeddingJobListParams,
  type TextEmbeddingJobListResponse,
  type TextEmbeddingJobSummary,
  type TextEmbeddingRequest,
  type TextEmbeddingResponse,
  isTerminalEmbeddingQueueStatus,
} from '@/lib/schemas/text-embedding'
import { getTextEmbeddingRepository } from '@/lib/repositories/text-embedding'
import { delay } from '@/lib/utils'

const textEmbeddingRepository = getTextEmbeddingRepository()
const UX_DEBUG_DELAY_MS = 2000
const ACTIVE_POLLING_MS = 2000
const IDLE_POLLING_MS = 15000

export function useTextEmbeddingModels() {
  return useQuery<EmbeddingModel[]>({
    queryKey: queryKeys.textEmbedding.models(),
    queryFn: () => textEmbeddingRepository.getModels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTextEmbedding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: TextEmbeddingRequest): Promise<TextEmbeddingResponse> => {
      const response = await textEmbeddingRepository.createEmbedding(request)
      await delay(UX_DEBUG_DELAY_MS)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}

export function useCreateTextEmbeddingJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      request: TextEmbeddingJobCreateRequest
    ): Promise<TextEmbeddingJobSummary> => {
      const response = await textEmbeddingRepository.createJob(request)
      await delay(UX_DEBUG_DELAY_MS)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.textEmbedding.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}

export function useTextEmbeddingQueue(
  params: TextEmbeddingJobListParams = { limit: 50 }
) {
  return useQuery<TextEmbeddingJobListResponse>({
    queryKey: queryKeys.textEmbedding.queue(params),
    queryFn: () => textEmbeddingRepository.listJobs(params),
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      const data = query.state.data as TextEmbeddingJobListResponse | undefined
      if (!data || data.jobs.length === 0) {
        return IDLE_POLLING_MS
      }

      const hasActiveJob = data.jobs.some(
        (job) => !isTerminalEmbeddingQueueStatus(job.status)
      )

      return hasActiveJob ? ACTIVE_POLLING_MS : IDLE_POLLING_MS
    },
    refetchIntervalInBackground: true,
  })
}

export function useTextEmbeddingJobDetail(jobId: string | null) {
  return useQuery<TextEmbeddingJobDetail>({
    queryKey: queryKeys.textEmbedding.job(jobId ?? ''),
    queryFn: () => textEmbeddingRepository.getJobDetail(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const data = query.state.data as TextEmbeddingJobDetail | undefined
      if (!data || !jobId) {
        return false
      }

      return isTerminalEmbeddingQueueStatus(data.status)
        ? false
        : ACTIVE_POLLING_MS
    },
    refetchIntervalInBackground: true,
  })
}
