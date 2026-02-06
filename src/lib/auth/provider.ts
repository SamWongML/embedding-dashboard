import type { AccountSnapshot } from '@/lib/types/account'
import { mockAccountSnapshot } from './mock'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type AuthMode = 'supabase' | 'mock'

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

  if (mode === 'supabase' || mode === 'mock') {
    return mode
  }

  return 'mock'
}

export function getAuthProvider(): AuthProvider {
  const mode = getAuthMode()

  if (mode === 'supabase') {
    return createSupabaseProvider()
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

function createSnapshotProvider(mode: AuthMode, signOutHandler: () => Promise<void>): AuthProvider {
  return {
    mode,
    getSnapshot: async () => {
      const response = await fetch('/api/account', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = new Error('Unable to fetch account snapshot.')
        ;(error as { status?: number }).status = response.status
        throw error
      }

      return response.json()
    },
    setActiveWorkspace: async (workspaceId: string) => {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeWorkspaceId: workspaceId }),
      })

      if (!response.ok) {
        const error = new Error('Unable to update workspace.')
        ;(error as { status?: number }).status = response.status
        throw error
      }
    },
    signOut: signOutHandler,
  }
}

function createSupabaseProvider(): AuthProvider {
  return createSnapshotProvider('supabase', async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.assign('/login')
  })
}
