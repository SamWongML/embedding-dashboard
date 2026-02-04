'use client'

import * as React from 'react'
import type { AccountSnapshot, WorkspaceSummary } from '@/lib/types/account'
import { getAuthProvider } from '@/lib/auth/provider'
import { mockAccountSnapshot } from '@/lib/auth/mock'

interface UseAccountResult extends AccountSnapshot {
  activeWorkspace: WorkspaceSummary
  setActiveWorkspace: (workspaceId: string) => void
  signOut: () => Promise<void>
}

export function useAccount(): UseAccountResult {
  const provider = React.useMemo(() => getAuthProvider(), [])
  const [snapshot, setSnapshot] = React.useState<AccountSnapshot>(mockAccountSnapshot)

  React.useEffect(() => {
    let active = true
    provider
      .getSnapshot()
      .then((data) => {
        if (active) {
          setSnapshot(data)
        }
      })
      .catch(() => {
        if (active) {
          setSnapshot(mockAccountSnapshot)
        }
      })

    return () => {
      active = false
    }
  }, [provider])

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

  return {
    ...snapshot,
    activeWorkspace,
    setActiveWorkspace,
    signOut,
  }
}
