import { http, HttpResponse } from 'msw'
import type {
  TextEmbeddingJobCreateRequest,
  TextEmbeddingJobListParams,
  TextEmbeddingRequest,
} from '@/lib/schemas/text-embedding'
import {
  createDemoTextEmbeddingJob,
  createDemoImageEmbedding,
  createDemoTextEmbedding,
  getDemoTextEmbeddingJobDetail,
  getDemoImageEmbeddingModels,
  listDemoTextEmbeddingJobs,
  getDemoTextEmbeddingModels,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

export const embeddingHandlers = [
  http.get(`${API_URL}/embed/text/models`, () => {
    return HttpResponse.json(getDemoTextEmbeddingModels())
  }),
  http.post(`${API_URL}/embed/text`, async ({ request }) => {
    const body = (await request.json()) as TextEmbeddingRequest
    return HttpResponse.json(createDemoTextEmbedding(body))
  }),
  http.post(`${API_URL}/embed/text/jobs`, async ({ request }) => {
    const body = (await request.json()) as TextEmbeddingJobCreateRequest
    return HttpResponse.json(createDemoTextEmbeddingJob(body))
  }),
  http.get(`${API_URL}/embed/text/jobs`, ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? '50')
    const params: TextEmbeddingJobListParams = {
      limit: Number.isFinite(limit) ? limit : 50,
    }
    return HttpResponse.json(listDemoTextEmbeddingJobs(params))
  }),
  http.get(`${API_URL}/embed/text/jobs/:id`, ({ params }) => {
    const id = String(params.id ?? '')
    try {
      return HttpResponse.json(getDemoTextEmbeddingJobDetail(id))
    } catch {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
  }),
  http.get(`${API_URL}/embed/image/models`, () => {
    return HttpResponse.json(getDemoImageEmbeddingModels())
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
      createDemoImageEmbedding({
        url: typeof url === 'string' ? url : undefined,
        file: file instanceof File ? file : undefined,
        model: typeof model === 'string' ? model : undefined,
        resolution: typeof resolution === 'string' ? Number(resolution) : undefined,
        metadata,
      })
    )
  }),
]
