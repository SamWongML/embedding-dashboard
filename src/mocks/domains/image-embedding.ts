import type {
  ImageEmbeddingModel,
  ImageEmbeddingRequest,
  ImageEmbeddingResponse,
} from '@/lib/schemas/image-embedding'
import {
  buildDemoVector,
  cloneDemoValue,
  getDemoScenarioState,
  nextDemoTimestamp,
} from '@/mocks/scenario'

function resolveImageModel(modelId: string | undefined): ImageEmbeddingModel {
  const models = getDemoScenarioState().imageEmbeddingModels
  const fallback = models[0]
  if (!fallback) {
    throw new Error('No image embedding models configured')
  }

  return (
    models.find((model) => model.id === modelId) ??
    fallback
  )
}

export function getDemoImageEmbeddingModels(): ImageEmbeddingModel[] {
  return cloneDemoValue(getDemoScenarioState().imageEmbeddingModels)
}

export function createDemoImageEmbedding(
  request: ImageEmbeddingRequest
): ImageEmbeddingResponse {
  const model = resolveImageModel(request.model)
  const resolution = request.resolution ?? model.maxResolution
  const identity = request.url || request.file?.name || 'uploaded-image'
  const vector = buildDemoVector(model.dimensions, `${model.id}:${identity}:${resolution}`)

  return {
    result: {
      id: crypto.randomUUID(),
      imageUrl: request.url,
      vector,
      model: model.id,
      resolution,
      metadata: request.metadata,
      createdAt: nextDemoTimestamp(0),
    },
    processingTime: 180 + Math.floor(resolution / 2),
  }
}
