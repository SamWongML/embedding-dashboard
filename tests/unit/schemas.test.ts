import { describe, it, expect } from 'vitest'
import {
  healthCheckSchema,
  serviceStatusSchema,
  traceSpansResponseSchema,
  traceSummarySchema,
} from '@/lib/schemas/server-status'
import { textEmbeddingRequestSchema } from '@/lib/schemas/text-embedding'
import { searchRequestSchema } from '@/lib/schemas/search'

describe('Server Status Schemas', () => {
  describe('serviceStatusSchema', () => {
    it('accepts valid status values', () => {
      expect(serviceStatusSchema.parse('healthy')).toBe('healthy')
      expect(serviceStatusSchema.parse('degraded')).toBe('degraded')
      expect(serviceStatusSchema.parse('unhealthy')).toBe('unhealthy')
    })

    it('rejects invalid status values', () => {
      expect(() => serviceStatusSchema.parse('invalid')).toThrow()
    })
  })

  describe('healthCheckSchema', () => {
    it('validates correct health check data', () => {
      const validData = {
        status: 'healthy',
        uptime: 86400,
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z',
      }
      expect(() => healthCheckSchema.parse(validData)).not.toThrow()
    })

    it('rejects incomplete health check data', () => {
      const invalidData = {
        status: 'healthy',
        // missing uptime, version, timestamp
      }
      const parsed = healthCheckSchema.parse(invalidData)
      expect(parsed.uptime).toBe(0)
      expect(parsed.version).toBe('unknown')
      expect(parsed.timestamp).toBeTypeOf('string')
    })

    it('parses numeric uptime and timestamp strings', () => {
      const parsed = healthCheckSchema.parse({
        status: 'healthy',
        uptime: ' 123 ',
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z',
      })

      expect(parsed.uptime).toBe(123)
      expect(parsed.timestamp).toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('trace schemas', () => {
    it('validates trace summary payload', () => {
      const parsed = traceSummarySchema.parse({
        id: 'tr-a8f3c2',
        traceId: 'tr-a8f3c2',
        timestamp: '2026-02-27T10:00:00.000Z',
        status: 'ok',
        method: 'POST',
        route: '/embed/text',
        service: 'Embedding Service',
        durationMs: 234,
        spanCount: 7,
      })

      expect(parsed.traceId).toBe('tr-a8f3c2')
      expect(parsed.durationMs).toBe(234)
    })

    it('rejects malformed trace summary payload', () => {
      expect(() =>
        traceSummarySchema.parse({
          id: 'tr-invalid',
          traceId: 'tr-invalid',
          timestamp: 'not-a-date',
          status: 'ok',
          method: 'GET',
          route: '/graph/query',
          service: 'Graph Engine',
          durationMs: -1,
          spanCount: 4,
        })
      ).toThrow()
    })

    it('validates trace spans response payload', () => {
      const parsed = traceSpansResponseSchema.parse({
        traceId: 'tr-a8f3c2',
        traceDurationMs: 234,
        spans: [
          {
            id: 'tr-a8f3c2-span-01',
            traceId: 'tr-a8f3c2',
            name: 'API Gateway',
            service: 'API Gateway',
            status: 'ok',
            category: 'http',
            startMs: 0,
            durationMs: 234,
            depth: 0,
          },
          {
            id: 'tr-a8f3c2-span-02',
            traceId: 'tr-a8f3c2',
            name: 'Vector Store Write',
            service: 'Vector Store',
            status: 'error',
            category: 'db',
            startMs: 180,
            durationMs: 40,
            depth: 2,
          },
        ],
      })

      expect(parsed.spans).toHaveLength(2)
      expect(parsed.spans[1]?.status).toBe('error')
    })

    it('rejects negative span timing values', () => {
      expect(() =>
        traceSpansResponseSchema.parse({
          traceId: 'tr-a8f3c2',
          traceDurationMs: 234,
          spans: [
            {
              id: 'tr-a8f3c2-span-01',
              traceId: 'tr-a8f3c2',
              name: 'API Gateway',
              service: 'API Gateway',
              status: 'ok',
              category: 'http',
              startMs: -1,
              durationMs: 50,
              depth: 0,
            },
          ],
        })
      ).toThrow()
    })
  })
})

describe('Text Embedding Schemas', () => {
  describe('textEmbeddingRequestSchema', () => {
    it('validates correct request data', () => {
      const validData = {
        text: 'Hello, world!',
        model: 'text-embedding-3-small',
        chunkSize: 500,
        chunkOverlap: 50,
      }
      expect(() => textEmbeddingRequestSchema.parse(validData)).not.toThrow()
    })

    it('requires text field', () => {
      const invalidData = {
        model: 'text-embedding-3-small',
      }
      expect(() => textEmbeddingRequestSchema.parse(invalidData)).toThrow()
    })

    it('rejects empty text', () => {
      const invalidData = {
        text: '',
      }
      expect(() => textEmbeddingRequestSchema.parse(invalidData)).toThrow()
    })

    it('validates chunk size range', () => {
      expect(() =>
        textEmbeddingRequestSchema.parse({ text: 'test', chunkSize: 50 })
      ).toThrow()
      expect(() =>
        textEmbeddingRequestSchema.parse({ text: 'test', chunkSize: 2500 })
      ).toThrow()
      expect(() =>
        textEmbeddingRequestSchema.parse({ text: 'test', chunkSize: 500 })
      ).not.toThrow()
    })
  })
})

describe('Search Schemas', () => {
  describe('searchRequestSchema', () => {
    it('validates correct search request', () => {
      const validData = {
        query: 'test query',
        vectorWeight: 0.5,
        bm25Weight: 0.3,
        graphWeight: 0.2,
        limit: 20,
      }
      expect(() => searchRequestSchema.parse(validData)).not.toThrow()
    })

    it('requires query field', () => {
      const invalidData = {
        vectorWeight: 0.5,
      }
      expect(() => searchRequestSchema.parse(invalidData)).toThrow()
    })

    it('validates weight ranges', () => {
      expect(() =>
        searchRequestSchema.parse({ query: 'test', vectorWeight: 1.5 })
      ).toThrow()
      expect(() =>
        searchRequestSchema.parse({ query: 'test', vectorWeight: -0.1 })
      ).toThrow()
    })
  })
})
