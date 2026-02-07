import { api } from '@/lib/api'
import type {
  EmbeddingRecord,
  RecordsListParams,
  RecordsListResponse,
  RecordUpdate,
} from '@/lib/schemas/records'
import {
  embeddingRecordSchema,
  recordsListResponseSchema,
} from '@/lib/schemas/records'

export async function fetchRecordsList(
  params: RecordsListParams = {}
): Promise<RecordsListResponse> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params.search) queryParams.append('search', params.search)
  if (params.contentType && params.contentType !== 'all') {
    queryParams.append('contentType', params.contentType)
  }

  return api.get<RecordsListResponse>(
    `/records?${queryParams}`,
    recordsListResponseSchema
  )
}

export async function fetchRecordDetail(id: string): Promise<EmbeddingRecord> {
  return api.get<EmbeddingRecord>(`/records/${id}`, embeddingRecordSchema)
}

export async function patchRecord(
  id: string,
  update: RecordUpdate
): Promise<EmbeddingRecord> {
  return api.patch<EmbeddingRecord>(`/records/${id}`, update, embeddingRecordSchema)
}

export async function removeRecord(id: string): Promise<void> {
  await api.delete(`/records/${id}`)
}
