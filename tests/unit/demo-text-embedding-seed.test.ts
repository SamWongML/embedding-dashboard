import { beforeEach, describe, expect, it } from 'vitest'
import {
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
})
