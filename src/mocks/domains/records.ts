import type {
  EmbeddingRecord,
  RecordsListParams,
  RecordsListResponse,
  RecordUpdate,
} from '@/lib/schemas/records'
import {
  cloneDemoValue,
  getDemoScenarioState,
  nextDemoTimestamp,
} from '@/mocks/scenario'

function recordsState() {
  return getDemoScenarioState().records
}

function sortRecords(
  records: EmbeddingRecord[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...records].sort((left, right) => {
    if (sortBy === 'createdAt') {
      return (left.createdAt > right.createdAt ? 1 : -1) * direction
    }
    if (sortBy === 'updatedAt') {
      return (left.updatedAt > right.updatedAt ? 1 : -1) * direction
    }
    if (sortBy === 'model') {
      return left.model.localeCompare(right.model) * direction
    }
    if (sortBy === 'vectorDimensions') {
      return (left.vectorDimensions - right.vectorDimensions) * direction
    }
    return (left.createdAt > right.createdAt ? 1 : -1) * -1
  })
}

export function listDemoRecords(params: RecordsListParams = {}): RecordsListResponse {
  const {
    page = 1,
    pageSize = 20,
    sortBy,
    sortOrder = 'desc',
    search,
    contentType,
  } = params

  let filtered = cloneDemoValue(recordsState())

  if (search) {
    const searchValue = search.toLowerCase()
    filtered = filtered.filter((record) => {
      const source = record.source?.toLowerCase() ?? ''
      return (
        record.content.toLowerCase().includes(searchValue) ||
        source.includes(searchValue)
      )
    })
  }

  if (contentType && contentType !== 'all') {
    filtered = filtered.filter((record) => record.contentType === contentType)
  }

  filtered = sortRecords(filtered, sortBy, sortOrder)

  const startIndex = (page - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  return {
    records: paginated,
    totalCount: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  }
}

export function getDemoRecordDetail(id: string): EmbeddingRecord | null {
  const record = recordsState().find((entry) => entry.id === id)
  return record ? cloneDemoValue(record) : null
}

export function updateDemoRecord(id: string, update: RecordUpdate): EmbeddingRecord {
  const records = recordsState()
  const index = records.findIndex((record) => record.id === id)
  if (index === -1) {
    throw new Error('Record not found')
  }

  const existing = records[index]
  if (!existing) {
    throw new Error('Record not found')
  }

  const nextRecord: EmbeddingRecord = {
    ...existing,
    metadata: update.metadata ?? existing.metadata,
    updatedAt: nextDemoTimestamp(0),
  }

  records[index] = nextRecord
  return cloneDemoValue(nextRecord)
}

export function deleteDemoRecord(id: string): void {
  const records = recordsState()
  const index = records.findIndex((record) => record.id === id)
  if (index >= 0) {
    records.splice(index, 1)
  }
}
