import {
  API_BASE_URL,
  ApiError,
  api,
} from '@/lib/api'
import type {
  ImageEmbeddingModel,
  ImageEmbeddingRequest,
  ImageEmbeddingResponse,
} from '@/lib/schemas/image-embedding'
import {
  imageEmbeddingModelSchema,
  imageEmbeddingResponseSchema,
} from '@/lib/schemas/image-embedding'

export async function fetchImageEmbeddingModels(): Promise<ImageEmbeddingModel[]> {
  return api.get<ImageEmbeddingModel[]>(
    '/embed/image/models',
    imageEmbeddingModelSchema.array()
  )
}

export async function createImageEmbedding(
  request: ImageEmbeddingRequest
): Promise<ImageEmbeddingResponse> {
  const formData = new FormData()
  if (request.url) formData.append('url', request.url)
  if (request.file) formData.append('file', request.file)
  if (request.model) formData.append('model', request.model)
  if (request.resolution) formData.append('resolution', String(request.resolution))
  if (request.metadata) formData.append('metadata', JSON.stringify(request.metadata))

  const response = await fetch(`${API_BASE_URL}/embed/image`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      (errorData as { message?: string }).message || `HTTP error ${response.status}`,
      response.status,
      errorData
    )
  }

  const payload = await response.json()
  const parsed = imageEmbeddingResponseSchema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError('Invalid API response format', 500, parsed.error)
  }

  return parsed.data
}
