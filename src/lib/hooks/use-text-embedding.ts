'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type EmbeddingModel,
  type TextEmbeddingRequest,
  type TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'

// Mock data for development
const mockModels: EmbeddingModel[] = [
  { id: 'text-embedding-3-small', name: 'OpenAI Text Embedding 3 Small', dimensions: 1536, maxTokens: 8191, provider: 'OpenAI' },
  { id: 'text-embedding-3-large', name: 'OpenAI Text Embedding 3 Large', dimensions: 3072, maxTokens: 8191, provider: 'OpenAI' },
  { id: 'voyage-large-2', name: 'Voyage Large 2', dimensions: 1536, maxTokens: 16000, provider: 'Voyage AI' },
  { id: 'cohere-embed-v3', name: 'Cohere Embed v3', dimensions: 1024, maxTokens: 512, provider: 'Cohere' },
]

export function useTextEmbeddingModels() {
  return useQuery({
    queryKey: queryKeys.textEmbedding.models(),
    queryFn: async () => {
      try {
        return await api.get<EmbeddingModel[]>('/embed/text/models')
      } catch {
        return mockModels
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTextEmbedding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: TextEmbeddingRequest) => {
      try {
        return await api.post<TextEmbeddingResponse>('/embed/text', request)
      } catch {
        // Mock response for development
        const mockVector = Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
        return {
          results: [{
            id: crypto.randomUUID(),
            text: request.text.slice(0, 200),
            vector: mockVector,
            model: request.model || 'text-embedding-3-small',
            tokenCount: Math.ceil(request.text.length / 4),
            metadata: request.metadata,
            createdAt: new Date().toISOString(),
          }],
          totalTokens: Math.ceil(request.text.length / 4),
          processingTime: Math.random() * 500 + 100,
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}
