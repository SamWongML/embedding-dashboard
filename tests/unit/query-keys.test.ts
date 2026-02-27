import { describe, expect, it } from 'vitest'
import { queryKeys, api } from '@/lib/api'

describe('queryKeys', () => {
  it('builds server status keys', () => {
    expect(queryKeys.serverStatus.all).toEqual(['server-status'])
    expect(queryKeys.serverStatus.health()).toEqual(['server-status', 'health'])
    const filters = {
      status: 'all',
      service: 'all',
      query: '',
      limit: 50,
    }
    expect(queryKeys.serverStatus.traces(filters)).toEqual([
      'server-status',
      'traces',
      filters,
    ])
    expect(queryKeys.serverStatus.traceSpans('tr-a8f3c2')).toEqual([
      'server-status',
      'trace-spans',
      'tr-a8f3c2',
    ])
  })

  it('builds graph keys', () => {
    expect(queryKeys.graph.node('node-1')).toEqual(['graph', 'node', 'node-1'])
  })

  it('builds users keys', () => {
    expect(queryKeys.users.detail('user-1')).toEqual(['users', 'detail', 'user-1'])
  })

  it('re-exports api client', () => {
    expect(api).toBeDefined()
  })
})
