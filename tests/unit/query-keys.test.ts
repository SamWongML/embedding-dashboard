import { describe, expect, it } from 'vitest'
import { queryKeys, api } from '@/lib/api'

describe('queryKeys', () => {
  it('builds server status keys', () => {
    expect(queryKeys.serverStatus.all).toEqual(['server-status'])
    expect(queryKeys.serverStatus.health()).toEqual(['server-status', 'health'])
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
