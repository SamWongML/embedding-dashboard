import { describe, expect, it, vi, beforeEach } from 'vitest'

const {
  mockUseQuery,
  mockUseMutation,
  mockUseQueryClient,
  mockRepository,
} = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(),
  mockUseQueryClient: vi.fn(),
  mockRepository: {
    getModels: vi.fn(),
    createEmbedding: vi.fn(),
    createJob: vi.fn(),
    listJobs: vi.fn(),
    getJobDetail: vi.fn(),
  },
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQueryClient: () => mockUseQueryClient(),
}))

vi.mock('@/lib/repositories/text-embedding', () => ({
  getTextEmbeddingRepository: () => mockRepository,
}))

import {
  useTextEmbeddingQueue,
  useTextEmbeddingJobDetail,
} from '@/lib/hooks/use-text-embedding'

describe('use-text-embedding hooks', () => {
  beforeEach(() => {
    mockUseQuery.mockReset()
    mockUseMutation.mockReset()
    mockUseQueryClient.mockReset()
    mockUseQuery.mockReturnValue({})
  })

  it('polls queue aggressively when there are active jobs', () => {
    useTextEmbeddingQueue({ limit: 50 })

    const queryOptions = mockUseQuery.mock.calls[0]?.[0]
    expect(queryOptions).toBeDefined()
    expect(queryOptions.refetchIntervalInBackground).toBe(true)

    const activeInterval = queryOptions.refetchInterval({
      state: {
        data: {
          jobs: [{ status: 'processing' }],
        },
      },
    })

    const idleInterval = queryOptions.refetchInterval({
      state: {
        data: {
          jobs: [{ status: 'completed' }],
        },
      },
    })

    expect(activeInterval).toBe(2000)
    expect(idleInterval).toBe(15000)
  })

  it('polls job details only for non-terminal states', () => {
    useTextEmbeddingJobDetail('job-1')
    const queryOptions = mockUseQuery.mock.calls[0]?.[0]
    expect(queryOptions.enabled).toBe(true)

    const processingInterval = queryOptions.refetchInterval({
      state: {
        data: {
          status: 'processing',
        },
      },
    })

    const completedInterval = queryOptions.refetchInterval({
      state: {
        data: {
          status: 'completed',
        },
      },
    })

    expect(processingInterval).toBe(2000)
    expect(completedInterval).toBe(false)
  })
})
