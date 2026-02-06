import { describe, expect, it } from 'vitest'
import {
  graphDataSchema,
  metricsOverviewSchema,
  recordsListResponseSchema,
  userSchema,
  imageEmbeddingResponseSchema,
} from '@/lib/schemas'

describe('additional schemas', () => {
  it('validates graph data', () => {
    const payload = {
      nodes: [
        { id: 'n1', label: 'Node', type: 'doc', properties: { source: 'test' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n1', type: 'links', properties: {} },
      ],
    }
    expect(() => graphDataSchema.parse(payload)).not.toThrow()
  })

  it('validates metrics overview', () => {
    const payload = {
      cards: [
        { label: 'Requests', value: 100, change: 5, changeType: 'increase' },
      ],
      topHits: [
        { id: 'h1', name: 'Embed', count: 10, type: 'endpoint' },
      ],
      topUsers: [
        { id: 'u1', name: 'Avery', email: 'a@example.com', requestCount: 12, lastActive: 'now' },
      ],
      trends: [
        { date: '2024-01-01', textEmbeddings: 1, imageEmbeddings: 2, searches: 3 },
      ],
      searchAnalytics: [
        { hour: 1, day: 'Mon', count: 5 },
      ],
    }
    expect(() => metricsOverviewSchema.parse(payload)).not.toThrow()
  })

  it('validates records list response', () => {
    const payload = {
      records: [
        {
          id: 'r1',
          content: 'Hello',
          contentType: 'text',
          vectorDimensions: 3,
          model: 'text-embedding-3-small',
          createdAt: 'now',
          updatedAt: 'now',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }
    expect(() => recordsListResponseSchema.parse(payload)).not.toThrow()
  })

  it('validates user schema', () => {
    const payload = {
      id: 'u1',
      name: 'Avery',
      email: 'a@example.com',
      role: 'admin',
      groups: ['team'],
      createdAt: 'now',
      isActive: true,
    }
    expect(() => userSchema.parse(payload)).not.toThrow()
  })

  it('validates image embedding response', () => {
    const payload = {
      result: {
        id: 'img-1',
        vector: [0.1, 0.2],
        model: 'image-embedding-1',
        resolution: 256,
        createdAt: 'now',
      },
      processingTime: 120,
    }
    expect(() => imageEmbeddingResponseSchema.parse(payload)).not.toThrow()
  })
})
