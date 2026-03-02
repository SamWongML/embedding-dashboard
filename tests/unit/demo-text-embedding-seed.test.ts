import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEMO_PERSISTENT_PROCESSING_JOB_ID,
  DEMO_PERSISTENT_QUEUED_JOB_ID,
  listDemoTextEmbeddingJobs,
  resetDemoScenario,
} from '@/mocks'

const QUEUED_JOB_ID = 'job-queue-url-001'

describe('demo text embedding queue seeds', () => {
  beforeEach(() => {
    resetDemoScenario()
  })

  it('includes queued, processing, completed, and failed states on initial queue fetch', () => {
    const response = listDemoTextEmbeddingJobs({ limit: 50 })
    const statuses = new Set(response.jobs.map((job) => job.status))

    expect(statuses.has('queued')).toBe(true)
    expect(statuses.has('processing')).toBe(true)
    expect(statuses.has('completed')).toBe(true)
    expect(statuses.has('failed')).toBe(true)
  })

  it('holds seeded queued jobs for the first poll cycle', () => {
    const firstPoll = listDemoTextEmbeddingJobs({ limit: 50 })
    const queuedJob = firstPoll.jobs.find((job) => job.id === QUEUED_JOB_ID)

    expect(queuedJob).toBeDefined()
    expect(queuedJob?.status).toBe('queued')
  })

  it('promotes seeded queued jobs on subsequent polls when processing capacity is available', () => {
    listDemoTextEmbeddingJobs({ limit: 50 })
    const secondPoll = listDemoTextEmbeddingJobs({ limit: 50 })
    const queuedJob = secondPoll.jobs.find((job) => job.id === QUEUED_JOB_ID)

    expect(queuedJob).toBeDefined()
    expect(['processing', 'completed']).toContain(queuedJob?.status)
  })

  it('keeps persistent queued and processing seed jobs in place across polls', () => {
    const firstPoll = listDemoTextEmbeddingJobs({ limit: 50 })
    const secondPoll = listDemoTextEmbeddingJobs({ limit: 50 })
    const thirdPoll = listDemoTextEmbeddingJobs({ limit: 50 })

    for (const poll of [firstPoll, secondPoll, thirdPoll]) {
      const persistentQueuedJob = poll.jobs.find(
        (job) => job.id === DEMO_PERSISTENT_QUEUED_JOB_ID
      )
      const persistentProcessingJob = poll.jobs.find(
        (job) => job.id === DEMO_PERSISTENT_PROCESSING_JOB_ID
      )

      expect(persistentQueuedJob).toBeDefined()
      expect(persistentQueuedJob?.status).toBe('queued')
      expect(persistentProcessingJob).toBeDefined()
      expect(persistentProcessingJob?.status).toBe('processing')
    }
  })
})
