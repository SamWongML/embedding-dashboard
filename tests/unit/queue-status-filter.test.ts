import { describe, expect, it } from 'vitest'
import {
  parseQueueStatusFilter,
  toQueueStatusQueryValue,
} from '@/lib/schemas/queue-status-filter'

describe('queue status filter helpers', () => {
  it('parses valid queue status values', () => {
    expect(parseQueueStatusFilter('queued')).toBe('queued')
    expect(parseQueueStatusFilter('processing')).toBe('processing')
    expect(parseQueueStatusFilter('completed')).toBe('completed')
    expect(parseQueueStatusFilter('failed')).toBe('failed')
  })

  it('returns null for unknown queue status values', () => {
    expect(parseQueueStatusFilter('all')).toBeNull()
    expect(parseQueueStatusFilter('invalid')).toBeNull()
    expect(parseQueueStatusFilter('')).toBeNull()
    expect(parseQueueStatusFilter(null)).toBeNull()
  })

  it('serializes queue status values for query params', () => {
    expect(toQueueStatusQueryValue('queued')).toBe('queued')
    expect(toQueueStatusQueryValue('processing')).toBe('processing')
    expect(toQueueStatusQueryValue(null)).toBeNull()
  })
})
