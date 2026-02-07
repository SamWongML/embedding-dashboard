'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import {
  type EmbeddingRecord,
  type RecordsListParams,
  type RecordsListResponse,
  type RecordUpdate,
} from '@/lib/schemas/records'
import { getRecordsRepository } from '@/lib/repositories/records'

const recordsRepository = getRecordsRepository()

export function useRecordsList(params: RecordsListParams = {}) {
  return useQuery<RecordsListResponse>({
    queryKey: queryKeys.records.list(params),
    queryFn: () => recordsRepository.listRecords(params),
  })
}

export function useRecordDetail(id: string | null) {
  return useQuery<EmbeddingRecord | null>({
    queryKey: queryKeys.records.detail(id || ''),
    queryFn: () => recordsRepository.getRecordDetail(id || ''),
    enabled: !!id,
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: RecordUpdate }) =>
      recordsRepository.updateRecord(id, update),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.records.detail(id) })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => recordsRepository.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all })
    },
  })
}
