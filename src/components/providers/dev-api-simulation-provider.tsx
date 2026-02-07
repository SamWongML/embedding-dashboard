'use client'

import * as React from 'react'
import { isApiDataMode } from '@/lib/runtime/data-mode'
import {
  type DevApiScenario,
  resolveDevApiScenario,
} from '@/lib/runtime/dev-api-scenario'

const DevApiSimulationContext = React.createContext<DevApiScenario>('off')

interface DevApiSimulationProviderProps {
  children: React.ReactNode
}

export function DevApiSimulationProvider({
  children,
}: DevApiSimulationProviderProps) {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const supportsSimulation = isDevelopment && isApiDataMode()
  const [resolvedScenario, setResolvedScenario] = React.useState<DevApiScenario>('off')
  const [activeScenario, setActiveScenario] = React.useState<DevApiScenario>('off')

  React.useEffect(() => {
    if (!supportsSimulation) {
      setResolvedScenario('off')
      setActiveScenario('off')
      return
    }

    const updateFromLocation = () => {
      setResolvedScenario(
        resolveDevApiScenario({
          search: window.location.search,
        })
      )
    }

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    const notifyLocationChange = () => {
      window.dispatchEvent(new Event('codex:locationchange'))
    }

    window.history.pushState = function patchedPushState(...args) {
      originalPushState.apply(window.history, args)
      notifyLocationChange()
    }

    window.history.replaceState = function patchedReplaceState(...args) {
      originalReplaceState.apply(window.history, args)
      notifyLocationChange()
    }

    updateFromLocation()
    window.addEventListener('popstate', updateFromLocation)
    window.addEventListener('codex:locationchange', updateFromLocation)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', updateFromLocation)
      window.removeEventListener('codex:locationchange', updateFromLocation)
    }
  }, [supportsSimulation])

  React.useEffect(() => {
    if (!supportsSimulation) {
      return
    }

    let active = true

    const applyScenario = async () => {
      const {
        startMockWorker,
        stopMockWorker,
      } = await import('@/mocks/msw/browser')

      if (!active) {
        return
      }

      if (resolvedScenario === 'off') {
        await stopMockWorker()
        if (active) {
          setActiveScenario('off')
        }
        return
      }

      await startMockWorker(resolvedScenario)
      if (active) {
        setActiveScenario(resolvedScenario)
      }
    }

    void applyScenario().catch(() => {
      if (active) {
        setActiveScenario('off')
      }
    })

    return () => {
      active = false
    }
  }, [resolvedScenario, supportsSimulation])

  return (
    <DevApiSimulationContext.Provider
      value={supportsSimulation ? activeScenario : 'off'}
    >
      {children}
    </DevApiSimulationContext.Provider>
  )
}

export function useDevApiSimulationScenario() {
  return React.useContext(DevApiSimulationContext)
}
