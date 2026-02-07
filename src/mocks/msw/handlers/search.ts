import { http, HttpResponse } from 'msw'
import type { SearchRequest } from '@/lib/schemas/search'
import {
  searchDemo,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

export const searchHandlers = [
  http.post(`${API_URL}/search`, async ({ request }) => {
    const body = (await request.json()) as SearchRequest
    return HttpResponse.json(searchDemo(body))
  }),
]
