'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import {
  type EmbeddingRecord,
  type RecordsListParams,
  type RecordsListResponse,
  type RecordUpdate,
} from '@/lib/schemas/records'

// Mock data for development
const generateMockRecords = (count: number): EmbeddingRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 1}`,
    content: `Sample embedding content ${i + 1}. This is a document that has been embedded for semantic search and retrieval purposes.`,
    contentType: i % 4 === 0 ? 'image' : 'text',
    vectorDimensions: 1536,
    model: 'text-embedding-3-small',
    metadata: {
      source: `source-${(i % 5) + 1}`,
      category: ['documentation', 'api', 'tutorial', 'faq', 'guide'][i % 5],
    },
    source: `docs/file-${i + 1}.md`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 1800000).toISOString(),
  }))

const mockRecords = generateMockRecords(100)

export function useRecordsList(params: RecordsListParams = {}) {
  const { page = 1, pageSize = 20, sortBy, sortOrder, search, contentType } = params

  return useQuery({
    queryKey: queryKeys.records.list(params),
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('page', String(page))
        queryParams.append('pageSize', String(pageSize))
        if (sortBy) queryParams.append('sortBy', sortBy)
        if (sortOrder) queryParams.append('sortOrder', sortOrder)
        if (search) queryParams.append('search', search)
        if (contentType && contentType !== 'all') queryParams.append('contentType', contentType)

        return await api.get<RecordsListResponse>(`/records?${queryParams}`)
      } catch {
        // Mock response for development
        let filtered = [...mockRecords]

        if (search) {
          filtered = filtered.filter(r =>
            r.content.toLowerCase().includes(search.toLowerCase())
          )
        }

        if (contentType && contentType !== 'all') {
          filtered = filtered.filter(r => r.contentType === contentType)
        }

        const start = (page - 1) * pageSize
        const paginatedRecords = filtered.slice(start, start + pageSize)

        return {
          records: paginatedRecords,
          totalCount: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        }
      }
    },
  })
}

export function useRecordDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.records.detail(id || ''),
    queryFn: async () => {
      if (!id) return null
      try {
        return await api.get<EmbeddingRecord>(`/records/${id}`)
      } catch {
        return mockRecords.find(r => r.id === id) || null
      }
    },
    enabled: !!id,
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: RecordUpdate }) => {
      try {
        return await api.patch<EmbeddingRecord>(`/records/${id}`, update)
      } catch {
        const record = mockRecords.find(r => r.id === id)
        if (record) {
          return { ...record, ...update, updatedAt: new Date().toISOString() }
        }
        throw new Error('Record not found')
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.records.detail(id) })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/records/${id}`)
      } catch {
        // Mock success for development
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}
