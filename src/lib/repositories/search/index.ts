import type {
  SearchRequest,
  SearchResponse,
} from '@/lib/schemas/search'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import { executeSearch } from '@/lib/repositories/search/api'
import { searchDemo } from '@/mocks'

export interface SearchRepository {
  search: (request: SearchRequest) => Promise<SearchResponse>
}

const apiRepository: SearchRepository = {
  search: (request) => executeSearch(request),
}

const demoRepository: SearchRepository = {
  search: async (request) => searchDemo(request),
}

export function getSearchRepository(mode: DataMode = getDataMode()): SearchRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
