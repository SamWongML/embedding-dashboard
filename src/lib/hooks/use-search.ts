'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import {
  type SearchRequest,
  type SearchResponse,
} from '@/lib/schemas/search'
import { getSearchRepository } from '@/lib/repositories/search'
import { delay } from '@/lib/utils'

const searchRepository = getSearchRepository()
const UX_DEBUG_DELAY_MS = 2000

export function useSearch(request: SearchRequest | null) {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.search.results(request?.query || '', request),
    queryFn: async () => {
      if (!request) {
        return { results: [], totalCount: 0, took: 0, query: '' }
      }
      return searchRepository.search(request)
    },
    enabled: !!request?.query,
  })
}

export function useSearchMutation() {
  return useMutation({
    mutationFn: async (request: SearchRequest) => {
      const response = await searchRepository.search(request)
      await delay(UX_DEBUG_DELAY_MS)
      return response
    },
  })
}
