import type {
  SearchRequest,
  SearchResponse,
  SearchResult,
} from '@/lib/schemas/search'
import {
  cloneDemoValue,
  getDemoScenarioState,
} from '@/mocks/scenario'

function hashNumber(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function applyFilters(results: SearchResult[], request: SearchRequest) {
  if (!request.filters || request.filters.length === 0) {
    return results
  }

  return results.filter((result) =>
    request.filters?.every((filter) => {
      const metadataValue = result.metadata?.[filter.field]
      if (filter.operator === 'eq') return metadataValue === filter.value
      if (filter.operator === 'ne') return metadataValue !== filter.value
      if (filter.operator === 'contains') {
        return String(metadataValue ?? '')
          .toLowerCase()
          .includes(String(filter.value).toLowerCase())
      }
      return true
    })
  )
}

export function getDemoSearchResults(): SearchResult[] {
  return cloneDemoValue(getDemoScenarioState().searchResults)
}

export function searchDemo(request: SearchRequest): SearchResponse {
  const allResults = getDemoSearchResults()
  const queryValue = request.query.toLowerCase()
  const filteredByQuery = allResults.filter((result) => {
    const source = result.source?.toLowerCase() ?? ''
    return (
      result.content.toLowerCase().includes(queryValue) ||
      source.includes(queryValue) ||
      result.highlights?.some((item) => item.toLowerCase().includes(queryValue))
    )
  })

  const filtered = applyFilters(filteredByQuery, request)
  const sorted = filtered.sort((left, right) => right.score - left.score)
  const offset = request.offset ?? 0
  const limit = request.limit ?? 20
  const paginated = sorted.slice(offset, offset + limit)

  return {
    results: paginated,
    totalCount: sorted.length,
    took: 20 + (hashNumber(request.query) % 85),
    query: request.query,
  }
}
