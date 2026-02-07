import { delay, http, HttpResponse } from 'msw'
import type {
  SearchRequest,
} from '@/lib/schemas/search'
import type {
  TextEmbeddingRequest,
} from '@/lib/schemas/text-embedding'
import type {
  RecordsListParams,
} from '@/lib/schemas/records'
import type {
  DevApiScenario,
} from '@/lib/runtime/dev-api-scenario'
import {
  createDemoImageEmbedding,
  createDemoTextEmbedding,
  getDemoRecordDetail,
  listDemoRecords,
  searchDemo,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

const SCENARIO_DELAY_MS = 1500
const ERROR_STATUS_CODE = 503

async function withDelay<T>(resolver: () => T) {
  await delay(SCENARIO_DELAY_MS)
  return resolver()
}

function toRecordsParams(request: Request): RecordsListParams {
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

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    contentType,
  }
}

const slowScenarioHandlers = [
  http.post(`${API_URL}/search`, async ({ request }) => {
    const body = (await request.json()) as SearchRequest
    return HttpResponse.json(await withDelay(() => searchDemo(body)))
  }),
  http.post(`${API_URL}/embed/text`, async ({ request }) => {
    const body = (await request.json()) as TextEmbeddingRequest
    return HttpResponse.json(await withDelay(() => createDemoTextEmbedding(body)))
  }),
  http.post(`${API_URL}/embed/image`, async ({ request }) => {
    const formData = await request.formData()
    const metadataInput = formData.get('metadata')
    let metadata: Record<string, unknown> | undefined

    if (typeof metadataInput === 'string' && metadataInput.trim()) {
      try {
        metadata = JSON.parse(metadataInput) as Record<string, unknown>
      } catch {
        metadata = undefined
      }
    }

    const url = formData.get('url')
    const file = formData.get('file')
    const model = formData.get('model')
    const resolution = formData.get('resolution')

    return HttpResponse.json(
      await withDelay(() =>
        createDemoImageEmbedding({
          url: typeof url === 'string' ? url : undefined,
          file: file instanceof File ? file : undefined,
          model: typeof model === 'string' ? model : undefined,
          resolution: typeof resolution === 'string' ? Number(resolution) : undefined,
          metadata,
        })
      )
    )
  }),
  http.get(`${API_URL}/records`, async ({ request }) => {
    return HttpResponse.json(
      await withDelay(() => listDemoRecords(toRecordsParams(request)))
    )
  }),
  http.get(`${API_URL}/records/:id`, async ({ params }) => {
    const id = String(params.id ?? '')
    const record = await withDelay(() => getDemoRecordDetail(id))

    if (!record) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(record)
  }),
]

const errorScenarioHandlers = [
  http.all(`${API_URL}/*`, ({ request }) => {
    const endpoint = new URL(request.url).pathname
    return HttpResponse.json(
      {
        message: `Simulated API failure for ${endpoint}`,
        scenario: 'error',
      },
      { status: ERROR_STATUS_CODE }
    )
  }),
]

export function getScenarioHandlers(scenario: DevApiScenario) {
  if (scenario === 'error') {
    return errorScenarioHandlers
  }

  if (scenario === 'slow') {
    return slowScenarioHandlers
  }

  return []
}

