import { http, HttpResponse } from 'msw'
import type { TextEmbeddingRequest } from '@/lib/schemas/text-embedding'
import {
  createDemoImageEmbedding,
  createDemoTextEmbedding,
  getDemoImageEmbeddingModels,
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
