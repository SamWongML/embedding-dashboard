import { http, HttpResponse } from 'msw'
import type { RecordUpdate } from '@/lib/schemas/records'
import {
  deleteDemoRecord,
  getDemoRecordDetail,
  listDemoRecords,
  updateDemoRecord,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

export const recordsHandlers = [
  http.get(`${API_URL}/records`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
    const sortBy = url.searchParams.get('sortBy') ?? undefined
    const sortOrder = (url.searchParams.get('sortOrder') ?? undefined) as
      | 'asc'
      | 'desc'
      | undefined
    const search = url.searchParams.get('search') ?? undefined
    const contentType = (url.searchParams.get('contentType') ?? undefined) as
      | 'text'
      | 'image'
      | 'all'
      | undefined

    return HttpResponse.json(
      listDemoRecords({ page, pageSize, sortBy, sortOrder, search, contentType })
    )
  }),
  http.get(`${API_URL}/records/:id`, ({ params }) => {
    const id = String(params.id ?? '')
    const record = getDemoRecordDetail(id)
    if (!record) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(record)
  }),
  http.patch(`${API_URL}/records/:id`, async ({ params, request }) => {
    const id = String(params.id ?? '')
    const body = (await request.json()) as RecordUpdate
    try {
      return HttpResponse.json(updateDemoRecord(id, body))
    } catch (error) {
      return HttpResponse.json(
        { message: (error as Error).message },
        { status: 404 }
      )
    }
  }),
  http.delete(`${API_URL}/records/:id`, ({ params }) => {
    const id = String(params.id ?? '')
    deleteDemoRecord(id)
    return HttpResponse.json({ ok: true })
  }),
]
