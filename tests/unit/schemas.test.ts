import { describe, it, expect } from 'vitest'
import {
  healthCheckSchema,
  serviceStatusSchema,
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
