import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseSignOut = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signOut: supabaseSignOut,
    },
  }),
}))

describe('auth provider', () => {
  const ORIGINAL_ENV = process.env
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
    vi.stubGlobal('fetch', fetchMock)
    supabaseSignOut.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = ORIGINAL_ENV
  })

  it('returns supabase mode', async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = 'supabase'
    const { getAuthMode } = await import('@/lib/auth/provider')
    expect(getAuthMode()).toBe('supabase')
  })

  it('falls back to mock for invalid mode', async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = 'unknown'
    const { getAuthMode, getAuthProvider } = await import('@/lib/auth/provider')
    expect(getAuthMode()).toBe('mock')
    expect(getAuthProvider().mode).toBe('mock')
  })

  it('fetches snapshot in supabase mode', async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = 'supabase'
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: '1' }, workspaces: [], activeWorkspaceId: '1' }),
    })

    const { getAuthProvider } = await import('@/lib/auth/provider')
    const provider = getAuthProvider()
    const snapshot = await provider.getSnapshot()

    expect(snapshot.user.id).toBe('1')
  })

  it('throws with status on snapshot error', async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = 'supabase'
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
    })

    const { getAuthProvider } = await import('@/lib/auth/provider')
    const provider = getAuthProvider()
    await expect(provider.getSnapshot()).rejects.toMatchObject({ status: 401 })
  })

  it('signs out with supabase client', async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = 'supabase'
    const { getAuthProvider } = await import('@/lib/auth/provider')
    const provider = getAuthProvider()

    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined)
    await provider.signOut()

    expect(supabaseSignOut).toHaveBeenCalled()
    expect(assignSpy).toHaveBeenCalledWith('/login')
    assignSpy.mockRestore()
  })
})
