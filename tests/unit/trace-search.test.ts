import { describe, expect, it } from 'vitest'
import {
  buildTraceSearchIndex,
  matchesTraceSearch,
  parseTraceSearchQuery,
} from '@/lib/traces/trace-search'
import type { TraceSummary } from '@/lib/schemas/server-status'

const errorTrace: TraceSummary = {
  id: 'tr-d1a6f9',
  traceId: 'tr-d1a6f9',
  timestamp: '2026-02-27T20:00:00.000Z',
  status: 'error',
  method: 'GET',
  route: '/graph/query',
  service: 'Graph Engine',
  durationMs: 3200,
  spanCount: 15,
}

const okTrace: TraceSummary = {
  id: 'tr-a8f3c2',
  traceId: 'tr-a8f3c2',
  timestamp: '2026-02-27T19:59:00.000Z',
  status: 'ok',
  method: 'POST',
  route: '/embed/text',
  service: 'Embedding Service',
  durationMs: 234,
  spanCount: 7,
}

const errorLocaleTime = '08:00:00 PM'
const okLocaleTime = '07:59:00 PM'

describe('trace search parser', () => {
  it('parses structured tokens and fuzzy terms', () => {
    const parsed = parseTraceSearchQuery('status:error service:graph timeout')

    expect(parsed.tokens).toEqual([
      { kind: 'status', value: 'error' },
      { kind: 'service', value: 'graph' },
    ])
    expect(parsed.terms).toEqual(['timeout'])
  })

  it('keeps invalid tokens as plain terms', () => {
    const parsed = parseTraceSearchQuery('duration:abc status:oops')

    expect(parsed.tokens).toEqual([])
    expect(parsed.terms).toEqual(['duration:abc', 'status:oops'])
  })
})

describe('trace search matcher', () => {
  it('matches plain status terms including aliases', () => {
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('error'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(okTrace, parseTraceSearchQuery('ok'), okLocaleTime)).toBe(true)
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('failed'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(okTrace, parseTraceSearchQuery('failed'), okLocaleTime)).toBe(false)
  })

  it('matches duration and numeric representations', () => {
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('3200'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('3200ms'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('3.2s'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(okTrace, parseTraceSearchQuery('3.2s'), okLocaleTime)).toBe(false)
  })

  it('matches span count tokens and combined tokens with AND semantics', () => {
    expect(
      matchesTraceSearch(errorTrace, parseTraceSearchQuery('spans:>=10'), errorLocaleTime)
    ).toBe(true)
    expect(
      matchesTraceSearch(okTrace, parseTraceSearchQuery('spans:>=10'), okLocaleTime)
    ).toBe(false)

    expect(
      matchesTraceSearch(
        errorTrace,
        parseTraceSearchQuery('status:error service:graph'),
        errorLocaleTime
      )
    ).toBe(true)
    expect(
      matchesTraceSearch(
        okTrace,
        parseTraceSearchQuery('status:error service:graph'),
        okLocaleTime
      )
    ).toBe(false)
  })

  it('matches timestamp values including locale time strings', () => {
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('2026-02-27'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(errorTrace, parseTraceSearchQuery('08:00:00 PM'), errorLocaleTime)).toBe(true)
    expect(matchesTraceSearch(okTrace, parseTraceSearchQuery('08:00:00 PM'), okLocaleTime)).toBe(false)
  })
})

describe('buildTraceSearchIndex', () => {
  it('includes all table-visible fields for fuzzy matching', () => {
    const index = buildTraceSearchIndex(errorTrace, errorLocaleTime)

    expect(index).toContain('error')
    expect(index).toContain('tr-d1a6f9')
    expect(index).toContain('/graph/query')
    expect(index).toContain('graph engine')
    expect(index).toContain('3200')
    expect(index).toContain('15 spans')
    expect(index).toContain('08:00:00 pm')
  })
})
