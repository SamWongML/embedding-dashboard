import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const createBrowserClient = vi.fn()
const createServerClient = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createBrowserClient,
  createServerClient,
}))

const cookieStore = {
  get: vi.fn(() => ({ value: 'cookie-value' })),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}))

const ORIGINAL_ENV = process.env

describe('supabase clients', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
    createBrowserClient.mockReset()
    createServerClient.mockReset()
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('throws when supabase env is missing', async () => {
    const { getSupabaseBrowserClient } = await import('@/lib/supabase/client')
    expect(() => getSupabaseBrowserClient()).toThrow('Supabase environment variables are not configured.')
  })

  it('creates and caches browser client', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
    createBrowserClient.mockReturnValue({ id: 'client' })

    const { getSupabaseBrowserClient } = await import('@/lib/supabase/client')
    const first = getSupabaseBrowserClient()
    const second = getSupabaseBrowserClient()

    expect(first).toBe(second)
    expect(createBrowserClient).toHaveBeenCalledWith('http://localhost:54321', 'anon')
  })

  it('creates server client with cookie helpers', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
    createServerClient.mockImplementation((_url, _key, _options) => ({ id: 'server' }))
    createServerClient.mockReturnValue({ id: 'server' })

    const { getSupabaseServerClient } = await import('@/lib/supabase/server')
    const client = await getSupabaseServerClient()

    expect(client).toEqual({ id: 'server' })
    expect(createServerClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'anon',
      expect.objectContaining({ cookies: expect.any(Object) })
    )

    const cookiesOption = createServerClient.mock.calls[0]?.[2]?.cookies
    cookiesOption.set('token', 'value', {})
    cookiesOption.remove('token', {})
    expect(cookieStore.set).toHaveBeenCalled()
  })

  it('throws when server env is missing', async () => {
    const { getSupabaseServerClient } = await import('@/lib/supabase/server')
    await expect(getSupabaseServerClient()).rejects.toThrow(
      'Supabase environment variables are not configured.'
    )
  })

  it('creates middleware client with request cookies', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
    createServerClient.mockImplementation((_url, _key, _options) => ({ id: 'middleware' }))

    const { createSupabaseMiddlewareClient } = await import('@/lib/supabase/middleware')
    const request = { cookies: { get: vi.fn(() => ({ value: 'cookie' })) } }
    const response = { cookies: { set: vi.fn() } }
    const client = createSupabaseMiddlewareClient(request as any, response as any)

    expect(client).toEqual({ id: 'middleware' })
    expect(createServerClient).toHaveBeenCalled()
    const cookiesOption = createServerClient.mock.calls[0]?.[2]?.cookies
    cookiesOption.set('token', 'value', {})
    cookiesOption.remove('token', {})
    expect(response.cookies.set).toHaveBeenCalled()
  })
})
