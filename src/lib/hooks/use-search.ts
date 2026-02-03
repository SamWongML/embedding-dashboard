'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type SearchRequest,
  type SearchResponse,
  type SearchResult,
} from '@/lib/schemas/search'

// Mock data for development
const mockResults: SearchResult[] = [
  {
    id: '1',
    content: 'The embedding system provides a unified interface for generating and searching vector embeddings across different modalities including text and images.',
    score: 0.95,
    vectorScore: 0.92,
    bm25Score: 0.88,
    graphScore: 0.78,
    metadata: { source: 'documentation', category: 'overview' },
    highlights: ['embedding system', 'vector embeddings', 'text and images'],
    source: 'docs/overview.md',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'To create a text embedding, send a POST request to /api/embed/text with the text content and optional parameters like chunk size and overlap.',
    score: 0.89,
    vectorScore: 0.85,
    bm25Score: 0.92,
    graphScore: 0.65,
    metadata: { source: 'api-docs', category: 'text-embedding' },
    highlights: ['text embedding', 'POST request', 'chunk size'],
    source: 'docs/api/text-embedding.md',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    content: 'Hybrid search combines vector similarity, BM25 text matching, and graph-based relevance to provide accurate and contextual search results.',
    score: 0.85,
    vectorScore: 0.88,
    bm25Score: 0.75,
    graphScore: 0.92,
    metadata: { source: 'documentation', category: 'search' },
    highlights: ['Hybrid search', 'vector similarity', 'BM25'],
    source: 'docs/search/hybrid.md',
    createdAt: new Date().toISOString(),
  },
]

export function useSearch(request: SearchRequest | null) {
  return useQuery({
    queryKey: queryKeys.search.results(request?.query || '', request),
    queryFn: async () => {
      if (!request) return { results: [], totalCount: 0, took: 0, query: '' }

      try {
        return await api.post<SearchResponse>('/search', request)
      } catch {
        // Mock response for development
        return {
          results: mockResults.filter(r =>
            r.content.toLowerCase().includes(request.query.toLowerCase())
          ),
          totalCount: mockResults.length,
          took: Math.random() * 100 + 20,
          query: request.query,
        }
      }
    },
    enabled: !!request?.query,
  })
}

export function useSearchMutation() {
  return useMutation({
    mutationFn: async (request: SearchRequest) => {
      try {
        return await api.post<SearchResponse>('/search', request)
      } catch {
        return {
          results: mockResults,
          totalCount: mockResults.length,
          took: Math.random() * 100 + 20,
          query: request.query,
        }
      }
    },
  })
}
