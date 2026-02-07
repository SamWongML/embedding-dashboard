import { api } from '@/lib/api'
import type {
  SearchRequest,
  SearchResponse,
} from '@/lib/schemas/search'
import { searchResponseSchema } from '@/lib/schemas/search'

export async function executeSearch(request: SearchRequest): Promise<SearchResponse> {
  return api.post<SearchResponse>('/search', request, searchResponseSchema)
}
