'use client'

import * as React from 'react'
import type { AccountSnapshot, WorkspaceSummary } from '@/lib/types/account'
import { getAuthProvider } from '@/lib/auth/provider'
import { mockAccountSnapshot } from '@/lib/auth/mock'

export type AccountStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface AccountContextValue extends AccountSnapshot {
  status: AccountStatus
  activeWorkspace: WorkspaceSummary
  setActiveWorkspace: (workspaceId: string) => void
  signOut: () => Promise<void>
}

const AccountContext = React.createContext<AccountContextValue | undefined>(undefined)

const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'true'

export function AccountProvider({
  children,
  initialSnapshot,
}: {
  children: React.ReactNode
  initialSnapshot?: AccountSnapshot | null
}) {
  const provider = React.useMemo(() => getAuthProvider(), [])
  const [snapshot, setSnapshot] = React.useState<AccountSnapshot>(
    () => initialSnapshot ?? mockAccountSnapshot
  )
  const [status, setStatus] = React.useState<AccountStatus>(() => {
    if (initialSnapshot) return 'authenticated'
    if (provider.mode === 'mock') return 'authenticated'
    return 'loading'
  })

  React.useEffect(() => {
    if (provider.mode === 'mock') {
      setSnapshot(mockAccountSnapshot)
      setStatus('authenticated')
      return
    }

    if (initialSnapshot) {
      setSnapshot(initialSnapshot)
      setStatus('authenticated')
      return
    }

    let active = true

    provider
      .getSnapshot()
      .then((data) => {
        if (!active) return
        setSnapshot(data)
        setStatus('authenticated')
      })
      .catch((error) => {
        if (!active) return
        const statusCode = (error as { status?: number })?.status

        if (statusCode === 401) {
          setStatus('unauthenticated')
          if (authRequired) {
            window.location.assign('/login')
            return
          }
          setSnapshot(mockAccountSnapshot)
          return
        }

        setStatus('error')
        setSnapshot(mockAccountSnapshot)
      })

    return () => {
      active = false
    }
  }, [initialSnapshot, provider])

  const setActiveWorkspace = React.useCallback(
    (workspaceId: string) => {
      setSnapshot((prev) => ({
        ...prev,
        activeWorkspaceId: workspaceId,
      }))
      void provider.setActiveWorkspace(workspaceId)
    },
    [provider]
  )

  const signOut = React.useCallback(async () => {
    await provider.signOut()
  }, [provider])

  const activeWorkspace = React.useMemo(() => {
    return (
      snapshot.workspaces.find((workspace) => workspace.id === snapshot.activeWorkspaceId) ||
      snapshot.workspaces[0]
    )
  }, [snapshot])

  const value = React.useMemo(
    () => ({
      ...snapshot,
      status,
      activeWorkspace,
      setActiveWorkspace,
      signOut,
    }),
    [snapshot, status, activeWorkspace, setActiveWorkspace, signOut]
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccountContext() {
  const context = React.useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
