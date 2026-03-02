import type {
  EmbeddingModel,
  TextEmbeddingJobCreateRequest,
  TextEmbeddingJobDetail,
  TextEmbeddingJobListParams,
  TextEmbeddingJobListResponse,
  TextEmbeddingJobSummary,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from '@/lib/schemas/text-embedding'
import {
  buildDemoVector,
  cloneDemoValue,
  getDemoScenarioState,
  replaceDemoScenarioState,
  nextDemoTimestamp,
} from '@/mocks/scenario'
import {
  isTerminalEmbeddingQueueStatus,
} from '@/lib/schemas/text-embedding'

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

function approximateTokenCount(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}

function resolveSourcePreview(
  source: TextEmbeddingJobCreateRequest['source']
) {
  if (source.type === 'url') {
    return source.url
  }

  return source.text.slice(0, 220)
}

function resolveInputText(
  source: TextEmbeddingJobCreateRequest['source']
) {
  if (source.type === 'text') {
    return source.text
  }

  const maxChars = source.maxChars ?? 20_000
  const extractionMode = source.extractionMode ?? 'main-content'
  return `Extracted (${extractionMode}) content from ${source.url}\n\n` +
    'This is demo extracted content used to simulate async text embedding jobs. '.repeat(20)
      .slice(0, Math.max(500, maxChars))
}

function buildChunkTexts(
  text: string,
  chunkSize = 800,
  chunkOverlap = 80
) {
  const charsPerToken = 4
  const chunkChars = Math.max(400, chunkSize * charsPerToken)
  const overlapChars = Math.min(chunkChars - 1, chunkOverlap * charsPerToken)
  const step = Math.max(1, chunkChars - overlapChars)
  const chunks: string[] = []

  for (let start = 0; start < text.length && chunks.length < 128; start += step) {
    const end = Math.min(text.length, start + chunkChars)
    const chunk = text.slice(start, end)
    if (chunk.trim().length > 0) {
      chunks.push(chunk)
    }
    if (end >= text.length) {
      break
    }
  }

  if (chunks.length === 0) {
    chunks.push(text.slice(0, Math.min(text.length, chunkChars)) || ' ')
  }

  return chunks
}

function toSummary(job: TextEmbeddingJobDetail): TextEmbeddingJobSummary {
  return {
    id: job.id,
    status: job.status,
    sourceType: job.sourceType,
    sourcePreview: job.sourcePreview,
    sourceUrl: job.sourceUrl,
    model: job.model,
    dimensions: job.dimensions,
    progress: job.progress,
    usage: job.usage,
    queuedAt: job.queuedAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    failedAt: job.failedAt,
    updatedAt: job.updatedAt,
    error: job.error,
  }
}

function shouldFailJob(job: TextEmbeddingJobDetail) {
  const forceFail = job.request.options?.metadata?.forceFail
  return forceFail === true
}

function buildCompletedResult(job: TextEmbeddingJobDetail) {
  const inputText = resolveInputText(job.request.source)
  const chunkSize = job.request.options?.chunkSize ?? 800
  const chunkOverlap = job.request.options?.chunkOverlap ?? 80
  const chunkTexts = buildChunkTexts(inputText, chunkSize, chunkOverlap)

  const results = chunkTexts.map((chunk, index) => ({
    id: crypto.randomUUID(),
    text: chunk.slice(0, 220),
    vector: buildDemoVector(
      job.dimensions,
      `${job.id}:${job.model}:${index}:${chunk.slice(0, 120)}`
    ),
    model: job.model,
    tokenCount: approximateTokenCount(chunk),
    chunkIndex: index,
    totalChunks: chunkTexts.length,
    metadata: job.request.options?.metadata,
    createdAt: nextDemoTimestamp(index + 1),
  }))

  const totalTokens = results.reduce((sum, result) => sum + result.tokenCount, 0)

  return {
    results,
    totalTokens,
    processingTime: 120 + chunkTexts.length * 45,
  }
}

const QUEUED_HOLD_POLL_CYCLES = 1
const MAX_CONCURRENT_PROCESSING = 2

function advanceTextEmbeddingJobs() {
  const state = getDemoScenarioState()
  let changed = false

  for (const job of state.textEmbeddingJobs) {
    if (isTerminalEmbeddingQueueStatus(job.status)) {
      continue
    }

    const nextPoll = (state.textEmbeddingJobPolls[job.id] ?? 0) + 1
    state.textEmbeddingJobPolls[job.id] = nextPoll
    changed = true

    if (job.status !== 'processing') {
      continue
    }

    const totalChunks = Math.max(1, job.progress.totalChunks)
    const step = Math.max(1, Math.ceil(totalChunks / 3))
    const completedChunks = Math.min(
      totalChunks,
      job.progress.completedChunks + step
    )

    job.progress.completedChunks = completedChunks
    job.updatedAt = nextDemoTimestamp(nextPoll)

    const inputTokens = approximateTokenCount(resolveInputText(job.request.source))
    job.usage = {
      inputTokens,
      totalTokens: Math.max(
        1,
        Math.ceil((completedChunks / totalChunks) * inputTokens)
      ),
    }

    if (shouldFailJob(job) && completedChunks >= Math.ceil(totalChunks / 2)) {
      job.status = 'failed'
      job.progress.failedChunks = 1
      job.failedAt = nextDemoTimestamp(nextPoll)
      job.error = {
        code: 'EMBED_WORKER_ERROR',
        message: 'Embedding worker failed during chunk processing.',
        retryable: true,
      }
      continue
    }

    if (completedChunks >= totalChunks) {
      job.status = 'completed'
      job.completedAt = nextDemoTimestamp(nextPoll)
      job.result = buildCompletedResult(job)
      if (job.result) {
        job.usage = {
          inputTokens: job.result.totalTokens,
          totalTokens: job.result.totalTokens,
        }
      }
    }
  }

  let processingCount = state.textEmbeddingJobs.filter(
    (job) => job.status === 'processing'
  ).length

  for (const job of state.textEmbeddingJobs) {
    if (job.status !== 'queued') {
      continue
    }

    const pollCount = state.textEmbeddingJobPolls[job.id] ?? 0
    if (pollCount <= QUEUED_HOLD_POLL_CYCLES) {
      continue
    }

    if (processingCount >= MAX_CONCURRENT_PROCESSING) {
      continue
    }

    job.status = 'processing'
    job.startedAt = job.startedAt ?? nextDemoTimestamp(pollCount)
    job.updatedAt = nextDemoTimestamp(pollCount)
    processingCount += 1
    changed = true
  }

  if (changed) {
    replaceDemoScenarioState(state)
  }
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

export function createDemoTextEmbeddingJob(
  request: TextEmbeddingJobCreateRequest
): TextEmbeddingJobSummary {
  const state = getDemoScenarioState()
  const model = resolveModel(request.options?.model)
  const inputText = resolveInputText(request.source)
  const chunkTexts = buildChunkTexts(
    inputText,
    request.options?.chunkSize ?? 800,
    request.options?.chunkOverlap ?? 80
  )
  const dimensions = request.options?.dimensions ?? model.dimensions
  const queuedAt = nextDemoTimestamp(0)
  const id = crypto.randomUUID()

  const job: TextEmbeddingJobDetail = {
    id,
    status: 'queued',
    sourceType: request.source.type,
    sourcePreview: resolveSourcePreview(request.source),
    sourceUrl: request.source.type === 'url' ? request.source.url : undefined,
    model: model.id,
    dimensions,
    progress: {
      completedChunks: 0,
      totalChunks: chunkTexts.length,
      failedChunks: 0,
    },
    queuedAt,
    updatedAt: queuedAt,
    request,
    backend: {
      provider: 'aws-ecs',
      taskId: `task-${id.slice(0, 8)}`,
      attemptCount: 1,
    },
  }

  state.textEmbeddingJobs.unshift(job)
  state.textEmbeddingJobPolls[id] = 0
  replaceDemoScenarioState(state)

  return cloneDemoValue(toSummary(job))
}

export function listDemoTextEmbeddingJobs(
  params: TextEmbeddingJobListParams = {}
): TextEmbeddingJobListResponse {
  advanceTextEmbeddingJobs()
  const state = getDemoScenarioState()
  const limit = params.limit ?? 50
  const jobs = state.textEmbeddingJobs.slice(0, limit).map((job) => toSummary(job))

  return cloneDemoValue({
    jobs,
    totalCount: state.textEmbeddingJobs.length,
  })
}

export function getDemoTextEmbeddingJobDetail(id: string): TextEmbeddingJobDetail {
  advanceTextEmbeddingJobs()
  const job = getDemoScenarioState().textEmbeddingJobs.find((entry) => entry.id === id)
  if (!job) {
    throw new Error('Text embedding job not found')
  }

  return cloneDemoValue(job)
}
