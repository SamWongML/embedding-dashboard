import { afterEach, describe, expect, it, vi } from 'vitest'

const originalMockFlag = process.env.NEXT_PUBLIC_USE_MOCK_DATA

afterEach(() => {
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = originalMockFlag
  vi.resetModules()
})

describe('resolveApiState', () => {
  it('returns api source on success', async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false'
    vi.resetModules()
    const { resolveApiState } = await import('@/lib/api/state')

    const result = await resolveApiState(
      async () => ({ ok: true }),
      async () => ({ ok: false })
    )

    expect(result).toEqual({
      data: { ok: true },
      error: null,
      source: 'api',
    })
  })

  it('throws when api fails and mock mode is disabled', async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false'
    vi.resetModules()
    const { resolveApiState } = await import('@/lib/api/state')

    await expect(
      resolveApiState(
        async () => {
          throw new Error('api down')
        },
        async () => ({ ok: false })
      )
    ).rejects.toThrow('api down')
  })

  it('returns mock source when api fails and mock mode is enabled', async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'
    vi.resetModules()
    const { resolveApiState } = await import('@/lib/api/state')

    const result = await resolveApiState(
      async () => {
        throw new Error('api down')
      },
      async () => ({ ok: false })
    )

    expect(result.source).toBe('mock')
    expect(result.data).toEqual({ ok: false })
    expect(result.error?.message).toBe('api down')
  })
})
