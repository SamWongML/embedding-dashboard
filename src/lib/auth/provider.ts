import type { AccountSnapshot } from '@/lib/types/account'
import { mockAccountSnapshot } from './mock'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type AuthMode = 'supabase' | 'authjs' | 'mock'

export interface AuthProvider {
  mode: AuthMode
  getSnapshot: () => Promise<AccountSnapshot>
  setActiveWorkspace: (workspaceId: string) => Promise<void>
  signOut: () => Promise<void>
}

export function getAuthMode(): AuthMode {
  const mode =
    process.env.NEXT_PUBLIC_AUTH_MODE ||
    process.env.AUTH_MODE ||
    'mock'

  if (mode === 'supabase' || mode === 'authjs' || mode === 'mock') {
    return mode
  }

  return 'mock'
}

export function getAuthProvider(): AuthProvider {
  const mode = getAuthMode()

  if (mode === 'supabase') {
    return createSupabaseProvider()
  }

  if (mode === 'authjs') {
    return createAuthJsProvider()
  }

  return createMockProvider()
}

function createMockProvider(): AuthProvider {
  return {
    mode: 'mock',
    getSnapshot: async () => mockAccountSnapshot,
    setActiveWorkspace: async () => undefined,
    signOut: async () => undefined,
  }
}

function createSupabaseProvider(): AuthProvider {
  return {
    mode: 'supabase',
    getSnapshot: async () => {
      const response = await fetch('/api/account', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Unable to fetch account snapshot.')
      }

      return response.json()
    },
    setActiveWorkspace: async (workspaceId: string) => {
      await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeWorkspaceId: workspaceId }),
      })
    },
    signOut: async () => {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      window.location.assign('/login')
    },
  }
}

function createAuthJsProvider(): AuthProvider {
  return {
    mode: 'authjs',
    getSnapshot: async () => mockAccountSnapshot,
    setActiveWorkspace: async () => undefined,
    signOut: async () => undefined,
  }
}
