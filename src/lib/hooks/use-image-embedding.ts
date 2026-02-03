'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type ImageEmbeddingModel,
  type ImageEmbeddingRequest,
  type ImageEmbeddingResponse,
} from '@/lib/schemas/image-embedding'

// Mock data for development
const mockModels: ImageEmbeddingModel[] = [
  { id: 'clip-vit-base-patch32', name: 'CLIP ViT-Base/32', dimensions: 512, maxResolution: 224, provider: 'OpenAI' },
  { id: 'clip-vit-large-patch14', name: 'CLIP ViT-Large/14', dimensions: 768, maxResolution: 336, provider: 'OpenAI' },
  { id: 'siglip-so400m', name: 'SigLIP SO400M', dimensions: 1152, maxResolution: 384, provider: 'Google' },
]

export function useImageEmbeddingModels() {
  return useQuery({
    queryKey: queryKeys.imageEmbedding.models(),
    queryFn: async () => {
      try {
        return await api.get<ImageEmbeddingModel[]>('/embed/image/models')
      } catch {
        return mockModels
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateImageEmbedding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ImageEmbeddingRequest) => {
      try {
        const formData = new FormData()
        if (request.url) formData.append('url', request.url)
        if (request.file) formData.append('file', request.file)
        if (request.model) formData.append('model', request.model)
        if (request.resolution) formData.append('resolution', String(request.resolution))
        if (request.metadata) formData.append('metadata', JSON.stringify(request.metadata))

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/embed/image`, {
          method: 'POST',
          body: formData,
        })
        return response.json() as Promise<ImageEmbeddingResponse>
      } catch {
        // Mock response for development
        const mockVector = Array.from({ length: 512 }, () => Math.random() * 2 - 1)
        return {
          result: {
            id: crypto.randomUUID(),
            imageUrl: request.url,
            vector: mockVector,
            model: request.model || 'clip-vit-base-patch32',
            resolution: request.resolution || 224,
            metadata: request.metadata,
            createdAt: new Date().toISOString(),
          },
          processingTime: Math.random() * 1000 + 200,
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}
