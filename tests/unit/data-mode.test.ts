import { afterEach, describe, expect, it, vi } from 'vitest'

const originalDataMode = process.env.NEXT_PUBLIC_DATA_MODE

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_MODE = originalDataMode
  vi.resetModules()
})

describe('data mode', () => {
  it('defaults to api mode', async () => {
    delete process.env.NEXT_PUBLIC_DATA_MODE
    vi.resetModules()

    const { getDataMode } = await import('@/lib/runtime/data-mode')
    expect(getDataMode()).toBe('api')
  })

  it('uses demo mode when explicitly configured', async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'demo'
    vi.resetModules()

    const { getDataMode, isDemoDataMode } = await import('@/lib/runtime/data-mode')
    expect(getDataMode()).toBe('demo')
    expect(isDemoDataMode()).toBe(true)
  })

  it('falls back to api for unknown mode', async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'invalid'
    vi.resetModules()

    const { getDataMode } = await import('@/lib/runtime/data-mode')
    expect(getDataMode()).toBe('api')
  })
})
