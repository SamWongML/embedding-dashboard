import { describe, expect, it } from 'vitest'
import { mockAccountSnapshot } from '@/lib/auth/mock'

describe('mock account snapshot', () => {
  it('has a user and workspaces', () => {
    expect(mockAccountSnapshot.user.id).toBeTruthy()
    expect(mockAccountSnapshot.workspaces.length).toBeGreaterThan(0)
  })
})
