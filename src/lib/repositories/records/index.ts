import type {
  EmbeddingRecord,
  RecordsListParams,
  RecordsListResponse,
  RecordUpdate,
} from '@/lib/schemas/records'
import type { DataMode } from '@/lib/runtime/data-mode'
import { getDataMode } from '@/lib/runtime/data-mode'
import {
  fetchRecordDetail,
  fetchRecordsList,
  patchRecord,
  removeRecord,
} from '@/lib/repositories/records/api'
import {
  deleteDemoRecord,
  getDemoRecordDetail,
  listDemoRecords,
  updateDemoRecord,
} from '@/mocks'

export interface RecordsRepository {
  listRecords: (params?: RecordsListParams) => Promise<RecordsListResponse>
  getRecordDetail: (id: string) => Promise<EmbeddingRecord | null>
  updateRecord: (id: string, update: RecordUpdate) => Promise<EmbeddingRecord>
  deleteRecord: (id: string) => Promise<void>
}

const apiRepository: RecordsRepository = {
  listRecords: (params) => fetchRecordsList(params),
  getRecordDetail: async (id) => fetchRecordDetail(id),
  updateRecord: (id, update) => patchRecord(id, update),
  deleteRecord: (id) => removeRecord(id),
}

const demoRepository: RecordsRepository = {
  listRecords: async (params) => listDemoRecords(params),
  getRecordDetail: async (id) => getDemoRecordDetail(id),
  updateRecord: async (id, update) => updateDemoRecord(id, update),
  deleteRecord: async (id) => deleteDemoRecord(id),
}

export function getRecordsRepository(mode: DataMode = getDataMode()): RecordsRepository {
  return mode === 'demo' ? demoRepository : apiRepository
}
