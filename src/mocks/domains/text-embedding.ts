import type {
  EmbeddingModel,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import {
  buildDemoVector,
  cloneDemoValue,
  getDemoScenarioState,
  nextDemoTimestamp,
} from '@/mocks/scenario'

function resolveModel(modelId: string | undefined): EmbeddingModel {
  const models = getDemoScenarioState().textEmbeddingModels
  const fallback = models[0]
  if (!fallback) {
    throw new Error('No text embedding models configured')
  }

  return (
    models.find((model) => model.id === modelId) ??
    fallback
  )
}

export function getDemoTextEmbeddingModels(): EmbeddingModel[] {
  return cloneDemoValue(getDemoScenarioState().textEmbeddingModels)
}

export function createDemoTextEmbedding(
  request: TextEmbeddingRequest
): TextEmbeddingResponse {
  const model = resolveModel(request.model)
  const vector = buildDemoVector(model.dimensions, `${model.id}:${request.text}`)
  const tokenCount = Math.max(1, Math.ceil(request.text.length / 4))

  return {
    results: [
      {
        id: crypto.randomUUID(),
        text: request.text.slice(0, 220),
        vector,
        model: model.id,
        tokenCount,
        metadata: request.metadata,
        createdAt: nextDemoTimestamp(0),
      },
    ],
    totalTokens: tokenCount,
    processingTime: 110 + (request.text.length % 420),
  }
}
