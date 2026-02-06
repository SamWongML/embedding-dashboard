import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = process.env

describe('config links', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('returns null for empty values', async () => {
    process.env.NEXT_PUBLIC_DOCS_URL = '   '
    const { DOCS_URL } = await import('@/lib/config/links')
    expect(DOCS_URL).toBeNull()
  })

  it('returns trimmed values', async () => {
    process.env.NEXT_PUBLIC_SUPPORT_URL = ' https://example.com/support '
    const { SUPPORT_URL } = await import('@/lib/config/links')
    expect(SUPPORT_URL).toBe('https://example.com/support')
  })
})
