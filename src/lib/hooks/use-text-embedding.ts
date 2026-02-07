'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import {
  type EmbeddingModel,
  type TextEmbeddingRequest,
  type TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import { getTextEmbeddingRepository } from '@/lib/repositories/text-embedding'
import { delay } from '@/lib/utils'

const textEmbeddingRepository = getTextEmbeddingRepository()
const UX_DEBUG_DELAY_MS = 2000

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
