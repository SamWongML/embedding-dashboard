'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import {
  type ImageEmbeddingModel,
  type ImageEmbeddingRequest,
  type ImageEmbeddingResponse,
} from '@/lib/schemas/image-embedding'
import { getImageEmbeddingRepository } from '@/lib/repositories/image-embedding'
import { delay } from '@/lib/utils'

const imageEmbeddingRepository = getImageEmbeddingRepository()
const UX_DEBUG_DELAY_MS = 2000

export function useImageEmbeddingModels() {
  return useQuery<ImageEmbeddingModel[]>({
    queryKey: queryKeys.imageEmbedding.models(),
    queryFn: () => imageEmbeddingRepository.getModels(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateImageEmbedding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ImageEmbeddingRequest): Promise<ImageEmbeddingResponse> => {
      const response = await imageEmbeddingRepository.createEmbedding(request)
      await delay(UX_DEBUG_DELAY_MS)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}
